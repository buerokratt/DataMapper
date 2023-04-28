import express from "express";
import { create } from "express-handlebars";
import fs from "fs";

import * as path from "path";
import { fileURLToPath } from "url";
import sendMockEmail from "./js/email/sendMockEmail.js";
import { generatePdf } from "./js/generate/pdf.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = 3000;
const app = express();
const hbs = create({});
app.use(express.json());

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
  const filename = "chat-history";
  const template = fs
    .readFileSync(__dirname + "/views/pdf.handlebars")
    .toString();

  generatePdf(filename, template, res)
});

app.post("/js/generate/pdf", (req, res) => {
  const filename = req.body.filename;
  const template = req.body.template;

  generatePdf(filename, template, res)
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
