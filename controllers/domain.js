import express from "express";

const router = express.Router();

router.post("/update-existing-response", (req, res) => {
  const { json, searchKey, newKey, newKeyValue, deleteOldValue = true } = req.body;
  if (!json || !searchKey || !newKey || !newKeyValue) {
    return res.status(400).json({
      message: "json, searchKey, newKey, newKeyValue are required fields",
    });
  }

  Object.entries(json).forEach(([key, _]) => {
    if (key.includes(searchKey)) {
      json[newKey] = [
        {
          text: newKeyValue,
        },
      ];
      if (deleteOldValue) delete json[key];
    }
  });

  return res.json(json);
});

export default router;
