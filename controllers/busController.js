import moment from 'moment';
import pool from '../database/db';

exports.registerBus = async (req, res) => {
  if (!req.body.number_plate || !req.body.manufacturer || !req.body.model || !req.body.capacity) {
    return res.status(400).json({
      status: 'error',
      error: 'Some values are missing',
    });
  }
  const query = `INSERT INTO
          buses(number_plate, manufacturer, model, year, capacity, created_at)
          VALUES($1, $2, $3, $4, $5, $6) returning *`;
  const value = [
    req.body.number_plate,
    req.body.manufacturer,
    req.body.model,
    req.body.year,
    req.body.capacity,
    moment(new Date())];
  try {
    const result = await pool.query(query, value);
    return res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    if (error.routine === '_bt_check_unique') {
      return res.status(400).json({
        status: 'error',
        error: 'Car with this number plate already exist',
      });
    }
    return res.status(400).json({ status: 'error', error });
  }
};