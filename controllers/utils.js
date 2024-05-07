import express from "express";

const router = express.Router();

router.post("/increase-double-digit-version", async (req, res) => {
  const { version } = req.body;
  const splitVersion = version.split("_");
  const majorV = splitVersion[0];
  let minorV = parseInt(splitVersion[1]);
  minorV += 1;
  res.json(`${majorV}_${minorV}`);
});

router.post("/object-list-contains-id", async (req, res) => {
  const { id, list } = req.body;
  const exists = checkIdExists(list, id);
  res.json(exists);
});

function checkIdExists(array, id) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].id === id) {
      return true;
    }
  }
  return false;
}

export default router;
