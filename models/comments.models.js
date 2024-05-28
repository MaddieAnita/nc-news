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
