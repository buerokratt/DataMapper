import express from 'express';
import path from 'path';
import fs from 'fs';
import replace from 'replace-in-file';
import { buildContentFilePath, isValidFilename } from '../util/utils.js';

const router = express.Router();

router.post('/create', (req, res) => {
  const filename = buildContentFilePath(req.body.file_path)
  const content = req.body.content

  if (!filename || !content) {
    res.status(400).json({ message: 'Filename and content are required' });
    return;
  }

  if (!isValidFilename(filename) || path.normalize(filename).includes('..')) {
    res.status(400).json({ message: 'Filename contains illegal characters' });
    return;
  }

  fs.writeFile(filename, content, (err) => {
    if (err) {
      res.status(500).json({ message: 'Unable to create file' });
      return;
    }

    res.status(201).json({ message: 'File created successfully' });
    return;
  });
});

router.post('/move', async (req, res) => {
  const currentPath = buildContentFilePath(req.body.current_path)
  const newPath = buildContentFilePath(req.body.new_path)

  if (!currentPath || !newPath) {
    res.status(400).json({ message: 'current path and new path are required' });
    return;
  }

  if (!isValidFilename(currentPath) || path.normalize(currentPath).includes('..')) {
    res.status(400).json({ message: 'current contains illegal characters' });
    return;
  }

  fs.mkdir(path.dirname(newPath), () => {});

  fs.rename(currentPath, newPath, function (err) {
    if (err) {
      res.status(500).json({ message: 'Unable to move file' });
      return;
    }

    res.status(200).json({ message: 'File moved successfully' });
    return;
  })
});

router.post('/copy', async (req, res) => {
  const currentPath = buildContentFilePath(req.body.current_path)
  const newPath = buildContentFilePath(req.body.new_path)

  if (!currentPath || !newPath) {
    res.status(400).json({ message: 'current path and new path are required' });
    return;
  }

  if (!isValidFilename(currentPath) || path.normalize(currentPath).includes('..')) {
    res.status(400).json({ message: 'current contains illegal characters' });
    return;
  }

  fs.mkdir(path.dirname(newPath), () => {});

  fs.copyFile(currentPath, newPath, function (err) {
    if (err) {
      res.status(500).json({ message: 'Unable to copy file' });
      return;
    }

    res.status(200).json({ message: 'File copied successfully' });
    return;
  })
});

router.post('/delete', async (req, res) => {
  const filePath = buildContentFilePath(req.body.path)

  if (!filePath) {
    res.status(400).json({ message: 'Path is required' });
    return;
  }

  if (!isValidFilename(filePath) || path.normalize(filePath).includes('..')) {
    res.status(400).json({ message: 'current contains illegal characters' });
    return;
  }

  fs.unlink(filePath, function (err) {
    if (err) {
      res.status(500).json({ message: 'Unable to delete file' });
      return;
    }

    res.status(200).json({ message: 'File deleted successfully' });
    return;
  })
});

router.post('/read', async (req, res) => {
  const filePath = buildContentFilePath(req.body.path)

  if (!filePath) {
    res.status(400).json({ message: 'Path is required' });
    return;
  }

  if (!isValidFilename(filePath) || path.normalize(filePath).includes('..')) {
    res.status(400).json({ message: 'current contains illegal characters' });
    return;
  }

  fs.readFile(filePath, {encoding:'utf8', flag:'r'}, function (err, data) {
    if (err) {
      res.status(500).json({ message: 'Unable to read file' });
      return;
    }

    res.status(200).json({data});
    return;
  })
});

router.post('/edit', async (req, res) => {
  const filePath = buildContentFilePath(req.body.path)
  const from = req.body.from
  const to = req.body.to

  if (!filePath) {
    res.status(400).json({ message: 'Path is required' });
    return;
  }

  if (!isValidFilename(filePath) || path.normalize(filePath).includes('..')) {
    res.status(400).json({ message: 'current contains illegal characters' });
    return;
  }

  const options = {
    files: filePath,
    from: from,
    to: to,
  };

  replace(options, (err) => {
    if (err) {
      res.status(500).json({ message: 'Unable to edit file' });
      return;
    }

    res.status(200).json({ message: 'File edited successfully' });
  });
});

export default router;
