exports.handlePsqlErrors = (err, req, res, next) => {
  if (err.code) {
    // console.log(err, "<< PSQL ERROR");
    res.status(400).send({ msg: "Bad request" });
  } else {
    next(err);
  }
};

exports.handleCustomErrors = (err, req, res, next) => {
  if (err.msg) {
    // console.log(err, "<< CUSTOM ERROR");
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.handleServerErrors = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal Server Error" });
};
