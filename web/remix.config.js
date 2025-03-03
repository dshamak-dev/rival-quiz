/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
	serverConfiguration: {
		port: process.env.PORT || 3003,
		host: process.env.HOST,
	},
	serverModuleFormat: 'cjs',
	future: {
		v2_dev: true,
	},
};
