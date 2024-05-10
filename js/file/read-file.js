import fs from "fs";
import { buildContentFilePath } from "../util/utils.js";
import mime from "mime-types";

export default async function readFile(file_path, res) {
  const filePath = buildContentFilePath(file_path);

  if (!filePath) {
    res.status(400).contentType("text/plain").send("File path is required");
    return;
  }

  if (filePath.includes("..")) {
    res
      .status(400)
      .contentType("text/plain")
      .send("Relative paths are not allowed");
    return;
  }
  const mimeType = mime.lookup(filePath);
  const name = filePath.split(/[\\/]/g).pop();

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      res.status(404).send("File not found");
      return;
    }
    const file = Buffer.from(data).toString("base64");

    res.setHeader("Content-Type", "application/json");

    const result = {
      name: name,
      file: file,
      mimeType: mimeType,
    };
    res.json(result);
  });
}
