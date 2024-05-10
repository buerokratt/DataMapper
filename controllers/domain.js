import express from "express";

const router = express.Router();

router.post("/domainUpdateExistingResponse", (req, res) => {
  const { json, searchKey, newKey, newKeyValue } = req.body;
  if (!json || !searchKey || !newKey || !newKeyValue) {
    return res.status(400).json({
      message: "json, searchKey, newKey, newKeyValue are required fields",
    });
  }

  Object.entries(json).map(([key, _]) => {
    if (key.includes(searchKey)) {
      json[newKey] = [
        {
          text: newKeyValue,
        },
      ];
      delete json[key];
    }
  });

  return res.json(json);
});

export default router;
