const express = require("express");
const app = express();
const db = require("./db");

app.use(express.static("public"));

app.get("/images", (req, res) => {
    db.getImages()
        .then(({ rows }) => {
            console.log(rows);
            res.json(rows);
        })
        .catch((err) => {
            console.log("Error in getImages: ", err);
            res.send("error");
        });
});

app.listen(8080, () => {
    console.log("image board up and running");
});
