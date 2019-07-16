import moment from 'moment';
import { pool } from '../services/db';

exports.registerBus = async (req, res) => {
  if (!req.body.number_plate || !req.body.manufacturer || !req.body.model || !req.body.capacity) {
    return res.status(400).send({
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
  const client = await pool.connect();
  try {
    const result = await client.query(query, value);
    return res.status(200).send({ status: 'success', data: result.rows[0] });
  } catch (error) {
    if (error.routine === '_bt_check_unique') {
      return res.status(400).send({
        status: 'error',
        error: 'Car with this number plate already exist',
      });
    }
    return res.status(400).send({ status: 'error', error });
  }
};

exports.createTrip = async (req, res) => {
  if (!req.body.bus_id || !req.body.origin || !req.body.destination || !req.body.fare) {
    return res.status(400).send({
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
  const client = await pool.connect();
  try {
    const queryBus = ' SELECT number_plate from buses where bus_id = $1 ';
    const resultBus = await client.query(queryBus, [req.body.bus_id]);
    // check if bus has been registered
    if (!resultBus.rows[0]) {
      return res.status(404).send({
        status: 'error',
        error: 'Bus cannot be found',
      });
    }
    const queryCheck = 'SELECT bus_id, status from trips where bus_id = $1 AND status = $2';
    const resultCheckBus = await client.query(queryCheck, checkTrip);
    console.log(resultCheckBus.rows[0]);
    // Check if the trip has been created for the selected bus
    if (resultCheckBus.rows[0]) {
      return res.status(400).send({
        status: 'error',
        error: 'Trip has been created for this Bus',
      });
    }
    const query = `INSERT INTO
          trips(bus_id, origin, destination, fare, status, trip_date)
          VALUES($1, $2, $3, $4, $5, $6) returning *`;
    const result = await client.query(query, data);
    return res.status(200).send({ status: 'success', data: result.rows[0] });
  } catch (error) {
    return res.status(400).send({ status: 'error', error });
  }
};
