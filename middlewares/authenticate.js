import jwt from 'jsonwebtoken';
import { pool } from '../services/db';

exports.verifyToken = async (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(400).send({
      status: 'error',
      error: 'Token is not provided',
    });
  }
  const client = await pool.connect();
  const query = 'SELECT user_id, email,first_name,last_name,is_admin FROM users WHERE user_id = $1';
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const result = await client.query(query, [decoded.id]);
    if (!result.rows[0]) {
      return res.status(400).send({
        status: 'error',
        error: 'Token you provided is invalid',
      });
    }
    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(400).send({ status: 'error', error });
  }
};

exports.isAdmin = (req, res, next) => {
  const { is_admin } = req.user;
  // Check if user is Admin
  if (!is_admin) {
    return res.status(400).send({
      status: 'error',
      error: 'Only admin has access',
    });
  }
  next();
};
