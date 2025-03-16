import router from "./router";

export default function init() {
  return {
    router,
    route: "invoices",
    name: "Invoice",
  };
}
