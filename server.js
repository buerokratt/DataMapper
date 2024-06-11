import express from "express";
import { create, engine } from "express-handlebars";
import setRateLimit from "express-rate-limit";
import { body, matchedData, validationResult } from "express-validator";
import jsdom from "jsdom";
const { JSDOM } = jsdom;
import secrets from "./controllers/secrets.js";
import fs from "fs";
import files from "./controllers/files.js";
import crypto from "crypto";
import bodyParser from "body-parser";

import encryption from "./controllers/encryption.js";
import decryption from "./controllers/decryption.js";
import * as path from "path";
import { fileURLToPath } from "url";

import sendMockEmail from "./js/email/sendMockEmail.js";
import { generatePdf } from "./js/generate/pdf.js";
import { generatePdfToBase64 } from "./js/generate/pdfToBase64.js";
import { generateHTMLTable } from "./js/convert/pdf.js";
import * as helpers from "./lib/helpers.js";
import { parseBoolean } from "./js/util/utils.js";
import conversion from "./controllers/conversion.js";
import ruuter from "./controllers/ruuter.js";
import merge from "./controllers/merge.js";
import mergeYaml from "./js/file/mergeYaml.js";
import cron from "./controllers/cron.js";
import object from "./controllers/object.js";
import validate from "./controllers/validate.js";
import utils from "./controllers/utils.js";
import domain from "./controllers/domain.js";
import forms from "./controllers/forms.js";
import { requestLoggerMiddleware } from "./lib/requestLoggerMiddleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

const hbs = create({ helpers });

const PORT = process.env.PORT || 3000;
const app = express().disable("x-powered-by");
const rateLimit = setRateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many requests",
  headers: true,
  statusCode: 429,
});

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(requestLoggerMiddleware({ logger: console.log }));

app.use(express.json());
app.use("/file-manager", files);
app.use("/conversion", conversion);
app.use("/ruuter", ruuter);
app.use("/merge", merge);
app.use("/mergeYaml", mergeYaml);
app.use("/cron", cron);
app.use("/object", object);
app.use("/validate", validate);
app.use("/utils", utils);
app.use("/domain", domain);
app.use("/forms", forms);
app.use(express.urlencoded({ extended: true }));
app.use(
  "/encryption",
  encryption({
    publicKey: publicKey,
    privateKey: privateKey,
  })
);
app.use(
  "/decryption",
  decryption({
    publicKey: publicKey,
    privateKey: privateKey,
  })
);

const handled = (controller) => async (req, res, next) => {
  try {
    await controller(req, res);
  } catch (error) {
    return next(error.message);
  }
};

const EXTENSION = process.env.EXTENSION || ".handlebars";

app.engine(
  ".handlebars",
  engine({
    layoutsDir: path.join(__dirname, "views/layouts"),
  })
);

app.engine(".hbs", hbs.engine);

app.set("views", ["./views", "./module/*/hbs/"]);

app.use("/secrets", secrets);

app.get(
  "/",
  handled(async (req, res, next) => {
    res.render(__dirname + "/views/home.handlebars", { title: "Home" });
  })
);

const handleRender = (req, res, templatePath) => {
  res.render(templatePath, { ...req.body, helpers }, (err, response) => {
    if (err) console.log("err:", err);
    if (req.get("type") === "csv") {
      res.json({ response });
    } else if (req.get("type") === "json") {
      if (response === undefined) {
        res.json({
          error: `There was an error executing ${templatePath}`,
        });
      } else {
        res.json(JSON.parse(response));
      }
    } else {
      res.send(response);
    }
  });
};

app.post(
  "/hbs/*",
  rateLimit,
  handled(async (req, res) => {
    const normalizedParams = path
      .normalize(req.params[0])
      .replace(/^(\.\.(\/|\\|$))+/, "");
    const templatePath =
      __dirname + "/views/" + normalizedParams + ".handlebars";
    handleRender(req, res, templatePath);
  })
);

app.post(
  "/:project/hbs/*",
  handled(async (req, res) => {
    const project = req.params["project"];
    const normalizedParams = path
      .normalize(req.params[0])
      .replace(/^(\.\.(\/|\\|$))+/, "");
    const templatePath =
      __dirname + "/module/" + project + "/hbs/" + normalizedParams + EXTENSION;
    handleRender(req, res, templatePath);
  })
);

app.post(
  "/js/convert/pdf",
  [
    body("messages")
      .isArray()
      .withMessage("messages is required and must be an array"),
    body("csaTitleVisible")
      .isString()
      .withMessage("csaTitleVisible is required and must be a string"),
    body("csaNameVisible")
      .isString()
      .withMessage("csaNameVisible is required and must be a string"),
  ],
  rateLimit,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { messages, csaTitleVisible, csaNameVisible } = matchedData(req);

    const template = fs
      .readFileSync(__dirname + "/views/pdf.handlebars")
      .toString();
    const dom = new JSDOM(template);

    generateHTMLTable(
      dom.window.document.getElementById("chatHistoryTable"),
      messages,
      parseBoolean(csaTitleVisible),
      parseBoolean(csaNameVisible)
    );
    generatePdfToBase64(dom.window.document.documentElement.innerHTML, res);
  }
);

app.post("/js/generate/pdf", (req, res) => {
  const filename = req.body.filename;
  const template = req.body.template;

  generatePdf(filename, template, res);
});

app.get("/js/*", rateLimit, (req, res) => {
  const normalizedPath = path
    .normalize(req.path)
    .replace(/^(\.\.(\/|\\|$))+/, "");
  const resolvedPath = path.join(__dirname, normalizedPath + ".js");
  res.contentType("text/plain").send(fs.readFileSync(resolvedPath).toString());
});

// NOTE: This service is only for testing purposes. Needs to be replaced with actual mail service.
app.post("/js/email/*", (req, res) => {
  const { to, subject, text } = req.body;
  try {
    sendMockEmail(to, subject, text);
    res.contentType("text/plain").send(`email sent to: ${to}`);
  } catch (err) {
    res.errored(err);
  }
});

app.post("/example/post", (req, res) => {
  console.log(`POST endpoint received ${JSON.stringify(req.body)}`);
  res.status(200).json({ message: `received value ${req.body.name}` });
});

app.get("/status", (req, res) => res.status(200).send("ok"));

app.listen(PORT, () => {
  console.log("Nodejs server running on http://localhost:%s", PORT);
});
