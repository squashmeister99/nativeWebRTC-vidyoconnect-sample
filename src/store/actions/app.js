import {
  INIT,
  GENERATE_LOGS,
  PERMISSIONS_CHANGES_SUBSCRIBE,
  ENABLE_DEBUG_LOG_LEVEL,
  DIACTIVATE_TAB,
  UNINIT,
} from "./types/app";

export const init = (payload) => ({
  type: INIT,
  payload,
});

export const unInit = (payload) => ({
  type: UNINIT,
  payload,
});

export const generateLogs = (payload) => ({
  type: GENERATE_LOGS,
  payload,
});

export const subscribeOnPermissionsChanges = () => ({
  type: PERMISSIONS_CHANGES_SUBSCRIBE,
});

export const enableDebugLogLevel = () => ({
  type: ENABLE_DEBUG_LOG_LEVEL,
});

export const diactivateTab = (payload) => ({
  type: DIACTIVATE_TAB,
  payload,
});
