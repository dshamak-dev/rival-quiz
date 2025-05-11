import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import placeholderImage from '@assets/placeholders/p_01.png';
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import fs from 'fs';
import { v2 as cloudinary, UploadStream } from 'cloudinary';
import { Readable } from 'stream';

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

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfbe0k249',
	api_key: process.env.CLOUDINARY_API_KEY || '868594447316816',
	api_secret: process.env.CLOUDINARY_API_SECRET || 'm0XPfQ9W5dVGvL1ufugRWe_i7h0',
});

async function uploadToCloudinary(file: File): Promise<any> {
	const buffer = Buffer.from(await file.arrayBuffer());

	if (!buffer) return Promise.reject('No file uploaded');

	const uploadId = randomUUID();

	const res = new Promise<UploadStream | any>((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{ resource_type: 'auto', filename_override: uploadId },
			(error, result) => {
				if (error) return reject(error.message);

				resolve(result);
			}
		);

		// Convert buffer to stream and pipe it
		Readable.from(buffer).pipe(uploadStream);
	});

	return res;
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const imageFile = formData.get('file') as File | null;

	if (!imageFile || typeof imageFile === 'string') {
		return new Response('Invalid file', { status: 400 });
	}

	const uploadResult = await uploadToCloudinary(imageFile);

	if (!uploadResult) {
		return new Response('Failed to upload', { status: 500 });
	}

	return {
		...uploadResult,
		imageUrl: uploadResult?.url,
	};
}

/**
cloudinary.uploader.destroy('your_file_public_id', { resource_type: 'image' })
  .then(result => console.log('Deleted:', result))
  .catch(err => console.error('Delete error:', err));

* your_file_public_id: This is usually the file name without the extension or folder path if you organized it.
* resource_type: Optional. Use 'image', 'video', or 'raw'. Default is 'image'.

function getPublicIdFromUrl(url: string): string {
  const parts = url.split('/');
  const fileWithExt = parts[parts.length - 1];
  const publicId = fileWithExt.split('.')[0]; // 'sample'
  return publicId;
}
 */
