import { useState, useEffect } from "react";
import { isChrome, isMobile } from "react-device-detect";

const params = new URLSearchParams(window.location.search);
const blurParam =
  params.get("blur") || window.appConfig.REACT_APP_BLUR_BACKGROUND_ENABLED;

export default function useBlurEffect() {
  const [blurEffectAvailable, setBlurEffectAvailable] = useState(
    window.banubaPluginReady
  );

  useEffect(() => {
    const onBanubaPluginReady = () => {
      setBlurEffectAvailable(true);
    };
    window.addEventListener("BanubaPluginReady", onBanubaPluginReady, false);
    return () => {
      window.removeEventListener("BanubaPluginReady", onBanubaPluginReady);
    };
  }, [setBlurEffectAvailable]);

  return [blurEffectAvailable];
}

export const isBlurEffectSupported = blurParam && isChrome && !isMobile;
