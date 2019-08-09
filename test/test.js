import { expect } from 'chai';
import request from 'supertest';
import moment from 'moment';
import app from '../index';
import pool from '../database/db';
import helper from '../controllers/helper';

let admin;
let user;
let busTest;
let anotherBus;
let tripTest;
let bookingTest;

// create user
before(async () => {
  const queryAdmin = `INSERT INTO
   users(email, password, first_name, last_name, is_admin, created_at)
   VALUES($1, $2, $3, $4, $5, $6) returning *`;
  const queryUser = `INSERT INTO
   users(email, password, first_name, last_name, is_admin, created_at)
   VALUES($1, $2, $3, $4, $5, $6) returning *`;
  const hashPasswordAdmin = helper.hashPassword('tico');
  const hashPasswordUser = helper.hashPassword('abee');
  const adminData = ['olabiyi.sam@admin.com', hashPasswordAdmin, 'sam', 'ola', true, moment(new Date())];
  const userData = ['sam@test.com', hashPasswordUser, 'test', 'tobi', false, moment(new Date())];
  // create admin
  const resultAdmin = await pool.query(queryAdmin, adminData);
  const adminToken = helper.generateToken(resultAdmin.rows[0].user_id);
  admin = resultAdmin.rows[0];
  admin.token = adminToken;
  // create user
  const resultUser = await pool.query(queryUser, userData);
  const userToken = helper.generateToken(resultUser.rows[0].user_id);
  user = resultUser.rows[0];
  user.token = userToken;
});

// create bus
before(async () => {
  const query = `INSERT INTO
  buses(number_plate, manufacturer, model, year, capacity, created_at)
  VALUES($1, $2, $3, $4, $5, $6) returning *`;
  const data = ['FDSAEE', 'Benz', 'X30', '2015', 15, moment(new Date())];
  const { rows } = await pool.query(query, data);
  busTest = rows[0];
  // creta another bus
  const queryAnotherBus = `INSERT INTO
  buses(number_plate, manufacturer, model, year, capacity, created_at)
  VALUES($1, $2, $3, $4, $5, $6) returning *`;
  const anotherBusData = ['GDAGG', 'BMW', 'X5', '2017', 15, moment(new Date())];
  const busResult = await pool.query(queryAnotherBus, anotherBusData);
  anotherBus = busResult.rows[0];
});

// create trip
before(async () => {
  const query = `INSERT INTO
          trips(bus_id, origin, destination, fare, status, trip_date)
          VALUES($1, $2, $3, $4, $5, $6) returning *`;
  const data = [busTest.bus_id, 'Ketu', 'Somolu', 150, true, moment(new Date())];
  const { rows } = await pool.query(query, data);
  tripTest = rows[0];
});

// create a booking
before(async () => {
  const query = `INSERT INTO
    bookings(trip_id, user_id, seat_number, created_on)
    VALUES($1, $2, $3, $4) returning *`;
  const data = [tripTest.trip_id, admin.user_id, 3, moment(new Date())];
  const { rows } = await pool.query(query, data);
  bookingTest = rows[0];
});

after(async () => {
  const queryUser = 'delete from users';
  const queryTrip = 'delete from trips';
  const queryBus = 'delete from buses';
  await pool.query(queryTrip);
  await pool.query(queryUser);
  await pool.query(queryBus);
});

describe('User CRUD endpoints test', () => {
  describe('/post /api/vi/auth/signup', () => {
    it('Should create a new user', (done) => {
      const usercheck = {
        email: 'ola@usertest.com',
        password: 'brand',
        first_name: 'kemij',
        last_name: 'olabii',
      };
      request(app)
        .post('/api/v1/auth/signup')
        .send(usercheck)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body.data).to.include({
            email: usercheck.email,
            first_name: usercheck.first_name,
            last_name: usercheck.last_name,
          });
          done();
        });
    });
    it('It should not create a user with invalid data', (done) => {
      const usercheck = {
        first_name: 'tobi',
        last_name: 'kemi',
      };
      request(app)
        .post('/api/v1/auth/signup')
        .send(usercheck)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
    });
  });

  describe('/post /api/v1/auth/signin', () => {
    it('login a user', (done) => {
      const usercheck = {
        email: 'ola@usertest.com',
        password: 'brand',
      };
      request(app)
        .post('/api/v1/auth/signin')
        .send(usercheck)
        .end((err, res) => {     
          expect(res.status).to.equal(200);
          done();
        });
    });
    it('not login user if not sign up', (done) => {
      const usercheck = {
        email: 'ola@gmail.com',
        password: 'brand',
      };
      request(app)
        .post('/api/v1/auth/signin')
        .send(usercheck)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });
});

describe('Bus endpoint test', () => {
  describe('/post  /api/v1/bus', () => {
    it('should register a bus if user is an admin', (done) => {
      const bus = {
        number_plate: 'ABWfdBW5',
        manufacturer: 'Toyota',
        model: 'matrix',
        year: '2013',
        capacity: 12,
      };
      request(app)
        .post('/api/v1/bus')
        .set('x-access-token', admin.token)
        .send(bus)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body.data).to.include({
            number_plate: bus.number_plate,
            manufacturer: bus.manufacturer,
            model: bus.model,
            year: bus.year,
            capacity: bus.capacity,
          });
          done();
        });
    });
    it('Admin should not register a bus that has been registered ', (done) => {
      const bus = {
        number_plate: 'ABWfdBW5',
        manufacturer: 'Toyota',
        model: 'matrix',
        year: '2013',
        capacity: 12,
      };
      request(app)
        .post('/api/v1/bus')
        .set('x-access-token', admin.token)
        .send(bus)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.error).to.equal('Car with this number plate already exist');
          done();
        });
    });
    it('should not register a bus if user is not admin', (done) => {
      const bus = {
        number_plate: 'ABssWfdBW5',
        manufacturer: 'Toyota',
        model: 'matrix',
        year: '2013',
        capacity: 12,
      };
      request(app)
        .post('/api/v1/bus')
        .set('x-access-token', user.token)
        .send(bus)
        .end((err, res) => {
          expect(res.status).to.equal(403);
          done();
        });
    });
  });
});

