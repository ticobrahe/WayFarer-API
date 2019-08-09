import express from 'express';
import userController from '../controllers/userController';
import tripController from '../controllers/tripController';
import bookController from '../controllers/bookController';
import busController from '../controllers/busController';
import searchController from '../controllers/searchController';
import authenticate from '../middlewares/authenticate';

const router = express.Router();
// user endpoints
router.post('/auth/signup', userController.userSignUp);
router.post('/auth/signin', userController.login);

// bus endpoint
router.post('/bus', authenticate.verifyToken, authenticate.isAdmin, busController.registerBus);

// trip endpoints
router.post('/trips', authenticate.verifyToken, authenticate.isAdmin, tripController.createTrip);
router.get('/trips', authenticate.verifyToken, tripController.getAllTrip);
router.put('/trips/:tripId', authenticate.verifyToken, authenticate.isAdmin, tripController.cancelTrip);

// booking endpoints
router.post('/bookings', authenticate.verifyToken, bookController.bookTrip);
router.get('/bookings', authenticate.verifyToken, bookController.getBookings);
router.delete('/bookings/:bookingId', authenticate.verifyToken, bookController.deleteBooking);

// Search endpoint
router.get('/search', authenticate.verifyToken, searchController.filterTrip);


export default router;
