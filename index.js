import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import route from './routes/index';
import helper from './controllers/helper';

const app = express();
const port = process.env.port || 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  const id = 2;
  const token = helper.generateToken(id);
  res.send(token);
});

app.use('/', route);

dotenv.config();

app.listen(port, () => {
  console.log(port);
});
