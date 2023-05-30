const router = require('express').Router()
const roomTypeController = require('../../controllers/roomTypeController')

router.route('/').get(roomTypeController.getAllRoomTypes);

router.get('/available/:date', roomTypeController.getAvailableRoomsByDate)

module.exports = router;