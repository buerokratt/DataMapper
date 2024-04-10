import express from "express";
import { create } from "express-handlebars";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

import fs from "fs";

import crypto from "crypto";

import encryption from "./controllers/encryption.js";
import decryption from "./controllers/decryption.js";
import secrets from "./controllers/secrets.js";
import files from "./controllers/files.js";

import * as path from "path";
import { fileURLToPath } from "url";

import sendMockEmail from "./js/email/sendMockEmail.js";
import { generatePdf } from "./js/generate/pdf.js";
import { generatePdfToBase64 } from "./js/generate/pdfToBase64.js";
import { generateHTMLTable } from "./js/convert/pdf.js";

import 'dotenv/config';

import * as helpers from "./lib/helpers.js";

import { engine } from 'express-handlebars';

import fileRead from "./js/file/fileRead.js";
import fileReadDir from "./js/file/fileReadDir.js";
import fileWrite from "./js/file/fileWrite.js";
import fileDelete from "./js/file/delete.js";
import deleteIntentFile from "./js/file/deleteIntentFile.js";
import fileCheck from "./js/file/fileCheck.js";
import merge from "./js/util/merge.js";
import mergeObjects from "./js/util/mergeObjects.js";
import mergeRemoveKey from "./js/util/mergeRemoveKey.js";
import mergeRemoveArrayValue from "./js/util/mergeRemoveArrayValue.js";
import mergeReplaceArrayElement from "./js/util/mergeReplaceArrayElement.js";
import validate from "./js/util/arrayElementsLength.js";
import yamlToJson from "./js/convert/yamlToJson.js";
import jsonToYaml from "./js/convert/jsonToYaml.js";
import csvToJson from "./js/convert/csvToJson.js";
import stringSplit from "./js/util/stringSplit.js";
import stringToArray from "./js/util/stringToArray.js";
import stringReplace from "./js/util/stringReplace.js";
import removeRulesByIntentName from "./js/util/removeRulesByIntentName.js";
import domainUpdateExistingResponse from "./js/util/domainUpdateExistingResponse.js";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

const hbs = create({ helpers });

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use("/file-manager", files);
app.use('/file/read', fileRead);
app.use('/file/read-directory', fileReadDir);
app.use('/file/write', fileWrite);
app.use('/file/delete', fileDelete);
app.use('/file/delete-intent', deleteIntentFile);
app.use('/file/check', fileCheck);
app.use('/merge', merge);
app.use('/merge/objects', mergeObjects);
app.use('/merge/remove-key', mergeRemoveKey);
app.use('/merge/remove-array-value', mergeRemoveArrayValue);
app.use('/merge/replace-array-element', mergeReplaceArrayElement);
app.use('/validate/array-elements-length', validate);
app.use('/convert/yaml-to-json', yamlToJson)
app.use('/convert/json-to-yaml', jsonToYaml)
app.use('/convert/csv-to-json', csvToJson)
app.use('/convert/string/split', stringSplit)
app.use('/convert/string/replace', stringReplace)
app.use('/convert/string/toArray', stringToArray)
app.use('/rules/remove-by-intent-name', removeRulesByIntentName);
app.use('/domain/update-existing-response', domainUpdateExistingResponse)

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
    await controller(req,res);
  } catch (error) {
    return next(error.message);
  }
 }

const EXTENSION = process.env.EXTENSION || ".handlebars";

app.engine(".handlebars", engine({
  layoutsDir: path.join(__dirname, 'views/layouts')
}));

app.engine(".hbs",  hbs.engine);

app.set("view engine", "handlebars");

app.set("views", ["./views", "./module/*/hbs/", "./module/*/"]);

app.use("/secrets", secrets);

app.get("/", handled( async (req, res, next) => {
  res.render(__dirname + "/views/home.handlebars", { title: "Home" });
}));

app.get("/healthz", handled( async (req, res, next) => {
  let status = {
      appName: app.name,
      version: process.env.RELEASE + "-" + process.env.VERSION + "." + process.env.BUILD + "." + process.env.FIX,
      packagingTime: process.env.BUILDTIME,
      appStartTime: _appStartTime,
      serverTime: Date.now()
  };
  res.send(status);
}));

app.post("/hbs/*", handled( async (req, res) => {
  var path = __dirname + "/views/"+req.params[0]+".handlebars";
  res.render(path, req.body, function (err, response) {
    if (err) console.log("err:", err);
    if (req.get("type") === "csv") {
      res.json({ response });
    } else if (req.get("type") === "json") {
      res.json(JSON.parse(response));
    } else {
      res.send(response);
    }
  });
}));

app.post("/:project/hbs/*", handled (async (req, res) => {
  var project = req.params["project"]; 
  var path = __dirname + "/module/" + project + "/hbs/" + req.params[0] + EXTENSION;
  // var path = req.params[0] + EXTENSION;
  res.render(path, req.body, function (err, response) {
    if (err) console.log("err:", err);
    if (req.get("type") === "csv") {
      res.json({ response });
    } else if (req.get("type") === "json") {
      res.json(JSON.parse(response));
    } else {
      res.send(response);
    }
  });
}));

app.post("/js/convert/pdf", (req, res) => {
  const filename = "chat-history";
  const template = fs
    .readFileSync(__dirname + "/views/pdf.handlebars")
    .toString();
  const dom = new JSDOM(template);
  generateHTMLTable(
    req.body.data,
    dom.window.document.getElementById("chatHistoryTable")
  );
  generatePdfToBase64(dom.window.document.documentElement.innerHTML, res);
});

app.post("/js/generate/pdf", (req, res) => {
  const filename = req.body.filename;
  const template = req.body.template;

  generatePdf(filename, template, res);
});

app.get("/js/*", (req, res) => {
  res.send(fs.readFileSync(__dirname + req.path + ".js").toString());
});

// NOTE: This service is only for testing purposes. Needs to be replaced with actual mail service.
app.post("/js/email/*", (req, res) => {
  const { to, subject, text } = req.body;
  try {
    sendMockEmail(to, subject, text);
    res.send(`email sent to: ${to}`);
  } catch (err) {
    res.errored(err);
  }
});

app.post("/example/post", (req, res) => {
  console.log(`POST endpoint received ${JSON.stringify(req.body)}`);
  res.status(200).json({ message: `received value ${req.body.name}` });
});

app.listen(PORT, () => {
  console.log("Nodejs server running on http://localhost:%s", PORT);
});

var _appStartTime = Date.now();
