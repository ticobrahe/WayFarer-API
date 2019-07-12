import express from 'express';
import userController from '../controllers/userController';

const router = express.Router();

router.post('/user', userController.userSignUp);

export default router;
