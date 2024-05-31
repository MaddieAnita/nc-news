const db = require("../db/connection");

exports.findCommentsByArticleId = (article_id, page, limit) => {
  const queryValues = [article_id];
  let queryString = `SELECT * FROM comments 
  RIGHT JOIN articles USING (article_id)
  WHERE article_id = $1 
  ORDER BY comments.created_at DESC`;

  if (page || limit) {
    if (page === "1" && !limit) {
      queryString += ` LIMIT 10`;
    } else if (page !== "1" && !limit) {
      queryString += ` LIMIT 10 OFFSET ($${queryValues.length + 1} - 1) * 10`;
      queryValues.push(page);
    } else if ((page === "1" || !page) && limit) {
      queryString += ` LIMIT $${queryValues.length + 1}`;
      queryValues.push(limit);
    } else if (page !== "1" && limit) {
      queryString += ` LIMIT $${queryValues.length + 1}`;
      queryValues.push(limit);
      queryString += ` OFFSET $${queryValues.length + 1} `;
      const offset = (page - 1) * limit;
      queryValues.push(offset);
    }
  }

  return db.query(queryString + ";", queryValues).then(({ rows }) => {
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
  const queryValues = [commentToPost.body, article_id, commentToPost.username];
  return db
    .query(
      `INSERT INTO comments (body, article_id, author)
    VALUES ($1, $2, $3) RETURNING *;`,
      queryValues
    )
    .then(({ rows }) => {
      return rows[0];
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

exports.updateCommentById = (commentToUpdate, comment_id) => {
  const { inc_votes } = commentToUpdate;
  return db
    .query(
      `UPDATE comments 
  SET votes = votes + $1
  WHERE comment_id = $2
  RETURNING *;`,
      [inc_votes, comment_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
      return rows[0];
    });
};
