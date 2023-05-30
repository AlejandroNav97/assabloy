const router = require('express').Router();
const db = require('../../models/index.js');
const hwController = require('../../controllers/hwController'); 

router.get('/customers', (req, res) => {
  db.Customer.selectAll(data => {
    res.json(data)
  })
})

router.get('/customers/:id', (req, res) => {
  db.Customer.selectOne(req.params.id, data => {
    res.json(data)
  })
})

router.delete('/customers/:id', (req, res) => {
  db.Customer.deleteOne(req.params.id, data => {
    res.json(data)
  })
})

// this route will need to be sent data like this: { "vals": ["Joe", "Blow", "222 E Market St", "Akron", "Ohio", "42116", "joeblow@gmail.com", "440-234-1234", "1234567890123456", "11-21", 1] }
router.post('/customers', (req, res) => {
  db.Customer.insertOne(req.body.vals, result => {
    res.json({ id: result.insertId })
  })
})

// this route will need to be sent data like this: { "vals": ["Joe", "Blow", "222 E Market St", "Akron", "Ohio", "42116", "joeblow@gmail.com", "440-234-1234", "1234567890123456", "11-21", 1] }
router.put('/customers/:id', (req, res) => {
  db.Customer.updateOne(req.body.vals, req.params.id, result => {
    if (result.changedRows === 0) {
      res.status(204).end()
    } else {
      res.status(200).end()
    }
  })
})

router.get('/rooms', (req, res) => {
  db.Room.selectAll(data => {
    res.json(data)
  })
})

router.get('/roomsIdNum', (req, res) => {
  db.Room.selectAllIdNum(data => {
    res.json(data)
  })
})

router.get('/rooms/:id', (req, res) => {
  db.Room.selectOne(req.params.id, data => {
    res.json(data)
  })
})

router.delete('/rooms/:id', (req, res) => {
  db.Room.deleteOne(req.params.id, data => {
    res.json(data)
  })
})

// this route will need to be sent data like this: { "vals": ["208", 2, "microwave and courtyard view", 2, 1, 0, 1] }
router.post('/rooms', (req, res) => {
  db.Room.insertOne(req.body.vals, result => {
    res.json({ id: result.insertId })
  })
})

// this route will need to be sent data like this: { "vals": ["208", 2, "microwave and courtyard view", 2, 1, 0, 1] }
router.put('/rooms/:id', (req, res) => {
  db.Room.updateOne(req.body.vals, req.params.id, result => {
    if (result.changedRows === 0) {
      res.status(204).end()
    } else {
      res.status(200).end()
    }
  })
})

// { "cust": ["first_name", "last_name", "address", "city", "state", "zip", "email", "phone", "credit_card_num", "cc_expiration"], "reserve": ["user_id", "comments"], "rooms": [["room_type_id", "check_in_date", "check_out_date", "adults", "rate", "comments"]] }
// this route will need to be sent data like this:
// {
// 	"cust": ["Peter", "Pan", "1111 FairyTale Lane", "Fantasyland", "Vermont", "23456", "p.pan@yahoo.net", "555-1212", "1234567890123456", "11 / 21"],
// 	"reserve": [1, ""],
// 	"rooms": [[2, "2019-08-12", "2019-08-15", 2, "119.99", "need a good view"], [1, "2019-08-12", "2019-08-17", 2, "109.99", "want a late checkout"]]
// }
router.post('/reservation', (req, res) => {
  db.Customer.insertOne(req.body.cust, result => {
    db.Reservation.insertOne(result.insertId, req.body.reserve, result => {
      const reservationId = result.insertId
      db.ResRoom.insertSome(result.insertId, req.body.rooms, () => {
        res.status(200).send({ reservation_id: reservationId })
      })
    })
  })
})

router.put('/reservation', (req, res) => {
  db.Customer.updateOne(req.body.cust, () => {
    db.Reservation.updateOne(req.body.reserve, () => {
      db.ResRoom.updateSome(req.body.rooms, result => {
        res.status(200).send(result)
      })
    })
  })
})

router.get('/reservations', (req, res) => {
  db.Reservation.selectAll(data => {
    res.json(data)
  })
})

router.get(
  '/reservations_list/:fname/:lname/:sdate/:edate/:cnum',
  (req, res) => {
    const conditions = []
    req.params.fname !== 'undefined' &&
      conditions.push("c.first_name LIKE '" + req.params.fname + "%'")
    req.params.lname !== 'undefined' &&
      conditions.push("c.last_name LIKE '" + req.params.lname + "%'")
    req.params.sdate !== 'undefined' &&
      conditions.push("(rr.check_in_date='" + req.params.sdate + "')")
    req.params.edate !== 'undefined' &&
      conditions.push("(rr.check_out_date='" + req.params.edate + "')")
    req.params.cnum !== 'undefined' &&
      conditions.push("rr.confirmation_code LIKE '%" + req.params.cnum + "%'")
    conditions.length === 0 && conditions.push('(rr.check_in_date>=CURDATE())')
    db.Reservation.selectSome(conditions, data => {
      res.json(data)
    })
  }
)

