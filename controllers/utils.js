import express from "express";
import { createHash } from "crypto";
import bodyParser from "body-parser";
import { body, matchedData, validationResult } from "express-validator";

const router = express.Router();

router.post(
  "/increase-double-digit-version",
  [body("version").isString().withMessage("version must be a string")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { version } = matchedData(req);
    const splitVersion = version.split("_");
    const majorV = splitVersion[0];
    let minorV = parseInt(splitVersion[1]);
    minorV += 1;
    res.json(`${majorV}_${minorV}`);
  }
);

router.post("/object-list-contains-id", async (req, res) => {
  const { id, list } = req.body;
  const exists = checkIdExists(list, id);
  res.json(exists);
});

router.post(
  "/calculate-sha256-checksum",
  bodyParser.text({ type: "text/plain" }),
  async (req, res) => {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json("error: request body is empty");
    }
    const hash = createHash("sha256");
    hash.update(req.body);
    res.send(hash.digest("hex"));
  }
);

function checkIdExists(array, id) {
  for (const element of array) {
    if (element.id === id) return true;
  }
  return false;
}

export default router;
