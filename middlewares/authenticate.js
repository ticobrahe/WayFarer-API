import jwt from 'jsonwebtoken';
import pool from '../database/db';

exports.verifyToken = async (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(401).json({
      status: 'error',
      error: 'Access decenied. No Token provided',
    });
  }
  const query = 'SELECT user_id, email,first_name,last_name,is_admin FROM users WHERE user_id = $1';
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(query, [decoded.id]);
    if (!result.rows[0]) {
      return res.status(401).json({
        status: 'error',
        error: 'Token you provided is invalid',
      });
    }
    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(400).json({ status: 'error', error });
  }
};

exports.isAdmin = (req, res, next) => {
  const { is_admin } = req.user;
  // Check if user is Admin
  if (!is_admin) {
    return res.status(403).json({
      status: 'error',
      error: 'Access denied',
    });
  }
  next();
};
