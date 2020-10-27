const express = require("express");
const app = express();
const db = require("./db");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

app.use(express.static("public"));

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});

app.get("/images", (req, res) => {
    db.getImages()
        .then(({ rows }) => {
            // console.log(rows);
            res.json(rows);
        })
        .catch((err) => {
            console.log("Error in getImages: ", err);
            res.send("error");
        });
});

app.post("/images", uploader.single("file"), (req, res) => {
    console.log("image route reached: ", req.body);
    console.log("file: ", req.file);
    // TO DO: insert all the information in the database, then send the information back to Vue:
    // BUT WE have to wait until afternoon encounter to do that
    // IT HAVE to work without refreshing

    // we need to send response to Vue, so .then part can run, otherwise it will only run .catch
    if (req.file) {
        res.json({
            success: true,
        });
    } else {
        res.json({
            success: false,
        });
    }
});

app.listen(8080, () => {
    console.log("image board up and running");
});
