import { expect } from 'chai';
import request from 'supertest';
import app from '../index';

describe('/post /api/vi/auth/signup', () => {
  it('Should create a new user', (done) => {
    const user = {
      email: 'tibfbf@fgjccjjjjjnjnjnjnjvvjzjgmkail.com',
      password: 'tobi',
      first_name: 'kemi',
      last_name: 'olabii',
    };
    request(app)
      .post('/api/v1/auth/signup')
      .send(user)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body.data).to.include({
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
        });
        done();
      });
  });
  it('It should not create a user with invalid data', (done) => {
    const user = {
      first_name: 'tobi',
      last_name: 'kemi',
    };
    request(app)
      .post('/api/v1/auth/signup')
      .send(user)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
  });
});
