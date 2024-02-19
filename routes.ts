import express, {Response, Request, NextFunction} from 'express';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from './koneksi';

dotenv.config();

const router = express.Router();
let env = process.env;

router.get('/', (req: Request, res: Response) => {
	const date = new Date();
	const month = String(date.getMonth() + 1).padStart(2,'0');
	const format_date = date.getFullYear()+"-"+month+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
	console.log('Request : ', format_date);
	res.send('WELCOME');
});

router.get('/user', (req: Request, res: Response, next: NextFunction) => {
	(async () => {
		var q = "SELECT DISTINCT "
			+"COALESCE(TRIM(b.fullname),'') AS fullname, "
			+"COALESCE(TRIM(a.username),'') AS username, "
			+"COALESCE(TRIM(a.password),'') AS password, "
			+"CASE COALESCE(b.sex,0) WHEN 0 THEN 'MALE' ELSE 'FEMALE' END AS sex, "
			+"COALESCE(TRIM(b.email),'') AS email "
		+"FROM tb_user a LEFT JOIN tb_user_detail b ON a.nik = b.nik";
		res.send(await getQuery(q));
	})();
});

router.post('/login', (req: Request, res: Response) => {
	(async () => {
		if (typeof req.body.username == 'undefined' || typeof req.body.password == 'undefined') { res.send('Failed Format JSON!'); }
		else {
			const username = req.body.username;
			const password = crypto.createHash('md5').update(req.body.password).digest('hex');

			var q = "SELECT DISTINCT "
			+"COALESCE(TRIM(b.fullname),'') AS fullname, "
			+"CASE COALESCE(b.sex,0) WHEN 0 THEN 'MALE' ELSE 'FEMALE' END AS sex, "
			+"COALESCE(TRIM(b.email),'') AS email, "
			+"COALESCE(TRIM(a.password),'') AS password "
			+"FROM tb_user a LEFT JOIN tb_user_detail b ON a.nik = b.nik "
			+"WHERE a.username = '"+username+"'";
			const rows = (await getQuery(q) as any)[0];
			if (Array.isArray(rows) && rows.length == 0) { res.send('No Registed!'); }
			else {
				if (rows.password != password) { res.send('Wrong Password!'); }
				else { res.json({ accessToken:jwt.sign({
					name: rows.fullname,
					email: rows.email,
					sex: rows.sex
				}, env.ACCESS_TOKEN_SECRET as string) }); }
			}
		}
	})();
});

router.post('/posts', function (req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (token == null) return res.sendStatus(403);

	jwt.verify(token, env.ACCESS_TOKEN_SECRET as string, (err, user) => {
		if (err) return res.sendStatus(403);
		(req as any).user = user;
		next();
	});
}, (req, res) => { const send = (req as any); res.send(
	"Name : "+send.user.name+"<br>"+
	"Sex : "+send.user.sex+"<br>"+
	"Email : "+send.user.email
); });

export default router;

function getQuery(q: string) {
	return new Promise((resolve) => {
		db.query(q, function (err, result) {
			if (err) { resolve(err.sqlMessage); }
			else { resolve(result); }
		});
	});
}