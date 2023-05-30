const db = require("../models/index.js");
const axios = require("axios");

module.exports = {
  createNewCustomerWithReservationAndRooms: (req, res) => {
    try {
      db.Customer.insertOne(req.body.cust, (result) => {
        db.Reservation.insertOne(
          result.insertId,
          req.body.reserve,
          (result) => {
            const reservationId = result.insertId;
            db.ResRoom.insertSome(result.insertId, req.body.rooms, () => {
              res.status(200).send({ reservation_id: reservationId });
            });
          }
        );
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
  cognitoCheckin: (req, res) => {
    try {
      const url = `${process.env.COGNITO_SERVER}/check-in`;
      const data = JSON.stringify(req.body.data);
      const token = JSON.parse(process.env.CREDENTIALS).access_token;
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Cookie': "JSESSIONID=72E4001E00486A7FA15AE33F62D5C06F",
        "Content-type": "application/json",
      };
      axios.post(url,  data, { headers })
      .then(ans => { 
        res.status(200).send({ status:200, message: 'Ok'})
      })
      .catch(error => { 
        console.error('There was an error!', error);   
        res.status(200).send({ status: error.response.status, message: error.message});
    }); 
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
  getAllReservations: (req, res) => {
    try {
      db.Reservation.selectAll((data) => {
        res.status(200).json(data);
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
  getReservationById: (req, res) => {
    try {
      db.Reservation.selectOne(req.params.id, (result) => {
        res.json(result);
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
  getRoomsConnectedToReservationById: (req, res) => {
    try {
      db.ResRoom.selectSome(req.params.id, (result) => {
        res.json(result);
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
  cancelReservationById: (req, res) => {
    try {
      db.Reservation.cancelOne(req.params.id, (result) => {
        console.log(
          `Changed reservation_id ${result.affectedRows} to canceled.`
        );
        db.ResRoom.deleteSome(req.params.id, (data) => {
          res.json(data);
        });
      });
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
};
