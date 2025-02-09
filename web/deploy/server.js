import { createRequestHandler } from '@remix-run/express';
import https from 'https';
import express from 'express';
import * as build from './build/server/index.js';

const app = express();

const HTTPS_ONLY = process.env.HTTPS_ONLY === 'true';

app.use((req, res, next) => {
	if (HTTPS_ONLY && req.headers['x-forwarded-proto'] !== 'https') {
		return res.redirect(301, `https://${req.headers.host}${req.url}`);
	}
	next();
});

app.use(express.static('public'));

app.use(express.static('build/client'));

app.all('*', createRequestHandler({ build }));

const httpsOptions = {};

app.listen(80, () => {
	console.log(`App listening on express ${80} port`);
});

const httpsServer = https.createServer(httpsOptions, app);

httpsServer.listen(443, () => {
	console.log(`App listening on ${443} port`);
});
