import moment from 'moment';
import helper from './helper';
import pool from '../database/db';

exports.userSignUp = async (req, res) => {
  if (!req.body.email || !req.body.password || !req.body.first_name || !req.body.last_name) {
    return res.status(400).json({
      status: 'error',
      error: 'Some values are missing',
    });
  }
  if (!helper.validateEmail(req.body.email)) {
    return res.status(400).json({
      status: 'error',
      error: 'Invalid email address',
    });
  }
  const query = `INSERT INTO
        users(email, password, first_name, last_name, is_admin, created_at)
        VALUES($1, $2, $3, $4, $5, $6) returning *`;
  const data = {
    email: req.body.email,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    c_at: moment(new Date()),
  };
  const hashPassword = helper.hashPassword(req.body.password);
  const values = [data.email, hashPassword, data.first_name, data.last_name, false, data.c_at];
  try {
    const result = await pool.query(query, values);
    const token = helper.generateToken(result.rows[0].user_id);
    const resultData = result.rows[0];
    resultData.token = token;
    return res.status(201).json({ status: 'success', data: resultData });
  } catch (error) {
    if (error.routine === '_bt_check_unique') {
      return res.status(400).json({
        status: 'error',
        error: 'Email already exist',
      });
    }
    return res.status(400).json({ status: 'error', error });
  }
};

exports.login = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({
      status: 'error',
      error: 'Some values are missing',
    });
  }
  if (!helper.validateEmail(req.body.email)) {
    return res.status(400).json({
      status: 'error',
      error: 'Invalid email address',
    });
  }
  const query = 'SELECT user_id, is_admin, password FROM users WHERE email = $1';
  try {
    const result = await pool.query(query, [req.body.email]);
    if (!result.rows[0]) {
      return res.status(401).json({
        status: 'error',
        error: 'The credentials you provided is incorrect',
      });
    }
    if (!helper.comparePassword(req.body.password, result.rows[0].password)) {
      return res.status(401).json({
        status: 'error',
        error: 'The credentials you provided is incorrect',
      });
    }
    const token = helper.generateToken(result.rows[0].user_id);
    const resultData = result.rows[0];
    delete resultData.password;
    resultData.token = token;
    return res.status(200).json({ status: 'success', data: resultData });
  } catch (error) {
    return res.status(400).json({ status: 'error', error });
  }
};
