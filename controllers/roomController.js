const db = require("../models/index.js");

module.exports = {
  getAllRooms: (req, res) => {
    try {
      db.Room.selectAll((data) => {
        res.json(data);
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
  createNewRoom: (req, res) => {
    try {
      db.Room.insertOne(req.body.vals, (result) => {
        res.json({ id: result.insertId });
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
  getRoomById: (req, res) => {
    try {
      db.Room.selectOne(req.params.id, (data) => {
        res.json(data);
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
  updateRoomById: (req, res) => {
    try {
      db.Room.updateOne(req.body.vals, req.params.id, (result) => {
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
  deleteRoomById: (req, res) => {
    try {
      db.Room.deleteOne(req.params.id, (data) => {
        res.json(data);
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
};
