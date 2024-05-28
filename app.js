const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const {
  handleServerErrors,
  handleCustomErrors,
  handlePsqlErrors,
} = require("./errors/errors");
const { getApiEndpoints } = require("./controllers/endpoints.controllers");
const {
  getArticlesById,
  getArticles,
} = require("./controllers/articles.controllers");
const {
  getCommentsByArticleId,
} = require("./controllers/comments.controllers");
const app = express();

app.get("/api", getApiEndpoints);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticlesById);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);

module.exports = app;
