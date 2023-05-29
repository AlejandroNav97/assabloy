const db = require("../models/index.js");

module.exports = {
  getAllRoomTypes: (req, res) => {
    try {
      db.RoomType.selectAll((data) => {
        res.json(data);
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
  createNewRoomType: (req, res) => {
    try {
      db.RoomType.insertOne(req.body.vals, (result) => {
        res.json({ id: result.insertId });
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
  getRoomTypeById: (req, res) => {
    try {
      db.RoomType.selectOne(req.params.id, (data) => {
        res.json(data);
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
  updateRoomTypeById: (req, res) => {
    try {
      db.RoomType.updateOne(req.body.vals, req.params.id, (result) => {
        if (result.changedRows === 0) {
          res.status(204).end();
        } else {
          res.status(200).end();
        }
      });
    } catch (error) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
  deleteRoomTypeById: (req, res) => {
    try {
      db.RoomType.deleteOne(req.params.id, (data) => {
        res.json(data);
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
  getAvailableRoomsByDate: (req, res) => {
    try {
      db.RoomType.selectAvailable(req.params.date, (data) => {
        res.json(data);
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
};
