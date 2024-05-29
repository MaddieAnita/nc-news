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

exports.updateArticleVotesById = (article_id, patchBody) => {
  const { inc_votes } = patchBody;
  return db
    .query(
      `UPDATE articles
  SET votes = votes + $1
  WHERE article_id = $2
  RETURNING *;`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};
