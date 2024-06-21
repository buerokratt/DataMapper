import express from "express";
import { stringify, parse } from "yaml";
import multer from "multer";
import Papa from "papaparse";
import base64ToText from "../js/util/base64ToText.js";
import { body, matchedData, validationResult } from "express-validator";

const router = express.Router();

router.post("/csv_to_json", multer().array("file"), (req, res) => {
  const file = base64ToText(req.body.file);
  const result = Papa.parse(file, { skipEmptyLines: true });
  res.json(result.data);
});

router.post("/yaml_to_json", multer().array("file"), (req, res) => {
  const file = base64ToText(req.body.file);
  const result = parse(file);
  res.json(result);
});

router.post("/json_to_yaml", (req, res) => {
  const result = stringify(req.body, { lineWidth: 0 });
  res.send({ json: result });
});

router.post("/json_to_yaml_data", (req, res) => {
  const result = stringify(req.body.data);
  res.send({ yaml: result });
});

router.post(
  "/string-replace",
  [
    body("data").isString().withMessage("data must be a string"),
    body("search").isString().withMessage("search must be a string"),
    body("replace").isString().withMessage("replace must be a string"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { data, search, replace } = matchedData(req);
    if (search === "|") {
      res.json(data.replace(/(examples:.*?)\|/g, "$1"));
    } else {
      res.json(data.replaceAll(search, replace));
    }
  }
);

router.post(
  "/string-split",
  [
    body("data").isString().withMessage("data must be a string"),
    body("separator").isString().withMessage("separator must be a string"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { data, separator } = matchedData(req);
    res.json(
      data.split(separator).filter(function (n) {
        return n;
      })
    );
  }
);

router.post(
  "/string-to-array",
  [body("data").isString().withMessage("data must be a string")],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { data } = matchedData(req);
    if (data.length > 0) {
      const removedQuot = data.replaceAll("&quot;", "");
      const removedHyphens = removedQuot.replace(/^- /gm, "");
      const newArray = removedHyphens.split("\n");
      res.json(newArray.filter((el) => "" !== el.trim()));
    } else {
      res.json([]);
    }
  }
);

router.post("/csv-to-json", (req, res) => {
  if (!req.body.file) {
    return res.status(400).json({ error: "No file uploaded" }).send();
  }
  const fileContent = Object.values(req.body.file)[0];
  const result = Papa.parse(fileContent, { skipEmptyLines: true });
  const csvData = result.data;
  res.json(csvData);
});

router.post(
  "/json-to-yaml-stories",
  [
    body("stories")
      .isArray()
      .optional()
      .withMessage("stories must be an array"),
    body("rules").isArray().optional().withMessage("rules must be an array"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let result;
    const { stories, rules } = matchedData(req);

    if (stories) {
      result = {
        version: "3.0",
        stories: stories
          .map((entry) => ({
            story: entry.story,
            steps: entry.steps
              .map((step) => {
                const formattedStep = {};
                switch (true) {
                  case !!step.intent:
                    formattedStep.intent = step.intent;
                    if (step.entities && step.entities.length > 0) {
                      formattedStep.entities = step.entities.map((entity) => ({
                        [entity]: "",
                      }));
                    }
                    break;
                  case !!step.action:
                    formattedStep.action = step.action;
                    break;
                  case !!step.slot_was_set &&
                    Object.keys(step.slot_was_set).length > 0:
                    formattedStep.slot_was_set = step.slot_was_set;
                    break;
                  case !!step.condition && step.condition.length > 0:
                    formattedStep.condition = step.condition;
                    break;
                  default:
                    break;
                }
                return formattedStep;
              })
              .filter((step) => Object.keys(step).length > 0),
          }))
          .filter((entry) => entry.steps.length > 0),
      };
    } else if (rules) {
      result = {
        version: "3.0",
        rules: rules
          .map((entry) => ({
            rule: entry.rule,
            ...("conversation_start" in entry && {
              conversation_start: entry.conversation_start,
            }),
            ...("wait_for_user_input" in entry && {
              wait_for_user_input: entry.wait_for_user_input,
            }),
            steps: entry.steps
              .map((step) => {
                const formattedStep = {};
                switch (true) {
                  case !!step.intent:
                    formattedStep.intent = step.intent;
                    if (step.entities && step.entities.length > 0) {
                      formattedStep.entities = step.entities.map((entity) => ({
                        [entity]: "",
                      }));
                    }
                    break;
                  case !!step.action:
                    formattedStep.action = step.action;
                    break;
                  case !!step.slot_was_set &&
                    Object.keys(step.slot_was_set).length > 0:
                    formattedStep.slot_was_set = step.slot_was_set;
                    break;
                  case !!step.condition && step.condition.length > 0:
                    formattedStep.condition = step.condition;
                    break;
                  default:
                    break;
                }
                return formattedStep;
              })
              .filter((step) => Object.keys(step).length > 0),
          }))
          .filter((entry) => entry.steps.length > 0),
      };
    } else {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const yamlString = stringify(result, {
      customTags: [
        {
          tag: "tag:yaml.org,2002:seq",
          format: "flow",
          test: (value) => value && value.length === 0,
          resolve: () => "",
        },
      ],
    });

    res.json({ json: yamlString });
  }
);

export default router;
