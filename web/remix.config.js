// /** @type {import('@remix-run/dev').AppConfig} */
// module.exports = {
// 	serverConfiguration: {
// 		port: process.env.PORT || 3003,
// 		host: process.env.HOST,
// 	},
//   serverModuleFormat: "cjs",
// 	future: {
// 		v2_dev: true,
// 	},
// };
module.exports = {
	appDirectory: 'app',
	assetsBuildDirectory: 'public/build',
	publicPath: '/build/',
	// If you're using TypeScript
	future: {
		strictMode: true, // To enable strict mode
	},
};
