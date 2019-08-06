import moment from 'moment';
import pool from '../database/db';
import helper from './helper';

exports.bookTrip = async (req, res) => {
  if (!req.body.trip_id) return res.status(400).send({ status: 'error', error: 'No trip selected' });

  const { user_id } = req.user;
  try {
    const queryUser = 'SELECT user_id, trip_id from bookings where user_id = $1 and trip_id = $2';
    const resultUser = await pool.query(queryUser, [user_id, req.body.trip_id]);
    // Check if user has booked for this trip
    if (resultUser.rows[0]) return res.status(400).json({ status: 'error', error: 'Trip has alrealdy been booked by you' });
    const queryTrip = 'SELECT t.bus_id, t.status, b.capacity from trips t inner join buses b on t.bus_id = b.bus_id where trip_id = $1';
    const tripResult = await pool.query(queryTrip, [req.body.trip_id]);
    // Check if trip exist
    if (!tripResult.rows[0]) return res.status(404).json({ status: 'error', error: 'Trip does not exist' });
    // Check if trip is avalaible for booking
    if (tripResult.rows[0].status === false) return res.status(400).json({ status: 'error', error: 'This trip is not available' });
    const currentBooking = 'SELECT seat_number FROM bookings where trip_id=$1';
    const bookingResult = await pool.query(currentBooking, [req.body.trip_id]);
    const bookedSeat = bookingResult.rows.map(seat => seat.seat_number);
    const busCapacity = tripResult.rows[0].capacity;
    const remainingSeat = helper.availableSeat(busCapacity, bookedSeat);
    if (!remainingSeat.length) return res.status(404).json({status: 'error', error: 'The trip you intend to book is filled up, try another'});

    let seatNumber;

    if (!req.body.seat_number) {
      seatNumber = helper.generateSeatNumber(remainingSeat);
    } else if (!remainingSeat.includes(Number(req.body.seat_number))) {
      return res.status(400).send({ status: 'error', error: 'Seat is already taken' });
    } else {
      seatNumber = req.body.seat_number;
    }
    const data = [
      req.body.trip_id,
      user_id,
      seatNumber,
      moment(new Date()),
    ];
    const query = `INSERT INTO
    bookings(trip_id, user_id, seat_number, created_on)
    VALUES($1, $2, $3, $4) returning *`;
    const result = await pool.query(query, data);
    const queryJoin = `select b.booking_id,u.user_id,t.trip_id,t.bus_id,t.trip_date,
    b.seat_number,u.first_name,u.last_name,u.email from users u
    inner join bookings b on b.user_id = u.user_id 
    inner join trips t on b.trip_id = t.trip_id
    where u.user_id = $1 and t.trip_id = $2`;
    const queryData = [user_id, req.body.trip_id];
    const resultJoin = await pool.query(queryJoin, queryData);
    return res.status(201).json({ status: 'success', data: resultJoin.rows[0] });
  } catch (error) {
    return res.status(400).json({ status: 'error', error });
  }
};

exports.getBookings = async (req, res) => {
  const { is_admin, user_id } = req.user;
  const adminQuery = `select b.booking_id,u.user_id,b.trip_id,t.bus_id,t.trip_date,
    b.seat_number,u.first_name,u.last_name,u.email from users u
    inner join bookings b on b.user_id = u.user_id 
    inner join trips t on b.trip_id = t.trip_id`;
  const userQuery = `select b.booking_id,u.user_id,b.trip_id,t.bus_id,t.trip_date,
    b.seat_number,u.first_name,u.last_name,u.email from users u
    inner join bookings b on b.user_id = u.user_id 
    inner join trips t on b.trip_id = t.trip_id
    where u.user_id = $1`;
  let booking;
  try {
    if (is_admin === true) {
      booking = await pool.query(adminQuery);
    } else {
      booking = await pool.query(userQuery, [user_id]);
    }
    if (booking.rows < 1) {
      return res.status(404).json({
        status: 'error',
        error: 'Booking not found',
      });
    }
    return res.status(200).json({ status: 'success', data: booking.rows });
  } catch (error) {
    return res.status(400).json({ status: 'error', error });
  }
};

exports.deleteBooking = async (req, res) => {
  const query = 'DELETE from bookings where booking_id = $1 and user_id = $2';
  const data = [req.params.bookingId, req.user.user_id];
  try {
    const result = await pool.query(query, data);
    if (result.rowCount < 1) {
      return res.status(404).send({
        status: 'error',
        error: 'Booking not found',
      });
    }
    return res.status(200).send({ status: 'success', data: { message: 'Booking deleted succesfully' } });
  } catch (error) {
    return res.status(400).send({ status: 'error', error });
  }
};
