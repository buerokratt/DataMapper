import express from "express";

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
    res.status(400).contentType("text/plain").send("Both object and key are required");
    return;
  }

  delete object[key];
  res.json(object);
});

router.post("/remove-array-value", async (req, res) => {
  const { array, value } = req.body;

  if (!array || !value) {
    res.status(400).contentType("text/plain").send("Both array and value are required");
    return;
  }

  const filteredArray = array.filter(function(e) {
    return e !== value;
  });

  res.json(filteredArray);
});

router.post("/replace-array-element", async (req, res) => {
  const { array, element, newValue } = req.body;

  if (!array || !element || !newValue) {
    res.status(400).contentType("text/plain").send("Array, element and newValue are required");
    return;
  }

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
});

export default router;
