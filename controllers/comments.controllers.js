const { totalCount } = require("../db/connection");
const {
  findCommentsByArticleId,
  insertCommentByArticleId,
  removeCommentById,
  updateCommentById,
  getTotalCommentsByArticleId,
} = require("../models/comments.models");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { page, limit } = req.query;

  const promiseArray = [
    findCommentsByArticleId(article_id, page, limit),
    getTotalCommentsByArticleId(article_id),
  ];

  Promise.all(promiseArray)
    .then((data) => {
      const articleComments = data[0];
      const total_count = data[1].total_count;
      res.status(200).send({ articleComments, total_count });
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
