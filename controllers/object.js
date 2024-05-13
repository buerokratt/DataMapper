import express from "express";
import { body, matchedData, validationResult } from "express-validator";

const router = express.Router();

router.post(
  "/rules/remove-by-intent-name",
  [
    body("rulesJson")
      .isArray()
      .withMessage("rulesJson is required and must be an array"),
    body("searchIntentName")
      .isString()
      .withMessage("searchIntentName is required and must be a string"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rulesJson, searchIntentName } = matchedData(req);

    if (!/^[0-9a-zA-Z-._/]+$/.test(searchIntentName)) {
      return res
        .status(400)
        .send({ error: "Search intent name contains illegal characters" });
    }

    const strRegExPattern = ".*\\b" + searchIntentName + "\\b.*";
    const regExp = new RegExp(strRegExPattern);

    const result = rulesJson
      .map((entry) => {
        const containsSearchTerm = regExp.test(JSON.stringify(entry));
        if (!containsSearchTerm) return entry;
      })
      .filter((value) => value);

    return res.status(200).send({ result });
  }
);

router.post("/replace/key-value-in-obj", async (req, res) => {
  let { object, oldKey, newKey, newValue } = req.body;

  const result = Object.entries(object).reduce((acc, [key, value]) => {
    if (key === oldKey) {
      acc[newKey] = newValue;
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});

  res.json(result);
});

router.post(
  "/array/replace-next-element",
  [
    body("array")
      .isArray()
      .withMessage("array is required and must be an array"),
    body("element")
      .isString()
      .withMessage("element is required and must be a string"),
    body("newInput")
      .isNumeric()
      .withMessage("newInput is required and must be a number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { array, element, newInput } = matchedData(req);

    const index = array.indexOf(element);

    if (index !== -1 && index < array.length - 1) {
      array[index + 1] = newInput.toString();
    }

    return res.status(200).send({ array });
  }
);

export default router;
