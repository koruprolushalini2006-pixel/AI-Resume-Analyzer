const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "..", "uploads"));
    },

    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() + "-" + file.originalname;

        cb(null, uniqueName);
    }
});

// File upload configuration
const upload = multer({
    storage: storage,

    fileFilter: function (req, file, cb) {
        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF and DOCX files are allowed"));
        }
    }
});

// Upload resume
router.post("/upload", upload.single("resume"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Please upload a resume"
        });
    }

    res.json({
        success: true,
        message: "Resume uploaded successfully",

        file: {
            name: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            path: req.file.path
        }
    });
});

module.exports = router;