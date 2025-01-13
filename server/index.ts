import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getAction } from './src/utils';

dotenv.config();

const app = express();

const corsOptions = {
	origin: process.env.ALLOW_API_ACCESS?.split(',') || [],
	credentials: true,
};
app.use(cors(corsOptions));

app.use(cookieParser());

const port = process.env.PORT || 3000;

getAction().then((data) => {
	console.log(data);
});

app.listen(port, function () {
	console.log(`Server is running on port: ${port}`);
});
