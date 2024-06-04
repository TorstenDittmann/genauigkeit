import { cpus } from "node:os";

export const DEVICES = ["mobile", "desktop"];
export const BROWSERS = ["chromium", "firefox", "webkit"];
export const CPU_COUNT = cpus().length;
