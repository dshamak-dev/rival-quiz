export function parseURL(url: string) {
	let parts = { pathname: url };

	try {
		parts = new URL(url);
	} catch (error) {
		// Handle invalid URLs
        console.error('Invalid URL:', url);
	}

	return parts;
}