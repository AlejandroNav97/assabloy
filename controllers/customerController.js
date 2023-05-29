const db = require("../models/index.js");

module.exports = {
  createNewCustomer: (req, res) => {
    try {
      db.Customer.insertOne(req.body.vals, (result) => {
        res.status(200).json({ id: result.insertId });
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
  getAllCustomers: (req, res) => {
    try {
      db.Customer.selectAll((data) => {
        res.status(200).json(data);
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
  getCustomerById: (req, res) => {
    try {
      db.Customer.selectOne(req.params.id, (data) => {
        res.status(200).json(data);
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
  updateCustomerById: (req, res) => {
    try {
      db.Customer.updateOne(req.body.vals, req.params.id, (result) => {
        if (result.changedRows === 0) {
          res.status(204).end();
        } else {
          res.status(200).end();
        }
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
};
