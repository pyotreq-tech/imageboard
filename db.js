var spicedPg = require("spiced-pg");
var db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:postgres:postgres@localhost:5432/imageboard`
);

exports.getImages = () => {
    return db.query(`SELECT * FROM images ORDER BY id DESC`);
};

exports.postImage = (url, username, title, description) => {
    return db.query(
        `INSERT INTO images (url, username, title, description) 
        VALUES ($1, $2, $3, $4) 
        RETURNING url, username, title, description;
`,
        [url, username, title, description]
    );
};
