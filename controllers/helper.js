import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

exports.validateUser = (req, res) => {
  if (!req.body.email || !req.body.password || !req.body.first_name || !req.body.last_name) {
    res.status(400).send({
      status: 'error',
      error: 'Some values are missing',
    });
  }
};

exports.valideEmail = (email) => { /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); };

exports.hashPassword = (password) => { bcrypt.hashSync(password, bcrypt.genSaltSync(8)); };

exports.generateToken = (id) => {
  const payload = { userId: id };
  const options = { expiresIn: '2d' };
  const secret = process.env.JWT_SECRET;
  const token = jwt(payload, secret, options);
  return token;
};
