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

exports.comparePassword = (password, hashPassword) => {
  const compare = bcrypt.compareSync(password, hashPassword);
  return compare;
};

exports.generateToken = (id) => {
  const payload = { id };
  const options = { expiresIn: '2d' };
  const secret = process.env.JWT_SECRET;
  const token = jwt.sign(payload, secret, options);
  return token;
};

exports.availableSeat = (capacity, booked) => {
  const busCapacity = [];
  for (let i = 1; i <= capacity; i += 1) {
    busCapacity.push(i);
  }
  const availableSeat = [];
  for (const i in busCapacity) {
    if (!booked.includes(busCapacity[i])) availableSeat.push(busCapacity[i]);
  }
  return availableSeat;
}

exports.generateSeatNumber = (availableSeat) => {
  if (availableSeat.length > 0) {
    const seatNumber = availableSeat[Math.floor(Math.random() * availableSeat.length)];
    return seatNumber;
  }
  return 'no seats available';
};
