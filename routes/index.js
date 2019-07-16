import express from 'express';
import userController from '../controllers/userController';
import tripController from '../controllers/tripController';
import authenticate from '../middlewares/authenticate';

const router = express.Router();

router.post('/auth/signup', userController.userSignUp);
router.post('/auth/signin', userController.login);

router.post('/bus', authenticate.verifyToken, authenticate.isAdmin, tripController.registerBus);
router.post('/trips', authenticate.verifyToken, authenticate.isAdmin, tripController.createTrip);
router.get('/trips', authenticate.verifyToken, tripController.getAllTrip);

export default router;
