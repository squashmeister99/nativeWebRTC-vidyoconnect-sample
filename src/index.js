import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import RouterComponent from "./router";
import logger from "utils/logger";
import { loadScript } from "utils/loaders.js";
import store from "./store";
import { diactivateTab } from "store/actions/app";
import { updateAvailableResources } from "store/actions/call";
import { isBlurEffectSupported } from "utils/useBlurEffect";

import runMultipleTabsDetection from "utils/multipleTabsDetection";
import { isIOS, isMobileSafari, deviceDetect } from "react-device-detect";
import { Stethoscope } from "features";

import "./translations/i18n";
import "./styles/index.scss";

const environment = deviceDetect();

logger.warn(`App version is ${window.appConfig.APP_VERSION}`);
logger.warn({ environment });

if (process.env.NODE_ENV !== "production") {
  logger.warn("not in production mode");
}

window.addEventListener("orientationchange", () => {
  setTimeout(() => {
    window.scroll(0, 1);
  }, 500);
});
window.addEventListener("resize", () => {
  setTimeout(() => {
    window.scroll(0, 1);
  }, 500);
});

if (isBlurEffectSupported) {
  window.addEventListener("load", () => {
    loadScript("./banuba/BanubaPlugin.js", true);
  });
  window.banubaIsSupported = true;
}

function calcMobileWinSize() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--windowHeight", `${vh}px`);
}
if (isMobileSafari && isIOS) {
  document.body.classList.add("ios-safari");
  window.addEventListener("load", calcMobileWinSize);
  window.addEventListener("resize", calcMobileWinSize);
}

runMultipleTabsDetection({
  storagePrefix: process.env.REACT_APP_NAME.toLowerCase(),
  onPageAdded() {
    logger.error("New page added");
    store.dispatch(diactivateTab());
  },
}).then(() => {
  logger.info("runMultipleTabsDetection started");
});

// just for testing
window.availableResourcesChange = (
  cpuEncode,
  cpuDecode,
  bandwidthSend,
  bandwidthReceive
) => {
  store.dispatch(
    updateAvailableResources({
      cpuEncode,
      cpuDecode,
      bandwidthSend,
      bandwidthReceive,
    })
  );
};

ReactDOM.render(
  <Provider store={store}>
    <RouterComponent />
    <Stethoscope.Global />
  </Provider>,
  document.getElementById("root")
);
