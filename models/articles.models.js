const db = require("../db/connection");

exports.findArticles = () => {
  return db
    .query(
      `SELECT articles.author, title, article_id, topic, articles.created_at, 
      articles.votes, article_img_url, 
    COUNT(comments.article_id) AS comment_count
    FROM articles 
    LEFT JOIN comments USING (article_id) 
    GROUP BY (article_id)
    ORDER BY created_at DESC
    `
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.findArticlesById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};

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