describe('Trip endpoints test', () => {
  describe('/post api/v1/trips', () => {
    it('should create a trip', (done) => {
      const trip = {
        bus_id: anotherBus.bus_id,
        origin: 'Epe',
        destination: 'Berger',
        fare: 200,
      };
      request(app)
        .post('/api/v1/trips')
        .send(trip)
        .set('Accept', 'application/json')
        .set('x-access-token', admin.token)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body.data).to.include({
            origin: trip.origin,
            destination: trip.destination,
            fare: trip.fare,
          });
          done();
        });
    });
    it('should not create a trip for bus currently on a trip', (done) => {
      const trip = {
        bus_id: busTest.bus_id,
        origin: 'Yaba',
        destination: 'somolu',
        fare: 100,
      };
      request(app)
        .post('/api/v1/trips')
        .send(trip)
        .set('Accept', 'application/json')
        .set('x-access-token', admin.token)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
    });
    it('should not create a trip for bus does not exist', (done) => {
      const trip = {
        bus_id: 6,
        origin: 'Somolu',
        destination: 'Maryland',
        fare: 100,
      };
      request(app)
        .post('/api/v1/trips')
        .send(trip)
        .set('x-access-token', admin.token)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
    });
    it('should not create a trip for imcomplete data', (done) => {
      const trip = {
        origin: 'Yaba',
        destination: 'Ikorudu',
        fare: 1000,
        status: true,
        trip_date: moment(new Date()),
      };
      request(app)
        .post('/api/v1/trips')
        .send(trip)
        .set('x-access-token', admin.token)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
    });
  });
  describe('/get  /api/v1/trips', () => {
    it('should get all trips', (done) => {
      request(app)
        .get('/api/v1/trips')
        .set('x-access-token', admin.token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });
  });
});

describe('Booking endpoints test', () => {
  describe('/post  /api/v1/bookings', () => {
    it('should create a booking', (done) => {
      const booking = { trip_id: tripTest.trip_id };
      request(app)
        .post('/api/v1/bookings')
        .send(booking)
        .set('Accept', 'application/json')
        .set('x-access-token', user.token)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body.data).to.include({
            trip_id: tripTest.trip_id,
            bus_id: busTest.bus_id,
          });
          done();
        });
    });
    it('should not duplicate a booking for the same user  ', (done) => {
      const booking = { trip_id: tripTest.trip_id };
      request(app)
        .post('/api/v1/bookings')
        .send(booking)
        .set('Accept', 'application/json')
        .set('x-access-token', user.token)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
    });
    it('should return 404 for invalid trip', (done) => {
      const booking = { trip_id: 10000 };
      request(app)
        .post('/api/v1/bookings')
        .send(booking)
        .set('x-access-token', user.token)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
    });
    it('should not create a booking for no trip', (done) => {
      const booking = { };
      request(app)
        .post('/api/v1/bookings')
        .send(booking)
        .set('x-access-token', user.token)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
    });
  });

  describe('/get  /api/v1/bookings', () => {
    it('should get all bookings', (done) => {
      request(app)
        .get('/api/v1/bookings')
        .set('x-access-token', user.token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });
  });

  describe('/get  /api/v1/bookings', () => {
    it('should not delete another user booking', (done) => {
      request(app)
        .delete(`/api/v1/bookings/${bookingTest.booking_id}`)
        .set('x-access-token', user.token)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
    });
  });
  it('should delete a bookings', (done) => {
    request(app)
      .delete(`/api/v1/bookings/${bookingTest.booking_id}`)
      .set('x-access-token', admin.token)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
  });
  it('should return 404 for booking that does not exist', (done) => {
    const bookingId = 10000;
    request(app)
      .delete(`/api/v1/bookings/${bookingId}`)
      .set('x-access-token', user.token)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
  });
});

describe('/Get  /api/v1/search', () => {
  it('should filter trips', (done) => {
    const search = {
      origin: tripTest.origin,
    };
    request(app)
      .get('/api/v1/search')
      .send(search)
      .set('x-access-token', user.token)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
  });
  it('should return 404 if no trip is found', (done) => {
    const search = {
      origin: 'Ketu',
    };
    request(app)
      .patch('/api/v1/search')
      .send(search)
      .set('x-access-token', user.token)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
  });
});

describe('/Patch  /api/v1/trips', () => {
  it('should cancel a trip', (done) => {
    request(app)
      .put(`/api/v1/trips/${tripTest.trip_id}`)
      .set('x-access-token', admin.token)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
  });
  it('should return 404 for invalid trip', (done) => {
    const tripId = 'dd';
    request(app)
      .patch(`/api/v1/trips/${tripId}`)
      .set('x-access-token', admin.token)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
  });
});

