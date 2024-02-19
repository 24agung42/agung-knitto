import dotenv from 'dotenv';
import mysql from 'mysql';

dotenv.config();
const env = process.env;
const con = mysql.createConnection({
  host: env.HOST,
  user: env.USER,
  password: env.PASSWORD,
  database: env.DATABASE
});
con.connect(function(err) { if (err) console.log(err); });

export default con;