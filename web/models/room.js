const connection = require('../config/connection')

const Room = {
  selectAll: cb => {
    const queryString =
      'SELECT rm.room_id, rm.room_num, rm.description, rm.num_beds, rm.clean, rm.occupied, rm.active, rt.room_type_id, rt.type, rt.rate FROM rooms AS rm INNER JOIN room_types AS rt ON rm.room_type_id=rt.room_type_id ORDER BY rm.room_num ASC;'
    connection.query(queryString, (err, results) => {
      if (err) throw err
      cb(results)
    })
  },
  selectOne: (id, cb) => {
    const queryString =
      'SELECT rm.room_id, rm.room_num, rm.description, rm.num_beds, rm.clean, rm.occupied, rm.active, rt.room_type_id, rt.type, rt.rate FROM rooms AS rm INNER JOIN room_types AS rt ON rm.room_type_id=rt.room_type_id WHERE rm.room_id=? ORDER BY rm.room_num ASC LIMIT 1;'
    connection.execute(queryString, [id], (err, results, fields) => {
      if (err) throw err
      cb(results)
    })
  },
  selectSome: (condition, cb) => {
    const queryString =
      'SELECT rm.room_id, rm.room_num, rm.description, rm.num_beds, rm.clean, rm.occupied, rm.active, rt.room_type_id, rt.type, rt.rate FROM rooms AS rm INNER JOIN room_types AS rt ON rm.room_type_id=rt.room_type_id WHERE ' +
      condition +
      ' ORDER BY rm.room_num ASC;'
    connection.query(queryString, (err, results) => {
      if (err) throw err
      cb(results)
    })
  },
  selectAllShort: (date, cb) => {
    const preQueryString = 'SET @input_date=?;'
    const queryString =
      "SELECT rm.room_id, rm.room_num, rm.room_type_id, rm.clean, rm.occupied, IFNULL(ae.avail, 'n/a') AS availability_end FROM rooms AS rm LEFT JOIN (SELECT room_id, MIN(STR_TO_DATE(check_in_date, '%Y%m%d')) AS avail FROM res_rooms WHERE STR_TO_DATE(check_in_date, '%Y%m%d')>@input_date && room_id IS NOT NULL GROUP BY room_id) AS ae ON rm.room_id=ae.room_id WHERE rm.active=1 && rm.room_id NOT IN (SELECT room_id FROM res_rooms WHERE room_id IS NOT NULL && STR_TO_DATE(check_in_date, '%Y%m%d')<=@input_date && STR_TO_DATE(check_out_date, '%Y%m%d')>@input_date);"
    connection.query(preQueryString + queryString, [date], (err, results) => {
      if (err) throw err
      cb(results[1])
    })
  },
  deleteOne: (id, cb) => {
    const queryString = 'DELETE FROM rooms WHERE room_id=?;'
    connection.execute(queryString, [id], (err, result) => {
      if (err) throw err
      cb(result)
    })
  },
  insertOne: (vals, cb) => {
    const queryString =
      'INSERT INTO rooms (room_num, room_type_id, description, num_beds, clean, occupied, active) VALUES (?,?,?,?,?,?,?);'
    connection.execute(queryString, vals, (err, result) => {
      if (err) throw err
      cb(result)
    })
  },
  updateOne: (vals, id, cb) => {
    vals.push(id)
    const queryString =
      'UPDATE rooms SET room_num=?, room_type_id=?, description=?, num_beds=?, clean=?, occupied=?, active=? WHERE room_id=?;'
    connection.execute(queryString, vals, (err, result) => {
      if (err) throw err
      cb(result)
    })
  },
  updateOccupied: (vals, cb) => {
    const queryString = 'UPDATE rooms SET occupied=? WHERE room_id=?;'
    connection.execute(queryString, vals, (err, result) => {
      if (err) throw err
      cb(result)
    })
  },
  updateCheckOut: (id, cb) => {
    const queryString = 'UPDATE rooms SET occupied=0, clean=1 WHERE room_num=?;'
    connection.execute(queryString, [id], (err, result) => {
      if (err) throw err
      cb(result)
    })
  }
}

module.exports = Room
