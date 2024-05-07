import express from "express";
import { create } from "express-handlebars";
import jsdom from "jsdom";
const { JSDOM } = jsdom;
import secrets from "./controllers/secrets.js";
import fs from "fs";
import files from "./controllers/files.js";
import crypto from "crypto";

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
import cron from "./controllers/cron.js";
import docker from "./controllers/docker.js";
import object from "./controllers/object.js";
import validate from "./controllers/validate.js";
import utils from "./controllers/utils.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

const PORT = process.env.PORT || 3000;
const app = express();
const hbs = create({ helpers });
app.use(express.json());
app.use("/file-manager", files);
app.use("/conversion", conversion);
app.use("/ruuter", ruuter);
app.use("/merge", merge);
app.use("/cron", cron);
app.use("/docker", docker);
app.use("/object", object);
app.use("/validate", validate);
app.use("/utils", utils);
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

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./views");
app.use("/secrets", secrets);
app.get("/", (req, res) => {
  res.render("home", { title: "Home" });
});

app.post("/hbs/*", (req, res) => {
  res.render(req.params[0], req.body, function (_, response) {
    if (req.get("type") === "csv") {
      res.json({ response });
    } else if (req.get("type") === "json") {
      res.json(JSON.parse(response));
    }
  });
});

app.post("/js/convert/pdf", (req, res) => {
  const template = fs
    .readFileSync(__dirname + "/views/pdf.handlebars")
    .toString();
  const dom = new JSDOM(template);

  const { messages, csaTitleVisible, csaNameVisible } = req.body;

  generateHTMLTable(
    dom.window.document.getElementById("chatHistoryTable"),
    messages,
    parseBoolean(csaTitleVisible),
    parseBoolean(csaNameVisible)
  );
  generatePdfToBase64(dom.window.document.documentElement.innerHTML, res);
});

app.post("/js/generate/pdf", (req, res) => {
  const filename = req.body.filename;
  const template = req.body.template;

  generatePdf(filename, template, res);
});

app.get("/js/*", (req, res) => {
  const resolvedPath = fs.realpathSync(path.join(__dirname, req.path + ".js"));
  res.send(fs.readFileSync(resolvedPath).toString());
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
