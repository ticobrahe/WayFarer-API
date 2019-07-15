import express from 'express';
import userController from '../controllers/userController';

const router = express.Router();

router.post('/auth/signup', userController.userSignUp);
router.post('/auth/signin', userController.login);

export default router;
