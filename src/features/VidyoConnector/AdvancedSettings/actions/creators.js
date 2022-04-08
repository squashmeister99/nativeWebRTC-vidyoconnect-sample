import {
  ADD_LOG_CATEGORY,
  DISABLE_STATS,
  SET_AUDIO_ONLY_MODE,
  SET_AUTO_RECONNECT,
  SET_COMPOSITOR_FIXED_PARTICIPANTS,
  SET_CONNECTOR_API_LOGGING,
  SET_SIMPLE_API_LOGGING,
  SET_SIMULCAST,
  SET_TRANSPORT_CC,
  SET_UNIFIED_PLAN,
  SET_MAX_RECONNECT_ATTEMPTS,
  SET_PARTICIPANT_LIMIT,
  SET_RECONNECT_BACKOFF,
  SHOW_STATS_OVERLAY,
} from "./types";

export const addLogCategory = (logCategory) => ({
  type: ADD_LOG_CATEGORY,
  logCategory,
});

export const disableStats = (disable) => ({
  type: DISABLE_STATS,
  disable,
});

export const setAudioOnlyMode = (enabled) => ({
  type: SET_AUDIO_ONLY_MODE,
  enabled,
});

export const setAutoReconnect = (enabled) => ({
  type: SET_AUTO_RECONNECT,
  enabled,
});

export const setCompositorFixedParticipants = (enabled) => ({
  type: SET_COMPOSITOR_FIXED_PARTICIPANTS,
  enabled,
});

export const setConnectorApiLogging = (enabled) => ({
  type: SET_CONNECTOR_API_LOGGING,
  enabled,
});

export const setSimpeApiLogging = (enabled) => ({
  type: SET_SIMPLE_API_LOGGING,
  enabled,
});

export const setSimulcast = (enabled) => ({
  type: SET_SIMULCAST,
  enabled,
});

export const setTransportCc = (enabled) => ({
  type: SET_TRANSPORT_CC,
  enabled,
});

export const setUnifiedPlan = (enabled) => ({
  type: SET_UNIFIED_PLAN,
  enabled,
});

export const setMaxReconnectAttempts = (maxAttempts) => ({
  type: SET_MAX_RECONNECT_ATTEMPTS,
  maxAttempts,
});

export const setParticipantLimit = (limit) => ({
  type: SET_PARTICIPANT_LIMIT,
  limit,
});

export const setReconnectBackoff = (backoff) => ({
  type: SET_RECONNECT_BACKOFF,
  backoff,
});

export const showStatisticsOverlay = (show) => ({
  type: SHOW_STATS_OVERLAY,
  show,
});
