const Auth = require("../models/login.js");

module.exports = {
  login: (req, res) => {
    try {
      let login = Auth.login(req, function (err, result) {
        if (err) res.send(err);
        res.send("Ok");
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
  validate_token: (req, res) => {
    try {
      let validate = Auth.validate(req.body.token, function (err, result) {
        if (err) res.send(err.message);
        res.send(result);
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
};
