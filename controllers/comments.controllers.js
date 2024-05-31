const {
  findCommentsByArticleId,
  insertCommentByArticleId,
  removeCommentById,
  updateCommentById,
} = require("../models/comments.models");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { page, limit } = req.query;
  findCommentsByArticleId(article_id, page, limit)
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

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  removeCommentById(comment_id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  updateCommentById(req.body, comment_id)
    .then((updatedComment) => {
      res.status(200).send({ updatedComment });
    })
    .catch((err) => {
      next(err);
    });
};
