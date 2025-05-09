import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import placeholderImage from '@assets/placeholders/p_01.png';
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import fs, { promises } from 'fs';

const root = process.cwd();
const UPLOAD_DIR = join(root, 'uploads');
const ASSETS_DIR = join(root, 'assets');

export async function loader({ request }: LoaderFunctionArgs) {
	const urlParts = new URL(request.url);

	const targetUrl = urlParts.searchParams.get('url');

	let image = placeholderImage;

	if (!targetUrl) {
		return redirect(image);
	}

	try {
		if (targetUrl.startsWith('http')) {
			return redirect(targetUrl);
		}

		let url = join(ASSETS_DIR, targetUrl);

		if (!fs.existsSync(url)) {
			url = url = join(UPLOAD_DIR, targetUrl);
		}

		if (fs.existsSync(url)) {
			image = url;
		}
	} catch (error) {
		console.error('Error reading image:', error);
	}

	return redirect(image);
}

export async function action({ request }: ActionFunctionArgs) {
	const requestURL = new URL(request.url);
	console.log('From URL:', requestURL.origin);

	// 1. Parse the form data
	const formData = await request.formData();
	const imageFile = formData.get('file') as File | null;

	// 2. Validate the file
	if (!imageFile || typeof imageFile === 'string') {
		return new Response('Invalid file', { status: 400 });
	}

	// 3. Generate random filename
	const fileExt = imageFile.name.split('.').pop();
	const randomName = `${randomUUID()}.${fileExt}`;
	const filePath = join(UPLOAD_DIR, randomName);

	// 4. Read file buffer and save to disk
	const fileBuffer = Buffer.from(await imageFile.arrayBuffer());

	if (!fs.existsSync(UPLOAD_DIR)) {
		await promises.mkdir(UPLOAD_DIR, { recursive: true });
	}
	writeFileSync(filePath, fileBuffer);

	const filtePath = `/uploads/${randomName}`;

	return {
		imageUrl: `${requestURL.origin.replace(/\/$/, '')}/${filtePath.replace(/^\//, '')}`,
	};
}
