export async function getAction() {
	return {
		deployed: new Date().toLocaleString()
	}
}