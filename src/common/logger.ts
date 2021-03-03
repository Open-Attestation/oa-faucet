import debug from "debug";

import { name } from "../../package.json";

if (!process.env.JEST_WORKER_ID) {
  // enable log outputs if not running in jest
  // also disable annoying axios follow redirects logs
  debug.enable("*,-follow-redirects");
}

const logger = debug(name);

export interface Logger {
  trace: debug.Debugger;
  debug: debug.Debugger;
  info: debug.Debugger;
  warn: debug.Debugger;
  error: debug.Debugger;
}

export const getLogger = (namespace: string): Logger => ({
  trace: logger.extend(`trace:${namespace}`),
  debug: logger.extend(`debug:${namespace}`),
  info: logger.extend(`info:${namespace}`),
  warn: logger.extend(`warn:${namespace}`),
  error: logger.extend(`error:${namespace}`),
});
