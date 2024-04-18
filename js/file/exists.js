import fs from "fs";
import { buildContentFilePath, isValidFilePath } from "../util/utils.js";

export default async function checkIfFileExists(file_path) {
  if (!isValidFilePath(file_path)) {
    return {
      error: true,
      message: "path contains illegal characters",
    };
  }

  try {
    const current_path = buildContentFilePath(file_path);
    fs.accessSync(current_path, fs.constants.F_OK);
    return {
      error: false,
      message: "File Exists",
    };
  } catch (err) {
    return {
      error: true,
      message: "File Does Not Exist",
    };
  }
}
