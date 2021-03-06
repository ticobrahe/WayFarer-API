import moment from 'moment';
import pool from '../database/db';

exports.createTrip = async (req, res) => {
  if (!req.body.bus_id || !req.body.origin || !req.body.destination || !req.body.fare) {
    return res.status(400).json({
      status: 'error',
      error: 'Some values are missing',
    });
  }
  const data = [
    req.body.bus_id,
    req.body.origin,
    req.body.destination,
    req.body.fare,
    true,
    moment(new Date()),
  ];
  const checkTrip = [req.body.bus_id, true];
  try {
    const queryBus = ' SELECT number_plate from buses where bus_id = $1 ';
    const resultBus = await pool.query(queryBus, [req.body.bus_id]);
    // check if bus has been registered
    if (!resultBus.rows[0]) {
      return res.status(404).json({
        status: 'error',
        error: 'Bus cannot be found',
      });
    }
    const queryCheck = 'SELECT bus_id, status from trips where bus_id = $1 AND status = $2';
    const resultCheckBus = await pool.query(queryCheck, checkTrip);
    // Check if the trip has been created for the selected bus
    if (resultCheckBus.rows[0]) {
      return res.status(400).json({
        status: 'error',
        error: 'Trip has been created for this Bus',
      });
    }
    const query = `INSERT INTO
          trips(bus_id, origin, destination, fare, status, trip_date)
          VALUES($1, $2, $3, $4, $5, $6) returning *`;
    const result = await pool.query(query, data);
    return res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    return res.status(400).json({ status: 'error', error });
  }
};

exports.getAllTrip = async (req, res) => {
  const query = 'SELECT trip_id, bus_id, origin, destination, status, trip_date, fare from trips';
  try {
    const result = await pool.query(query);
    if (result.rows < 1) {
      return res.status(400).json({
        status: 'error',
        error: 'No trip available',
      });
    }
    return res.status(200).json({ status: 'success', data: result.rows });
  } catch (error) {
    return res.status(400).json({ status: 'error', error });
  }
};

exports.cancelTrip = async (req, res) => {
  const findTripQuery = `SELECT trip_id 
    from trips 
    where trip_id = $1 and status = true`;
  const updateTripQuery = `UPDATE trips 
    SET status = false
    where trip_id = $1`;
  try {
    const findTripResult = await pool.query(findTripQuery, [req.params.tripId]);
    if (!findTripResult.rows[0]) {
      return res.status(404).json({
        status: 'error',
        error: 'Trip not found',
      });
    }
    await pool.query(updateTripQuery, [req.params.tripId]);
    return res.status(200).json({ status: 'success', data: { message: 'Trip cancelled successfully' } });
  } catch (error) {
    return res.status(400).json({ status: 'error', error });
  }
};
