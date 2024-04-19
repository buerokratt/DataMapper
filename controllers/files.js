import express from "express";
import checkIfFileExists from "../js/file/exists.js";
import createFile from "../js/file/create.js";
import moveFile from "../js/file/move.js";
import copyFile from "../js/file/copy.js";
import deleteFile from "../js/file/delete.js";
import readFile from "../js/file/read.js";
import readFullFile from "../js/file/read-file.js";
import editFile from "../js/file/edit.js";
import deleteAllThatStartsWith from "../js/file/delete-all-that-starts-with.js";
import deleteAllThatContains from "../js/file/delete-all-that-contains.js";
import merge from "../js/file/merge.js";
import readFileDir from "../js/file/read-file-dir.js";

const router = express.Router();

router.post("/exists", async (req, res) => {
  const result = await checkIfFileExists(req.body.file_path, req.body.content);
  return res.status(result.error ? 400 : 200).json(result);
});

router.post("/create", async (req, res) => {
  const result = await createFile(req.body.file_path, req.body.content);
  return res.status(result.error ? 400 : 200).json(result);
});

router.post("/move", async (req, res) => {
  const result = await moveFile(req.body.file_path, req.body.new_path);
  return res.status(result.error ? 400 : 200).json(result);
});

router.post("/copy", async (req, res) => {
  const result = await copyFile(req.body.file_path, req.body.new_path);
  return res.status(result.error ? 400 : 200).json(result);
});

router.post("/delete", async (req, res) => {
  const result = await deleteFile(req.body.file_path);
  return res.status(result.error ? 400 : 200).json(result);
});

router.post("/read", async (req, res) => {
  const result = await readFile(req.body.file_path);
  return res.status(result.error ? 400 : 200).json(result);
});

router.post("/read-file-dir", async (req, res) => {
  const result = await readFileDir(req.body.file_path);
  return res.status(result.error ? 400 : 200).json(result);
});

router.post("/edit", async (req, res) => {
  const result = await editFile(req.body.file_path, req.body.from, req.body.to);
  return res.status(result.error ? 400 : 200).json(result);
});

router.post("/delete-all-that-starts-with", async (req, res) => {
  await deleteAllThatStartsWith(req.body.path, req.body.keyword, res);
});

router.post("/delete-all-that-contains", async (req, res) => {
  await deleteAllThatContains(req.body.path, req.body.keyword, res);
});

router.post("/read-file", async (req, res) => {
  await readFullFile(req.body.file_path, res);
});

router.post("/merge", async (req, res) => {
  const result = await merge(req.body);
  return res.status(result.error ? 400 : 200).json(result);
});

export default router;
