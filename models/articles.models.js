const db = require("../db/connection");
const format = require("pg-format");

exports.findArticles = (sort_by, order, topic, page, limit) => {
  const validQueries = [
    "asc",
    "desc",
    "article_id",
    "author",
    "title",
    "topic",
    "created_at",
    "votes",
    "article_img_url",
    "comment_count",
  ];

  if (
    (order && !validQueries.includes(order)) ||
    (sort_by && !validQueries.includes(sort_by)) ||
    (page && isNaN(page)) ||
    (limit && isNaN(limit))
  ) {
    return Promise.reject({ status: 400, msg: "Bad request - invalid query" });
  }

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

  queryString += ` GROUP BY (article_id)`;

  if (sort_by && order) {
    queryString += ` ORDER BY ${sort_by} ${order}`;
  } else if (sort_by) {
    queryString += ` ORDER BY ${sort_by} DESC`;
  } else if (order) {
    queryString += ` ORDER BY created_at ${order}`;
  } else {
    queryString += ` ORDER BY created_at DESC`;
  }

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
      return Promise.reject({ status: 404, msg: "Topic Not Found" });
    }
    return rows;
  });
};

exports.getTotalArticles = (topic) => {
  const queryVals = [];
  let queryStr = "SELECT COUNT(article_id) AS total_count FROM articles";
  if (topic) {
    if (Array.isArray(topic)) {
      queryStr += ` WHERE topic = $${queryValues.length + 1}`;
      queryVals.push(topic[0]);
      topic.slice(1).forEach((item) => {
        queryStr += ` OR topic = $${queryValues.length + 1}`;
        queryVals.push(item);
      });
    } else {
      queryStr += " WHERE topic = $1";
      queryVals.push(topic);
    }
  }
  return db.query(queryStr + ";", queryVals).then(({ rows }) => {
    return rows[0];
  });
};

exports.findArticlesById = (article_id) => {
  return db
    .query(
      `SELECT articles.*, COUNT(comments.article_id) AS comment_count
    FROM articles 
    JOIN comments USING (article_id)
    WHERE article_id = $1
    GROUP BY (articles.article_id);`,
      [article_id]
    )
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

exports.insertPost = (articleToPost) => {
  const { author, title, body, topic, article_img_url } = articleToPost;
  const queryIdentifiers = ["author", "title", "body", "topic"];
  const queryValues = [author, title, body, topic];

  if (article_img_url) {
    queryIdentifiers.push("article_img_url");
    queryValues.push(article_img_url);
  }

  const insertPost = format(
    `INSERT INTO articles (%I)
  VALUES (%L)
  RETURNING *;`,
    queryIdentifiers,
    queryValues
  );
  return db.query(insertPost).then(({ rows }) => {
    rows[0].comment_count = 0;
    return rows[0];
  });
};

exports.removeArticleById = (article_id) => {
  return db
    .query("DELETE FROM comments WHERE article_id = $1", [article_id])
    .then(() => {
      return db.query("DELETE FROM articles WHERE article_id = $1", [
        article_id,
      ]);
    })
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
    });
};
