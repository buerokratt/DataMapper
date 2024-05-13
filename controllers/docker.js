import express from "express";
import { body, matchedData, validationResult } from "express-validator";

const router = express.Router();

router.post(
  "/bot-trained-version",
  [
    body("object")
      .isObject()
      .withMessage("object is required and must be a JSON object"),
    body("name")
      .isString()
      .withMessage("name is required and must be a string"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { object, name } = matchedData(req);

    const serviceParameters = object.services["train-bot"].command;
    const index = serviceParameters.indexOf("--fixed-model-name");

    if (index !== -1 && index < serviceParameters.length - 1) {
      const fileName = serviceParameters[index + 1];
      res.json(fileName.split(name)[1]);
    } else {
      res.json("1_0");
    }
  }
);

router.post(
  "/update-version-for-bot",
  [
    body("object")
      .isObject()
      .withMessage("object is required and must be a JSON object"),
    body("servicesArray")
      .isArray()
      .withMessage("servicesArray is required and must be an array"),
    body("newVersion")
      .isString()
      .withMessage("newVersion is required and must be a string"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { object, servicesArray, newVersion } = matchedData(req);
    servicesArray.forEach((service) => {
      if (service === "train-bot") {
        const selectedService = object.services[service];
        selectedService.command = replaceNextElementInArray(
          selectedService.command,
          "--fixed-model-name",
          `${newVersion}`
        );
      } else if (service === "test-bot") {
        const selectedService = object.services[service];
        selectedService.command = replaceNextElementInArray(
          selectedService.command,
          "--out",
          `results/${newVersion}`
        );
      } else if (service === "test-bot-cv") {
        const selectedService = object.services[service];
        selectedService.command = replaceNextElementInArray(
          selectedService.command,
          "--out",
          `results/cross-${newVersion}`
        );
      }
    });
    res.json(object);
  }
);

router.post("/update-parameter-by-key", async (req, res) => {
  const { object, serviceName, paramName, newValue } = req.body;

  const serviceToUpdate = object.services[serviceName];
  serviceToUpdate[paramName] = newValue;

  res.json(object);
});

const replaceNextElementInArray = (array, element, newInput) => {
  const index = array.indexOf(element);

  if (index !== -1 && index < array.length - 1) {
    array[index + 1] = newInput.toString();
  }
  return array;
};

export default router;
