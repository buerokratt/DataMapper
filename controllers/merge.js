import express from "express";
import { body, matchedData, validationResult } from "express-validator";

const router = express.Router();

router.post("/objects", async (req, res) => {
  const { object1, object2 } = req.body;

  if (!object1 || !object2) {
    res.status(400).contentType("text/plain").send("Both objects are required");
    return;
  }

  res.json({ ...object1, ...object2 });
});

router.post("/remove-key", async (req, res) => {
  const { object, key } = req.body;

  if (!object || !key) {
    res
      .status(400)
      .contentType("text/plain")
      .send("Both object and key are required");
    return;
  }

  delete object[key];
  res.json(object);
});

router.post(
  "/remove-array-value",
  [
    body("array")
      .isArray()
      .withMessage("array is required and must be an array"),
    body("value")
      .isString()
      .withMessage("value is required and must be a string"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { array, value } = matchedData(req);

    const filteredArray = array.filter(function (e) {
      return e !== value;
    });

    res.json(filteredArray);
  }
);

router.post(
  "/replace-array-element",
  [
    body("array")
      .isArray()
      .withMessage("array is required and must be an array"),
    body("element")
      .isString()
      .withMessage("element is required and must be a string"),
    body("newValue")
      .custom((value) => {
        return !!(
          typeof value === "string" ||
          (typeof value === "object" && !Array.isArray(value))
        );
      })
      .withMessage(
        "newValue is required and must be either a string or a JSON object"
      ),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { array, element, newValue } = matchedData(req);

    const index = array.indexOf(element);
    if (index === -1) {
      res
        .status(400)
        .contentType("text/plain")
        .send(`Array element ${element} is missing`);
      return;
    }

    array[index] = newValue;
    res.json(array);
  }
);

export default router;
