import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import route from './routes/index';
import helper from './controllers/helper';

const app = express();
const port = process.env.port || 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

dotenv.config();

const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  console.log(env);
} else {
  console.log('dev');
}

app.get('/', (req, res) => {
  const id = 2;
  const token = helper.generateToken(id);
  res.send(token);
});

app.use('/api/v1', route);

app.listen(port, () => {
  console.log(port);
});
export default app;
