import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { cameraTurnOn, cameraTurnOff } from "store/actions/devices";
import MicrophoneSelectList from "./selects/MicrophoneSelectList";
import SpeakerSelectList from "./selects/SpeakerSelectList";
import CameraSelectList from "./selects/CameraSelectList";
import SelfView from "containers/SelfView";
import "./MediaTab.scss";
import { Checkbox, Classes } from "@blueprintjs/core";
import storage from "../../../../utils/storage";
import useBlurEffect, { isBlurEffectSupported } from "utils/useBlurEffect";
import { Stethoscope } from "features";

const MediaTab = () => {
  const { t } = useTranslation();
  const [blurEffectAvailable] = useBlurEffect();
  const [blurBackground, setBlurBackground] = useState(
    !!storage.getItem("blurBackground")
  );
  const [showSelfView, setShowSelfView] = useState(true);
  const isCameraTurnedOn = useSelector(
    (state) => state.devices.isCameraTurnedOn
  );
  const selectedCamera = useSelector((state) => state.devices.selectedCamera);
  const dispatch = useDispatch();

  const onChangeBlurBackground = async (event = {}) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      const isBanubaInited = window.banuba?.isBanubaInited;
      setBlurBackground(isChecked);
      storage.addItem("blurBackground", isChecked);
      await window.banuba.applyEffect();
      if (!isBanubaInited) {
        if (selectedCamera && isCameraTurnedOn) {
          // reset local camera
          dispatch(cameraTurnOff({ selectedCamera }));
          dispatch(cameraTurnOn({ selectedCamera }));
        } else {
          // reset self-view
          setShowSelfView(false);
          setTimeout(() => setShowSelfView(true), 100);
        }
      }
    } else {
      window.banuba.clearEffect();
      setBlurBackground(isChecked);
      storage.addItem("blurBackground", isChecked);
    }
  };

  return (
    <div className="settings-tab-content media-tab-content">
      <div className="settings-tab-content-header">
        {t("SETTINGS_AUDIO_VIDEO")}
      </div>
      <div className="settings-tab-content-body">
        <div className="tab-content-body-panel left-pane">
          <MicrophoneSelectList />
          <SpeakerSelectList />
          <Stethoscope.SelectList />
        </div>
        <div className="tab-content-body-panel right-pane">
          <CameraSelectList />
          {showSelfView && <SelfView ignoreMuteState={true} />}
          <div className="checkbox-section blur-checkbox">
            {blurEffectAvailable && (
              <Checkbox
                checked={blurBackground}
                onChange={onChangeBlurBackground}
                className={`${Classes.INTENT_SUCCESS}`}
                label={t("BLUR_BACKGROUND")}
              />
            )}
            {!blurEffectAvailable && isBlurEffectSupported && (
              <span>{t("LOADING_BLUR_EFFECT")}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaTab;