// to get info about a reservation, both of these 2 queries need to be returned
// this route gets a reservation by id with customer info
router.get('/reservation/:id', (req, res) => {
  db.Reservation.selectOne(req.params.id, result => {
    res.json(result)
  })
})
// this route gets all rooms associated with a reservation_id
router.get('/res_rooms/:id', (req, res) => {
  db.ResRoom.selectSome(req.params.id, result => {
    res.json(result)
  })
})

router.get('/arrivals/:sdate/:fname/:lname/:cnum', (req, res) => {
  const conditions = []
  if (req.params.sdate !== 'undefined') {
    conditions.push("(rr.check_in_date='" + req.params.sdate + "')")
  }
  if (req.params.fname !== 'undefined') {
    conditions.push("c.first_name LIKE '" + req.params.fname + "%'")
  }
  if (req.params.lname !== 'undefined') {
    conditions.push("c.last_name LIKE '" + req.params.lname + "%'")
  }
  if (req.params.cnum !== 'undefined') {
    conditions.push("rr.confirmation_code LIKE '%" + req.params.cnum + "%'")
  }
  conditions.length === 0
    ? conditions.push('(rr.check_in_date=CURDATE())')
    : conditions
  db.ResRoom.selectArrivals(conditions, result => {
    res.json(result)
  })
})

router.get(
  '/departures/:fname/:lname/:rnum/:sover/:dout/:dpart',
  (req, res) => {
    const conditions = []
    req.params.fname !== 'undefined' &&
      conditions.push("c.first_name LIKE '" + req.params.fname + "%'")
    req.params.lname !== 'undefined' &&
      conditions.push("c.last_name LIKE '" + req.params.lname + "%'")
    req.params.rnum !== 'undefined' &&
      conditions.push("(rm.room_num='" + req.params.rnum + "')")
    req.params.sover === 'true' &&
      conditions.push(
        '(rr.check_in_date<CURDATE() && rr.check_out_date>CURDATE())'
      )
    req.params.dout === 'true' &&
      conditions.push('(rr.check_out_date=CURDATE() && rr.checked_out=0)')
    req.params.dpart === 'true' &&
      conditions.push('(rr.check_out_date=CURDATE() && rr.checked_out=1)')
    conditions.length === 0 &&
      conditions.push('(rr.check_out_date=CURDATE() && rr.checked_out=0)')
    db.ResRoom.selectDepartures(conditions, result => {
      res.json(result)
    })
  }
)

router.get('/rooms_arrivals/:date', (req, res) => {
  db.Room.selectAllShort(req.params.date, result => {
    res.json(result)
  })
})

router.get('/pending_departures/:date', (req, res) => {
  db.ResRoom.countPendingDeparturesByRoomType(req.params.date, result => {
    res.json(result)
  })
})

router.get('/guests/:fname/:lname/:rnum/:cnum', (req, res) => {
  const conditions = []
  if (req.params.fname !== 'undefined') {
    conditions.push("c.first_name LIKE '" + req.params.fname + "%'")
  }
  if (req.params.lname !== 'undefined') {
    conditions.push("c.last_name LIKE '" + req.params.lname + "%'")
  }
  if (req.params.rnum !== 'undefined') {
    conditions.push("rm.room_num LIKE '%" + req.params.rnum + "%'")
  }
  if (req.params.cnum !== 'undefined') {
    conditions.push("rr.confirmation_code LIKE '%" + req.params.cnum + "%'")
  }
  conditions.length === 0 ? conditions.push('(rm.occupied=1)') : conditions
  db.ResRoom.getGuests(conditions, result => {
    res.json(result)
  })
})

// this route will need to be sent data like this: { "vals": [[2, "2019-08-12", "2019-08-15", 2, "20190621HW000001", "need a good view"]] }
router.post('/res_rooms', (req, res) => {
  db.ResRoom.insertSome(req.body.vals, result => {
    res.json({ result })
  })
})

router.put('/cancelReservation/:id', (req, res) => {
  db.Reservation.cancelOne(req.params.id, () => {
    db.ResRoom.cancelSome(req.params.id, data => {
      res.json(data)
    })
  })
})

router.put('/checkinRoom/:id/:room_id', (req, res) => {
  const vals = [req.params.room_id, req.params.id]
  const cond = [1, req.params.room_id]
  const body = req.body.old_room ? [0, req.body.old_room] : null;
  db.ResRoom.updateCheckIn(vals, () => {
    db.Room.updateOccupied(cond, () => {
      if(body !== null){
        db.Room.updateOccupied(body, result => {
          res.json(result)
        })
      } else res.json('Ok')
    })
  })
})

router.patch('/cognito-change-room', hwController.cognitoChangeRoom);

router.put('/checkoutRoom/:id/:room_num', (req, res) => {
  db.ResRoom.updateCheckOut(req.params.id, () => {
    db.Room.updateCheckOut(req.params.room_num, result => {
      res.json(result)
    })
  })
})

router.post('/cognito-checkout', hwController.cognitoCheckout);

router.get('/hotel_info/:id', (req, res) => {
  db.HotelInfo.selectOne(req.params.id, data => {
    res.json(data)
  })
})

module.exports = router
