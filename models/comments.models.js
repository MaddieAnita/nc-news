const db = require("../db/connection");

exports.findCommentsByArticleId = (article_id) => {
  return db
    .query(
      `SELECT * FROM comments 
        RIGHT JOIN articles USING (article_id)
        WHERE article_id = $1 
        ORDER BY comments.created_at DESC;`,
      [article_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      if (!rows[0].comment_id) {
        return [];
      }
      return rows;
    });
};

exports.insertCommentByArticleId = (article_id, commentToPost) => {
  const checkBodyKeys = Object.keys(commentToPost).every((val) =>
    ["username", "body"].includes(val)
  );
  if (
    !checkBodyKeys ||
    typeof commentToPost.username !== "string" ||
    isNaN(article_id)
  ) {
    return Promise.reject({ status: 400, msg: "Bad request - malformed body" });
  }

  const queryValues = [commentToPost.body, article_id, commentToPost.username];
  return db
    .query("SELECT article_id FROM articles where article_id = $1", [
      article_id,
    ])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
    })
    .then(() => {
      return db.query("SELECT username FROM users WHERE username = $1", [
        commentToPost.username,
      ]);
    })
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "User not found" });
      }
    })
    .then(() => {
      return db.query(
        `INSERT INTO comments (body, article_id, author)
    VALUES ($1, $2, $3) RETURNING *;`,
        queryValues
      );
    })
    .then(({ rows }) => {
      return rows;
    });
};

exports.removeCommentById = (comment_id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1", [comment_id])
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
    });
};
