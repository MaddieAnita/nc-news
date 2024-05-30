const {
  findArticlesById,
  findArticles,
  updateArticleVotesById,
  insertPost,
} = require("../models/articles.models");

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic } = req.query;
  findArticles(sort_by, order, topic)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticlesById = (req, res, next) => {
  const { article_id } = req.params;
  findArticlesById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticleVotesById = (req, res, next) => {
  const { article_id } = req.params;
  updateArticleVotesById(article_id, req.body)
    .then((updatedArticle) => {
      res.status(200).send({ updatedArticle });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArticle = (req, res, next) => {
  insertPost(req.body)
    .then((newArticle) => {
      res.status(201).send({ newArticle });
    })
    .catch((err) => {
      next(err);
    });
};
