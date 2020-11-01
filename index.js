const express = require("express");
const app = express();
const db = require("./db");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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

app.get("/images/:id", (req, res) => {
    const { id } = req.params;
    db.getMoreImages(id)
        .then(({ rows }) => {
            console.log("next Images sent to Vue: ", rows);
            res.json(rows);
        })
        .catch((err) => {
            console.log("Error in getMoreImages: ", err);
            res.sendStatus(500);
        });
});
app.get("/images/new/:id", (req, res) => {
    const { id } = req.params;
    console.log("/images/new/:id : ", id);
    db.getMoreThanMax(id)
        .then(({ rows }) => {
            if (rows.length !== 0) {
                console.log("rows from get newly added", rows);
                res.json(rows);
            } else {
                console.log("no new");
                res.json(rows);
            }
        })
        .catch((err) => {
            console.log("Error in getMoreImages: ", err);
            res.sendStatus(500);
        });
});
app.get("/tags/:tag", (req, res) => {
    const { tag } = req.params;
    console.log("TAG IS", tag);
    db.getImagesByTag(tag)
        .then(({ rows }) => {
            // console.log("images with tag sent to Vue: ", rows);
            rows.forEach(function (arg) {
                console.log(arg.title);
            });
            res.json(rows);
        })
        .catch((err) => {
            console.log("Error in getImagesByTag: ", err);
            res.sendStatus(500);
        });
});

app.post("/images", uploader.single("file"), s3.upload, (req, res) => {
    const { username, title, description, tags } = req.body;
    // console.log("image route reached: ", req.body);
    // console.log("file: ", req.file);
    // we need to send response to Vue, so .then part can run, otherwise it will only run .catch in script.js
    if (req.file) {
        const { filename } = req.file;
        const url = `https://s3.amazonaws.com/spicedling/${filename}`;
        db.postImage(url, username, title, description, tags)
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
    const idMinus = parseInt(id) - 1;
    const idPlus = parseInt(id) + 1;
    db.getSingleImageModified(id, idMinus, idPlus)
        .then(({ rows }) => {
            // console.log("rows: ", rows);
            res.json(rows);
        })
        .catch((err) => {
            console.log("Error in getSingleImage: ", err);
            res.sendStatus(500);
        });
});

app.get("/comments/:id", (req, res) => {
    const { id } = req.params;
    db.getComments(id)
        .then(({ rows }) => {
            // console.log("rows: ", rows);
            res.json(rows);
        })
        .catch((err) => {
            console.log("Error in getSingleImage: ", err);
            res.sendStatus(500);
        });
});
app.post("/comment", (req, res) => {
    console.log("request body: ", req.body);
    const { name, comment, imageId } = req.body.newComment;
    db.postComments(comment, name, imageId)
        .then(({ rows }) => {
            rows = rows[0];
            // console.log("rows: ", rows);
            res.json({ rows });
        })
        .catch((err) => {
            console.log("Error in getComments: ", err);
            res.sendStatus(500);
        });
});
app.get("/delete/:id", (req, res) => {
    const { id } = req.params;
    console.log("request body: ", id);
    db.deleteImage(id)
        .then(({ rows }) => {
            rows = rows[0];
            // console.log("rows: ", rows);
            res.json({ rows });
        })
        .catch((err) => {
            console.log("Error in deletingImage: ", err);
            res.sendStatus(500);
        });
});

app.listen(8080, () => {
    console.log("image board up and running");
});
