import { ScheduleManager } from "./model";
import router from "./router";

export default function init() {
  new ScheduleManager();

  return {
    router,
	route: 'schedules',
    name: "Schedule",
  };
}
