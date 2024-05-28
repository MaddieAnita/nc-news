const fs = require("fs/promises");
const { dirname } = require("path");

exports.findApiEndpoints = () => {
  return fs.readFile(`${__dirname}/../endpoints.json`, "utf-8").then((data) => {
    return data;
  });
};
