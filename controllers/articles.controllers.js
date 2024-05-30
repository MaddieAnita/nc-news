const {
  findArticlesById,
  findArticles,
  updateArticleVotesById,
  insertPost,
  getTotalArticles,
} = require("../models/articles.models");

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic, page, limit } = req.query;

  const promiseArray = [findArticles(sort_by, order, topic, page, limit)];

  if (page || limit) {
    promiseArray.push(getTotalArticles());
  }

  Promise.all(promiseArray)
    .then((data) => {
      const articles = data[0];
      if (data.length > 1) {
        res.status(200).send({ articles, total_count: data[1].total_count });
      } else {
        res.status(200).send({ articles });
      }
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
