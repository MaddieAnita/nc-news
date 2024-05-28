const { findTopics } = require("../models/topics.models");

exports.getTopics = (req, res, next) => {
  findTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};
