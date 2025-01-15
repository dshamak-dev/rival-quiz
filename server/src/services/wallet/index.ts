import router from "./router";

export default function init() {
	return {
		router,
        model: null,
        actions: null,
        middlewares: null,
        name: "Wallet",
	};
};
