// import configJson from '../config';

const { Pool } = require('pg');
const dotenv = require('dotenv');

// onst env = process.env.NODE_ENV || 'development';
// const config = configJson[env];

dotenv.config();
// let connection;
// const env = process.env.NODE_ENV || 'development';
// if (env === 'development') {
//   connection = {
//     user: config.development.username,
//     database: config.development.database,
//     password: config.development.password,
//     host: config.development.host,
//   };
// } else {
//   connection = {
//     user: config.test.username,
//     database: config.test.database,
//     password: config.test.password,
//     host: config.test.host,
//   };
// }

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.on('connect', () => {
  console.log('connected to Database');
});

const migrate = (queryText) => {
  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((e) => {
      console.log(e);
      pool.end();
    });
};

const createUserTable = () => {
  const query = `CREATE TABLE IF NOT EXISTS
    users(
      user_id SERIAL PRIMARY KEY,
      email VARCHAR(128) UNIQUE NOT NULL,
      password VARCHAR(128) NOT NULL,
      first_name VARCHAR(128) NOT NULL,
      last_name VARCHAR(128) NOT NULL,
      is_admin BOOLEAN NOT NULL,
      created_at TIMESTAMP,
      updated_at TIMESTAMP
    )`;
  migrate(query);
};

const dropUserTable = () => {
  const query = 'DROP TABLE IF EXISTS users';
  migrate(query);
};

const createBusTable = () => {
  const query = `CREATE TABLE IF NOT EXISTS
    buses(
      bus_id SERIAL PRIMARY KEY,
      number_plate VARCHAR(128) UNIQUE NOT NULL,
      manufacturer VARCHAR(128) NOT NULL,
      model VARCHAR(128) NOT NULL,
      year VARCHAR(128) NOT NULL,
      capacity INT NOT NULL,
      created_at TIMESTAMP,
      updated_at TIMESTAMP
    )`;
  migrate(query);
};

const dropBusTable = () => {
  const query = 'DROP TABLE IF EXISTS buses';
  migrate(query);
};

const createTripTable = () => {
  const query = `CREATE TABLE IF NOT EXISTS
      trips(
        trip_id SERIAL PRIMARY KEY,
        bus_id INT NOT NULL,
        origin VARCHAR(128) NOT NULL,
        destination VARCHAR(128) NOT NULL,
        fare FLOAT NOT NULL,
        status BOOLEAN NOT NULL,
        trip_date TIMESTAMP
      )`;
  migrate(query);
};

const dropTripTable = () => {
  const query = 'DROP TABLE IF EXISTS trips';
  migrate(query);
};

const createBookingTable = () => {
  const query = `CREATE TABLE IF NOT EXISTS
      bookings(
        booking_id SERIAL PRIMARY KEY,
        trip_id INT NOT NULL,
        user_id INT NOT NULL,
        seat_number INT NOT NULL,
        created_on TIMESTAMP
      )`;
  migrate(query);
};

const dropBookingTable = () => {
  const query = 'DROP TABLE IF EXISTS bookings';
  migrate(query);
};

const createAllTables = () => {
  createUserTable();
  createBusTable();
  createTripTable();
  createBookingTable();
};

const dropAllTables = () => {
  dropBookingTable();
  dropTripTable();
  dropBusTable();
  dropUserTable();
};

pool.on('remove', () => {
  console.log('client removed');
  process.exit(0);
});

module.exports = {
  createAllTables,
  dropAllTables,
};
require('make-runnable');
