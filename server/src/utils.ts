export async function getAction() {
	return {
		updates: new Date().toISOString(),
		name: 'John Doe',
        age: 32,
        email: 'johndoe@example.com',
        address: '123 Main St',
        city: 'Anytown',
	}
}