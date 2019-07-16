import { expect } from 'chai';
import request from 'supertest';
import moment from 'moment';
import app from '../index';
import { pool } from '../services/db';
import helper from '../controllers/helper';

let admin;
let user;
let busTest;
before(async () => {
  const client = await pool.connect();
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
  const resultAdmin = await client.query(queryAdmin, adminData);
  const adminToken = helper.generateToken(resultAdmin.rows[0].user_id);
  admin = resultAdmin.rows[0];
  admin.token = adminToken;
  // create user
  const resultUser = await client.query(queryUser, userData);
  const userToken = helper.generateToken(resultUser.rows[0].user_id);
  user = resultUser.rows[0];
  user.token = userToken;

  const queryBus = `INSERT INTO
        buses(number_plate, manufacturer, model, year, capacity, created_at)
        VALUES($1, $2, $3, $4, $5, $6) returning *`;
  const busData = ['AGSHHD', 'BMW', 'Xclass', '2002', 12, moment(new Date())];
  const resultBus = await client.query(queryBus, busData);
  busTest = resultBus.rows[0];
});

after(async () => {
  const queryUser = 'delete from users';
  const queryBus = 'delete from buses';
  const queryTrip = 'delete from trips';
  const client = await pool.connect();
  await client.query(queryBus);
  await client.query(queryUser);
  //await client.query(queryTrip);
});

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
        expect(res.status).to.equal(200);
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
        expect(res.status).to.equal(400);
        done();
      });
  });
});

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
        expect(res.status).to.equal(200);
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
  it('Admin should not register a bus that is already registered ', (done) => {
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
        expect(res.status).to.equal(400);
        done();
      });
  });
