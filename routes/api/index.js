const router = require('express').Router();
const reservationRoutes = require('./reservations');
const customersRoutes = require('./customers');
const loginRoute = require('./login');
const hwRoutes = require('./hw');
const logoutRoute = require('./logout');
const roomTypesRoutes = require('./room_types');
const authMiddleware = require('./auth_middleware');

// login route for employees or managers
router.use('/login', loginRoute)

// logout route for employees or managers
router.use('/logout', logoutRoute)

// '/api/customers' for all routes involving Users
router.use('/customers', customersRoutes)

// '/api/reserve' for all routes involving Users
router.use('/reservations', reservationRoutes)

// '/api/rooms/types' for all routes involving the Room types
router.use('/room/types', roomTypesRoutes)

router.use('/hw', hwRoutes)

module.exports = router
