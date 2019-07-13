import moment from 'moment';
import helper from './helper';
import { pool } from '../services/db';

exports.userSignUp = async (req, res) => {
  if (!req.body.email || !req.body.password || !req.body.first_name || !req.body.last_name) {
    res.status(400).send({
      status: 'error',
      error: 'Some values are missing',
    });
  }
  if (!helper.validateEmail(req.body.email)) {
    return res.status(400).send({
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
  const client = await pool.connect();
  try {
    const result = await client.query(query, values);
    const token = helper.generateToken(result.rows[0].id);
    const resultData = result.rows[0];
    resultData.token = token;
    return res.status(200).send({ status: 'success', data: resultData });
  } catch (error) {
    if (error.routine === '_bt_check_unique') {
      return res.status(400).send({
        status: 'error',
        error: 'Email already exist',
      });
    }
    return res.status(400).send({ status: 'error', error });
  }
};

exports.go = (req, res) => {
  res.status(200).send('Hi');
};
