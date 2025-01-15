import router from "./router";
import * as model from "./model";

export default function init() {
	return {
		router,
        model: model,
        actions: null,
        middlewares: null,
        name: "Broadcast",
	};
};
