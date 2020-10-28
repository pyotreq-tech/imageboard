var spicedPg = require("spiced-pg");
var db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:postgres:postgres@localhost:5432/imageboard`
);

exports.getImages = () => {
    return db.query(`SELECT * FROM images ORDER BY id DESC`);
};
exports.getComments = (imageId) => {
    return db.query(
        `SELECT * FROM comments WHERE imageid = $1 ORDER BY id DESC`,
        [imageId]
    );
};

exports.getSingleImage = (id) => {
    return db.query(`SELECT * FROM images WHERE id = $1`, [id]);
};

exports.postImage = (url, username, title, description) => {
    return db.query(
        `INSERT INTO images (url, username, title, description) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, url, title;
`,
        [url, username, title, description]
    );
};

exports.postComments = (comment, username, imageId) => {
    return db.query(
        `INSERT INTO comments (comment, username, imageId) 
        VALUES ($1, $2, $3) 
        RETURNING comment, username, imageId, ;
`,
        [comment, username, imageId]
    );
};
