import { addLog } from "./api";
import router from "./router";

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  addLog({
    source: "uncaught-exception",
    message:
      typeof err === "string"
        ? err
        : err?.message ?? `Uncaught Exception: ${err}`,
    data: {},
  });
  // Optionally: notify or log, then maybe exit
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  addLog({
    source: "unhandled-rejection",
    message:
      typeof reason === "string"
        ? reason
        : (reason as any)?.message ?? `Unhandled Rejection: ${reason}`,
    data: {},
  });
});

export default function init() {
  return {
    router,
    route: "logger",
    name: "Logger",
  };
}
