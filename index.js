import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import route from './routes/index';

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

dotenv.config();

const env = process.env.NODE_ENV || 'development';
app.get('/', (req, res) => res.json({
  status: 'success',
  message: 'Welcome to wayfarer API. Visit this link for the documentation: https://documenter.getpostman.com/view/8323373/SVYrsyCR'
}));
app.use('/api/v1', route);
app.use((req, res) => res.status(404).json({
  status: 'error',
  error: `Route ${req.url} Not found`,
}));

app.listen(port, () => {
  console.log(port);
});
export default app;
