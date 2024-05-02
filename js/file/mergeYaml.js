import express from "express";

import fs from "fs";
import path from "path";
import * as yaml from "js-yaml";

const router = express.Router();

function mergeYamlFiles(dirPath) {
  const mergedDocuments = { version: "3.0" };

  traverseFolder(dirPath, mergedDocuments);

  return yaml.dump(mergedDocuments, { noArrayIndent: true });
}

function traverseFolder(currentPath, mergedDocuments) {
  const items = fs.readdirSync(currentPath);

  for (const item of items) {
    const itemPath = path.join(currentPath, item);

    if (fs.statSync(itemPath).isFile()) {
      if ([".yaml", ".yml"].includes(path.extname(itemPath).toLowerCase())) {
        const yamlContent = fs.readFileSync(itemPath, "utf8");
        const parsedYaml = yaml.load(yamlContent);
        if (!parsedYaml) continue;

        mergeYamlObjects(mergedDocuments, parsedYaml);
      }
    } else {
      traverseFolder(itemPath, mergedDocuments);
    }
  }
}

function mergeYamlObjects(mergedDocObj, parsedYamlObj) {
  for (const yamlKey of Object.keys(parsedYamlObj)) {
    if (yamlKey === "version") {
      continue;
    }

    if (mergedDocObj[yamlKey] === undefined) {
      mergedDocObj[yamlKey] = parsedYamlObj[yamlKey];
    } else {
      mergedDocObj[yamlKey].push(...parsedYamlObj[yamlKey]);
    }
  }
}

router.post("/", (req, res) => {
  const mergedYaml = mergeYamlFiles(req.body.file_path);
  res.setHeader("Content-Type", "text/plain");
  res.send(mergedYaml);
});

export default router;
