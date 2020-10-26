var spicedPg = require("spiced-pg");
var db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:postgres:postgres@localhost:5432/imageboard`
);

exports.getImages = () => {
    return db.query(`SELECT * FROM images`);
};
