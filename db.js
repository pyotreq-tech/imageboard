var spicedPg = require("spiced-pg");
var db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:postgres:postgres@localhost:5432/imageboard`
);

exports.getImages = () => {
    return db.query(`SELECT * FROM images ORDER BY id DESC LIMIT 8`);
};
exports.getMoreThanMax = (id) => {
    return db.query(`SELECT * FROM images WHERE id > $1`, [id]);
};

exports.getMoreImages = (id) => {
    return db.query(
        `SELECT url, title, id, (
        SELECT id FROM images
        ORDER BY id ASC
        LIMIT 1
        ) AS "lowestId",
        (
        SELECT id FROM images
        ORDER BY id DESC
        LIMIT 1
        ) AS "highestId" FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 8;
`,
        [id]
    );
};
exports.getSingleImageModified = (id) => {
    return db.query(
        `SELECT id, url, username, title, description, tags,
        (SELECT id FROM images WHERE id < $1 ORDER BY id DESC LIMIT 1) AS "previousImage",
        (SELECT id FROM images WHERE id > $1 ORDER BY id ASC LIMIT 1) AS "nextImage"
        FROM images WHERE id = $1;`,
        [id]
    );
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

// How to make it pass actually good results?
exports.getImagesByTag = (tag) => {
    return db.query(`SELECT * FROM images WHERE tags ~ $1`, [tag]);
};
exports.deleteImage = (id) => {
    return db.query(`DELETE FROM images WHERE id = $1`, [id]);
};

exports.postImage = (url, username, title, description, tags) => {
    return db.query(
        `INSERT INTO images (url, username, title, description, tags) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id, url, title, tags;
`,
        [url, username, title, description, tags]
    );
};

exports.postComments = (comment, username, imageId) => {
    return db.query(
        `INSERT INTO comments (comment, username, imageId) 
        VALUES ($1, $2, $3) 
        RETURNING *;
`,
        [comment, username, imageId]
    );
};
