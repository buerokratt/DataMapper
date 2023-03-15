import express from "express";
import { create } from "express-handlebars";
import * as html_to_pdf from "html-pdf-node";
import fs from "fs";
import file from './js/file/file-manager.js';

import * as path from "path";
import { fileURLToPath } from "url";
import sendMockEmail from "./js/email/sendMockEmail.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = 3000;
const app = express();
const hbs = create({});
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use('/js/file', file);

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./views");

app.get("/", (req, res) => {
  res.render("home", { title: "Home" });
});

app.get("/hbs/*", (req, res) => {
  res.render(req.params[0]);
});

app.get("/js/convert/pdf", (req, res) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=chat-history.pdf");
  const template = fs
    .readFileSync(__dirname + "/views/pdf.handlebars")
    .toString();
  let file = { content: template };
  let options = { format: "A4" };

  html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
    res.send(pdfBuffer);
  });
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
    const { name } = req.body;
    res.writeHead(200, {'Content-Type': 'application/json'});
    console.log("POST endpoint received "+JSON.stringify(req.body));
    let resJson = "{\"message\": \"received value "+name+"\"}";
    res.end(resJson);
})

app.listen(PORT, () => {
  console.log("Nodejs server running on http://localhost:%s", PORT);
});
