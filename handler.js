exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Go Serverless v4! Your function executed successfully!",
    }),
  };
};

module.exports.create = require("./functions/create");
module.exports.create = require("./functions/getItem");
