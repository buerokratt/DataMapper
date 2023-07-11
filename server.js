import express from "express";
import { create } from "express-handlebars";
import * as html_to_pdf from "html-pdf-node";
import secrets from "./controllers/secrets.js";
import fs from "fs";
import files from "./controllers/files.js";
import * as helpers from "./lib/helpers.js";
import * as path from "path";
import { fileURLToPath } from "url";
import sendMockEmail from "./js/email/sendMockEmail.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3000;
const app = express();
const hbs = create({ helpers });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/file-manager", files);

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
  console.log(`POST endpoint received ${JSON.stringify(req.body)}`);
  res.status(200).json({ message: `received value ${req.body.name}` });
});

app.listen(PORT, () => {
  console.log("Nodejs server running on http://localhost:%s", PORT);
});
