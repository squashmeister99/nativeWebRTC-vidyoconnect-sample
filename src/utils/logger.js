import logger from "loglevel";
import prefix from "loglevel-plugin-prefix";

export const collectedLogs = [];

prefix.reg(logger);
prefix.apply(logger, {
  template: "%l (%n):",
  levelFormatter(level) {
    return level.toUpperCase();
  },
  nameFormatter(name) {
    return name || "default";
  },
  timestampFormatter(date) {
    return date.toISOString();
  },
});

let factory = logger.methodFactory;
logger.methodFactory = function (methodName, logLevel, loggerName) {
  var rawMethod = factory(methodName, logLevel, loggerName);
  return function (message) {
    collectedLogs.push({
      type: methodName,
      datetime: new Date(),
      value: [message],
    });
    rawMethod(message);
  };
};

logger.enableAll();
logger.setLevel("info");

export default logger;

export function startCollectingConsoleLogs() {
  const defaultLog = console.log;
  const defaultError = console.error;
  const defaultWarn = console.warn;
  const defaultDebug = console.debug;

  window.console.log = function () {
    collectedLogs.push({
      type: "log",
      datetime: new Date(),
      value: Array.from(arguments),
    });
    defaultLog.apply(window.console, arguments);
  };
  window.console.error = function () {
    collectedLogs.push({
      type: "error",
      datetime: new Date(),
      value: Array.from(arguments),
    });
    defaultError.apply(window.console, arguments);
  };
  window.console.warn = function () {
    collectedLogs.push({
      type: "warn",
      datetime: new Date(),
      value: Array.from(arguments),
    });
    defaultWarn.apply(window.console, arguments);
  };
  window.console.debug = function () {
    collectedLogs.push({
      type: "debug",
      datetime: new Date(),
      value: Array.from(arguments),
    });
    defaultDebug.apply(window.console, arguments);
  };
}

export function logCallbacks(target = {}) {
  let context = target.context || "";
  delete target.context;
  Object.keys(target).forEach((k) => {
    if (typeof target[k] === "function") {
      let method = target[k];
      target[k] = function (...args) {
        let callbackName = `Callback ${context || ""} ${k}`;
        if (process.env.NODE_ENV === `development`) {
          console.log({ [callbackName]: args });
        } else {
          let simplifiedCallbacksLog = `${callbackName}${
            args?.[0]?.name ? `, name: ${args[0].name}` : ""
          }`;
          if (context.includes("Remote")) {
            simplifiedCallbacksLog += args?.[1]?.name
              ? `, participant: ${args[1].name}`
              : "";
            if (k === "onStateUpdated") {
              simplifiedCallbacksLog += args?.[2] ? `, state: ${args[2]}` : "";
            }
          } else if (context.includes("Local") && k === "onStateUpdated") {
            simplifiedCallbacksLog += args?.[1] ? `, state: ${args[1]}` : "";
          } else if (context === "ConnectToRoomAsGuest") {
            simplifiedCallbacksLog += args?.[0] ? `, reason: ${args[0]}` : "";
          }
          console.log(simplifiedCallbacksLog);
        }
        method(...args);
      };
    }
  });
  return target;
}

export const customSimpleReduxLoggeer = (store) => (next) => (action) => {
  console.log(`Action: ${action.type}`);
  return next(action);
};
