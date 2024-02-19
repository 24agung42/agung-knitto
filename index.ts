import bodyparser from 'body-parser';
import express from 'express';
import routes from './routes';
import dotenv from 'dotenv';

const app = express();

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
app.use(routes);

dotenv.config();
const env = process.env;
app.listen(env.PORT, () => { console.log('Running with port : '+env.PORT); });