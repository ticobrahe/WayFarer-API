import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

const app = express();
const port = process.env.port || 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
dotenv.config();

app.use('/', (req, res) => {
  res.send({
    name: 'Samel',
    id: 2,
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(port);
});
