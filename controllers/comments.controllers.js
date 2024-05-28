const {
  findCommentsByArticleId,
  insertCommentByArticleId,
} = require("../models/comments.models");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  findCommentsByArticleId(article_id)
    .then((articleComments) => {
      res.status(200).send({ articleComments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  insertCommentByArticleId(article_id, req.body)
    .then((newComment) => {
      res.status(201).send({ newComment });
    })
    .catch((err) => {
      next(err);
    });
};
