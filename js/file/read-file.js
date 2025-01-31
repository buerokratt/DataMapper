import fs from "fs";
import mime from "mime-types";

export default function readFile(file_path) {
  return new Promise((resolve, reject) => {
    if (!file_path) {
      reject({ status: 400, message: "File path is required" });
      return;
    }

    if (file_path.includes("..")) {
      reject({ status: 400, message: "Relative paths are not allowed" });
      return;
    }

    const mimeType = mime.lookup(file_path);
    const name = file_path.split(/[\\/]/g).pop();

    const stream = fs.createReadStream(file_path, { encoding: "utf8" });
    let file = "";

    stream.on("error", (err) => {
      reject({ status: 404, message: "File not found" });
    });

    stream.on("data", (chunk) => {
      file += chunk;
    });

    stream.on("end", () => {
      const fileBase64 = Buffer.from(file).toString("base64");

      const result = {
        name: name,
        file: fileBase64,
        mimeType: mimeType,
      };
      resolve(result);
    });
  });
}
