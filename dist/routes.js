"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const koneksi_1 = __importDefault(require("./koneksi"));
dotenv.config();
const router = express_1.default.Router();
let env = process.env;
router.get('/', (req, res) => {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const format_date = date.getFullYear() + "-" + month + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    console.log('Request : ', format_date);
    res.send('WELCOME');
});
router.get('/user', (req, res, next) => {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        var q = "SELECT DISTINCT "
            + "COALESCE(TRIM(b.fullname),'') AS fullname, "
            + "COALESCE(TRIM(a.username),'') AS username, "
            + "COALESCE(TRIM(a.password),'') AS password, "
            + "CASE COALESCE(b.sex,0) WHEN 0 THEN 'MALE' ELSE 'FEMALE' END AS sex, "
            + "COALESCE(TRIM(b.email),'') AS email "
            + "FROM tb_user a LEFT JOIN tb_user_detail b ON a.nik = b.nik";
        res.send(yield getQuery(q));
    }))();
});
router.post('/login', (req, res) => {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        if (typeof req.body.username == 'undefined' || typeof req.body.password == 'undefined') {
            res.send('Failed Format JSON!');
        }
        else {
            const username = req.body.username;
            const password = crypto_1.default.createHash('md5').update(req.body.password).digest('hex');
            var q = "SELECT DISTINCT "
                + "COALESCE(TRIM(b.fullname),'') AS fullname, "
                + "CASE COALESCE(b.sex,0) WHEN 0 THEN 'MALE' ELSE 'FEMALE' END AS sex, "
                + "COALESCE(TRIM(b.email),'') AS email, "
                + "COALESCE(TRIM(a.password),'') AS password "
                + "FROM tb_user a LEFT JOIN tb_user_detail b ON a.nik = b.nik "
                + "WHERE a.username = '" + username + "'";
            const rows = (yield getQuery(q))[0];
            if (Array.isArray(rows) && rows.length == 0) {
                res.send('No Registed!');
            }
            else {
                if (rows.password != password) {
                    res.send('Wrong Password!');
                }
                else {
                    res.json({ accessToken: jsonwebtoken_1.default.sign({
                            name: rows.fullname,
                            email: rows.email,
                            sex: rows.sex
                        }, env.ACCESS_TOKEN_SECRET) });
                }
            }
        }
    }))();
});
router.post('/posts', function (req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null)
        return res.sendStatus(403);
    jsonwebtoken_1.default.verify(token, env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403);
        req.user = user;
        next();
    });
}, (req, res) => {
    const send = req;
    res.send("Name : " + send.user.name + "<br>" +
        "Sex : " + send.user.sex + "<br>" +
        "Email : " + send.user.email);
});
exports.default = router;
function getQuery(q) {
    return new Promise((resolve) => {
        koneksi_1.default.query(q, function (err, result) {
            if (err) {
                resolve(err.sqlMessage);
            }
            else {
                resolve(result);
            }
        });
    });
}
