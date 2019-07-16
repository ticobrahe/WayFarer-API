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
app.use('/api/v1', route);

if (env === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err,
    });
  });
}

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {},
  });
});

app.get('/', (req, res) => {
  const id = 2;
  const token = helper.generateToken(id);
  res.send(token);
});

app.listen(port, () => {
  console.log(port);
});
export default app;
