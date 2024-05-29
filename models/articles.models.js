const db = require("../db/connection");

exports.findArticles = (queryObj) => {
  if (Object.keys(queryObj).length && !queryObj.topic) {
    return Promise.reject({ status: 400, msg: "Bad request - invalid query" });
  }

  const { topic } = queryObj;

  const queryValues = [];
  let queryString = `SELECT articles.author, title, article_id, topic, articles.created_at, 
  articles.votes, article_img_url, 
  COUNT(comments.article_id) AS comment_count
  FROM articles 
  LEFT JOIN comments USING (article_id)`;

  if (topic) {
    if (Array.isArray(topic)) {
      queryString += ` WHERE articles.topic = $${queryValues.length + 1}`;
      queryValues.push(topic[0]);
      topic.slice(1).forEach((item) => {
        queryString += ` OR articles.topic = $${queryValues.length + 1}`;
        queryValues.push(item);
      });
    } else {
      queryString += " WHERE articles.topic = $1";
      queryValues.push(topic);
    }
  }

  queryString += ` GROUP BY (article_id)
  ORDER BY created_at DESC;`;

  return db.query(queryString, queryValues).then(({ rows }) => {
    if (!rows.length) {
      return Promise.reject({ status: 404, msg: "Topic Not Found" });
    }
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
  if (!Object.keys(patchBody).includes("inc_votes")) {
    return Promise.reject({ status: 400, msg: "Bad request - Malformed Body" });
  }
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
