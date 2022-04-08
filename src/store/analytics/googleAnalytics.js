import { createMiddleware } from "redux-beacon";
import GoogleAnalytics, { trackEvent } from "@redux-beacon/google-analytics";

const contentShare = trackEvent((action) => ({
  action: "contentShare",
  category: "Conference",
  label: "shareFromWeb",
}));

const callJoin = trackEvent((action) => ({
  action: "join",
  category: "Conference",
  label: action.typeJoin,
}));

const callEnd = trackEvent((action) => ({
  action: "end",
  category: "Conference",
  label: action.reason,
}));

const callChat = trackEvent((action) => ({
  action: "chat",
  category: "Conference",
  label: action.chatType,
}));

const callDeviceState = trackEvent((action) => ({
  action: "deviceState",
  category: "App",
  label: action.event,
}));

const callRoomType = trackEvent((action) => ({
  action: "roomType",
  category: "Conference",
  label: action.roomType,
}));

const appLaunch = trackEvent((action) => ({
  action: "Launch",
  category: "Application",
  label: action.typeLaunch,
}));

const clickOnAudioVideoTab = trackEvent((action) => ({
  action: "AudioVideoTab",
  category: "Friendly_device_selection",
  label: action.screen,
}));

const rightClickOnDevice = trackEvent((action) => ({
  action: "deviceRightClick",
  category: "Friendly_device_selection",
  label: action.device,
}));

const clickOnArrowBtnNextToDeviceIcon = trackEvent((action) => ({
  action: "clickOnArrowBtnNextToDeviceIcon",
  category: "Friendly_device_selection",
  label: action.device,
}));

const callDeviceChange = trackEvent((action) => ({
  action: "deviceChanges",
  category: "Conference",
  label: action.device,
}));

const exitAfterAloneInCall = trackEvent((action) => ({
  action: "exitAfterAloneInCall",
  category: "Conference",
}));

const browserIsNotSupported = trackEvent((action) => ({
  action: "browserIsNotSupported",
  category: "Application",
  label: action.info,
}));

const noDevicePermission = trackEvent((action) => ({
  action: "noDevicePermission",
  category: "Application",
  label: action.info,
}));

const openPostCallUrl = trackEvent((action) => ({
  action: "openPostCallURL",
  category: "PostCallURL",
}));

const epicWaitingRoomMediaContent = trackEvent((action) => ({
  action: "epicWaitingRoomMediaContent",
  category: "Conference",
  label: action.info,
}));

// Match the event definition to a Redux action:
const eventsMap = {
  CALL_END: callEnd,
  CALL_EXIT_AFTER_ALONE: exitAfterAloneInCall,
  CALL_CONTENT_SHARE: contentShare,
  CALL_JOIN: callJoin,
  CALL_CHAT: callChat,
  CALL_DEVICES_STATE: callDeviceState,
  CALL_ROOMTYPE: callRoomType,

  APP_LAUNCH: appLaunch,
  BROWSER_IS_NOT_SUPPORTED: browserIsNotSupported,
  NO_PERMISSION: noDevicePermission,
  CLICK_ON_AUDIO_VIDEO_TAB: clickOnAudioVideoTab,
  RIGHT_CLICK_ON_DEVICE: rightClickOnDevice,
  CLICK_ON_ARROW_BTN_NEXT_TO_DEVICE_ICON: clickOnArrowBtnNextToDeviceIcon,
  CALL_DEVICE_CHANGE: callDeviceChange,
  OPEN_POST_CALL_URL: openPostCallUrl,
  EPIC_WAITING_ROOM_MEDIA_CONTENT: epicWaitingRoomMediaContent,
};

// Create the middleware
const ga = GoogleAnalytics();
export const gaMiddleware = createMiddleware(eventsMap, ga);
