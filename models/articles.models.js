const db = require("../db/connection");
const format = require("pg-format");

exports.findArticles = (
  sort_by,
  order,
  topic,
  page,
  limit,
  featured,
  author
) => {
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
    "true",
    "false",
  ];

  if (
    (order && !validQueries.includes(order)) ||
    (sort_by && !validQueries.includes(sort_by)) ||
    (featured && !validQueries.includes(featured)) ||
    (page && isNaN(page)) ||
    (limit && isNaN(limit))
  ) {
    return Promise.reject({ status: 400, msg: "Bad request - invalid query" });
  }

  const queryValues = [];
  let queryString = `SELECT articles.author, title, article_id, topic, articles.created_at, 
  articles.votes, article_img_url, 
  COUNT(comments.article_id) AS comment_count,
  articles.featured,
  users.avatar_url
  FROM articles 
  LEFT JOIN comments USING (article_id)`;

  if (author) {
    queryString += ` RIGHT JOIN users ON users.username = articles.author`;
  } else {
    queryString += ` JOIN users ON articles.author = users.username`;
  }

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

  if (featured !== undefined) {
    if (queryValues.length) {
      queryString += ` AND articles.featured = $${queryValues.length + 1}`;
    } else {
      queryString += ` WHERE articles.featured = $${queryValues.length + 1}`;
    }
    if (featured === "true") {
      queryValues.push("t");
    } else {
      queryValues.push("f");
    }
  }

  if (author !== undefined) {
    if (queryValues.length) {
      queryString += ` AND users.username = $${queryValues.length + 1}`;
    } else {
      queryString += ` WHERE users.username = $${queryValues.length + 1}`;
    }
    queryValues.push(author);
  }

  queryString += ` GROUP BY (article_id, users.avatar_url)`;

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
    if (featured !== undefined && !rows.length) {
      return [];
    }

    if (author !== undefined && !rows.length) {
      return Promise.reject({ status: 404, msg: "User Not Found" });
    } else if (author !== undefined && rows[0].author === null) {
      return [];
    }

    if (!rows.length) {
      return Promise.reject({ status: 404, msg: "Topic Not Found" });
    }
    return rows;
  });
};

exports.getTotalArticles = (topic, featured, author) => {
  const queryVals = [];
  let queryStr = "SELECT COUNT(article_id) AS total_count FROM articles";
  if (topic) {
    if (Array.isArray(topic)) {
      queryStr += ` WHERE topic = $${queryVals.length + 1}`;
      queryVals.push(topic[0]);
      topic.slice(1).forEach((item) => {
        queryStr += ` OR topic = $${queryVals.length + 1}`;
        queryVals.push(item);
      });
    } else {
      queryStr += " WHERE topic = $1";
      queryVals.push(topic);
    }
  }

  if (featured !== undefined) {
    if (queryVals.length) {
      queryStr += ` AND articles.featured = $${queryVals.length + 1}`;
    } else {
      queryStr += ` WHERE articles.featured = $${queryVals.length + 1}`;
    }
    if (featured === "true") {
      queryVals.push("t");
    } else {
      queryVals.push("f");
    }
  }

  if (author !== undefined) {
    if (queryVals.length) {
      queryStr += ` AND articles.author = $${queryVals.length + 1}`;
    } else {
      queryStr += ` WHERE articles.author = $${queryVals.length + 1}`;
    }
    queryVals.push(author);
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
  const { inc_votes, featured } = patchBody;

  const queryValues = [];
  let queryString = `UPDATE articles`;

  if (inc_votes) {
    queryString += ` SET votes = votes + $${queryValues.length + 1}`;
    queryValues.push(inc_votes);
  }

  if (featured !== undefined && !inc_votes) {
    queryString += ` SET featured = $${queryValues.length + 1}`;
    if (featured === true) {
      queryValues.push("t");
    } else if (featured === false) {
      queryValues.push("f");
    }
  } else if (featured && inc_votes) {
    queryString += ` AND featured = $${queryValues.length + 1}`;
    queryValues.push(featured);
  }
  queryString += ` WHERE article_id = $${queryValues.length + 1} RETURNING *;`;
  queryValues.push(article_id);

  return db.query(queryString, queryValues).then(({ rows }) => {
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
