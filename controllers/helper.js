import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

exports.validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

exports.hashPassword = (password) => {
  const decrypt = bcrypt.hashSync(password, bcrypt.genSaltSync(8));
  return decrypt;
};

exports.generateToken = (id) => {
  const payload = { id };
  const options = { expiresIn: '2d' };
  const secret = process.env.JWT_SECRET;
  const token = jwt.sign(payload, secret, options);
  return token;
};
