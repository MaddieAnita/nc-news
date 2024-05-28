const { findApiEndpoints } = require("../models/endpoints.models");

exports.getApiEndpoints = (req, res, next) => {
  findApiEndpoints()
    .then((api_endpoints) => {
      res.status(200).send({ api_endpoints });
    })
    .catch((err) => {
      next(err);
    });
};
