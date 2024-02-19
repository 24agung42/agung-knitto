"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mysql_1 = __importDefault(require("mysql"));
dotenv_1.default.config();
const env = process.env;
const con = mysql_1.default.createConnection({
    host: env.HOST,
    user: env.USER,
    password: env.PASSWORD,
    database: env.DATABASE
});
con.connect(function (err) { if (err)
    console.log(err); });
exports.default = con;
