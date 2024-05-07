import fs from "fs";
import { buildContentFilePath } from "../util/utils.js";

export default async function checkIfFileExists(file_path) {
  if (!file_path) {
    return {
      error: true,
      message: "Filename is required",
    };
  }

  if (file_path.includes("..")) {
    return {
      error: true,
      message: "Relative paths are not allowed",
    };
  }

  try {
    const current_path = fs.realpathSync(buildContentFilePath(file_path));
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
