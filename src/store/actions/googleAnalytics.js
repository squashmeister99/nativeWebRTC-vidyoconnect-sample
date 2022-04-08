export const callEndAnalytics = (reason) => ({
  type: "CALL_END",
  reason,
});

export const joinAnalytics = (typeJoin) => ({
  type: "CALL_JOIN",
  typeJoin,
});

export const shareAnalytics = () => ({
  type: "CALL_CONTENT_SHARE",
});

export const callChat = (chatType) => ({
  type: "CALL_CHAT",
  chatType,
});

export const callDeviceState = (device) => ({
  type: "DEVICES_STATE",
  device,
});

export const joinRoomType = (roomType) => ({
  type: "CALL_ROOMTYPE",
  roomType,
});

export const clickOnAudioTab = (screen) => ({
  type: "CLICK_ON_AUDIO_VIDEO_TAB",
  screen,
});

export const rightClickOnDevice = (device) => ({
  type: "RIGHT_CLICK_ON_DEVICE",
  device,
});

export const clickOnArrowBtnNextToDeviceIcon = (device) => ({
  type: "CLICK_ON_ARROW_BTN_NEXT_TO_DEVICE_ICON",
  device,
});

export const callDeviceChange = (roomType) => ({
  type: "CALL_DEVICE_CHANGE",
  roomType,
});

export const appLaunch = (typeLaunch) => ({
  type: "APP_LAUNCH",
  typeLaunch,
});

export const exitAfterAloneInCall = () => ({
  type: "CALL_EXIT_AFTER_ALONE",
});

export const browserIsNotSupported = (info) => ({
  type: "BROWSER_IS_NOT_SUPPORTED",
  info,
});

export const noDevicePermission = (info) => ({
  type: "NO_PERMISSION",
  info,
});

export const gaOpenPostCallURL = (roomType) => ({
  type: "OPEN_POST_CALL_URL",
});

export const qaEpicWaitingRoomMediaContent = (info) => ({
  type: "EPIC_WAITING_ROOM_MEDIA_CONTENT",
  info,
});
