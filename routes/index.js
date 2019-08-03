import express from 'express';
import userController from '../controllers/userController';
import tripController from '../controllers/tripController';
import bookController from '../controllers/bookController';
import authenticate from '../middlewares/authenticate';

const router = express.Router();

router.post('/auth/signup', userController.userSignUp);
router.post('/auth/signin', userController.login);


router.post('/bus', authenticate.verifyToken, authenticate.isAdmin, tripController.registerBus);
router.post('/trips', authenticate.verifyToken, authenticate.isAdmin, tripController.createTrip);
router.get('/trips', authenticate.verifyToken, tripController.getAllTrip);
router.put('/trips/:tripId', authenticate.verifyToken, authenticate.isAdmin, tripController.cancelTrip);

router.post('/bookings', authenticate.verifyToken, bookController.bookTrip);
router.get('/bookings', authenticate.verifyToken, bookController.getBookings);
router.delete('/bookings/:bookingId', authenticate.verifyToken, bookController.deleteBooking);

export default router;
