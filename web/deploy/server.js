import { createRequestHandler } from '@remix-run/express';
import https from 'https';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
// notice that the result of `remix vite:build` is "just a module"
import * as build from './build/server/index.js';

const app = express();

const HTTPS_ONLY = process.env.HTTPS_ONLY === 'true';
const isLocal = process.env.NODE_ENV === 'development';

app.use((req, res, next) => {
	if (HTTPS_ONLY && req.headers['x-forwarded-proto'] !== 'https') {
		return res.redirect(301, `https://${req.headers.host}${req.url}`);
	}
	next();
});

app.use(express.static('public'));

app.use(express.static('build/client'));

// and your app is "just a request handler"
app.all('*', createRequestHandler({ build }));

// Equivalent of __filename
const __filename = fileURLToPath(import.meta.url);
// Equivalent of __dirname
const __dirname = path.dirname(__filename);

const SSL_PATH = path.join(__dirname, './ssl');
const httpsOptions = {
	// key: fs.readFileSync('./public/ssl/private.key'),
	// cert: fs.readFileSync(path.join(SSL_PATH, 'certificate.crt')),
	// ca: fs.readFileSync(path.join(SSL_PATH, 'bundle.crt')),
};

app.listen(80, () => {
	console.log(`App listening on express ${80} port`);
});

const httpsServer = https.createServer(httpsOptions, app);

httpsServer.listen(443, () => {
	console.log(`App listening on ${443} port`);
});
