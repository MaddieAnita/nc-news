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
  postCommentByArticleId,
} = require("./controllers/comments.controllers");
const app = express();
app.use(express.json());

app.get("/api", getApiEndpoints);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticlesById);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);

module.exports = app;
