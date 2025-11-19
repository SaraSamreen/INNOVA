const express = require("express");
const multer = require("multer");
const router = express.Router();
const { getFiles, uploadFile } = require("../controllers/fileController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.get("/:teamId/files", getFiles);
router.post("/:teamId/files", upload.single("file"), uploadFile);

module.exports = router;
