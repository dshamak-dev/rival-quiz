import cron from "node-cron";
import { loadScheduleTasks, onTaskCompleted } from "./action";
import { ScheduleTask } from "./types";

export class ScheduleManager {
  static jobs: Map<string, Job> = new Map();

  constructor() {
    this.init();
  }

  async init() {
    const tasks = await loadScheduleTasks();

    tasks?.forEach((task) => {
      if (!cron.validate(task.cronTime)) {
        console.error(`Invalid cron expression for ${task.id}`);
        return;
      }

      this.addJob(task.id, task);
    });
  }

  addJob(name: string, task: ScheduleTask) {
    if (!task.data) {
      console.error(`No schedule data found for ${task.id}`);
      return;
    }

    const job = new Job(task);

    ScheduleManager.jobs.set(name, job);

    console.log(`Added job "${name}" with cron expression "${job.name}"`);

    return job;
  }
}

export class Job {
  name: string;
  endAt: Date;
  cronTime?: string;
  cronJob?: cron.ScheduledTask;
  timeout?: NodeJS.Timeout;
  origin: ScheduleTask;
  callback: () => void;

  get running() {
    return this.cronJob != null || this.timeout != null;
  }

  constructor(task: ScheduleTask) {
    this.name = task.id;
    this.origin = task;

    this.endAt = new Date(task.data.endAt);
    this.callback = () => onTaskCompleted(task);

    if (task.cronTime) {
      this.createCronJob(task.cronTime);
    } else {
      this.createTimeout();
    }
  }

  createTimeout() {
    const duration = this.endAt.getTime() - Date.now();
    this.timeout = setTimeout(this.callback, duration);
  }

  createCronJob(cronTime) {
    this.cronTime = cronTime;

    this.cronJob = cron.schedule(cronTime, this.callback);

    return this.cronJob;
  }
}
