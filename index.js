const express = require("express");
const app = express();
const db = require("./db");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

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
            res.sendStatus(500);
        });
});

app.post("/images", uploader.single("file"), s3.upload, (req, res) => {
    const { username, title, description } = req.body;
    console.log("image route reached: ", req.body);
    console.log("file: ", req.file);
    // we need to send response to Vue, so .then part can run, otherwise it will only run .catch in script.js
    if (req.file) {
        const { filename } = req.file;
        const url = `https://s3.amazonaws.com/spicedling/${filename}`;
        db.postImage(url, username, title, description)
            .then(({ rows }) => {
                rows = rows[0];
                res.json({
                    rows,
                });
            })
            .catch((err) => {
                console.log("error in posting image: ", err);
                res.json({
                    success: false,
                });
            });
    } else {
        res.json({
            success: false,
        });
    }
});

app.get("/image/:id", (req, res) => {
    const { id } = req.params;
    db.getSingleImage(id)
        .then(({ rows }) => {
            console.log("rows: ", rows);
            res.json(rows);
        })
        .catch((err) => {
            console.log("Error in getSingleImage: ", err);
            res.sendStatus(500);
        });
});

app.listen(8080, () => {
    console.log("image board up and running");
});
