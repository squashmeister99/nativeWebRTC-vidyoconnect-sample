import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useTranslation } from "react-i18next";
import * as devicesActionCreators from "store/actions/devices";
import * as googleAnalytics from "store/actions/googleAnalytics";
import DeviceToggle from "components/DeviceToggle";
import { test } from "utils/helpers";
import DeviceMenu from "../../DeviceMenu/DeviceMenu";
import SpeakerTestEnergyLevel from "../../../components/EnergyLevel/SpeakerTestEnergyLevel/SpeakerTestEnergyLevel";
import { Tooltip, Position } from "@blueprintjs/core";
import { useMobileDimension } from "utils/hooks";

const mapStateToProps = ({ devices }) => ({
  speakers: devices.speakers,
  selectedSpeaker: devices.selectedSpeaker,
  isSpeakerTurnedOn: devices.isSpeakerTurnedOn,
  isSpeakerDisabled: devices.isSpeakerDisabled,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(devicesActionCreators, dispatch),
  ...bindActionCreators(googleAnalytics, dispatch),
});

const SpeakerToggle = ({
  speakers,
  selectedSpeaker,
  isSpeakerDisabled,
  isSpeakerTurnedOn,
  speakerTurnOn,
  speakerTurnOff,
  showLabel,
  rightClickOnDevice,
  showTestSound,
  showTooltip = true,
  tooltipPosition,
}) => {
  const { t } = useTranslation();
  const [isMobileDimension] = useMobileDimension();

  const speakerOnClick = () => {
    isSpeakerTurnedOn ? speakerTurnOff() : speakerTurnOn();
  };

  const speakerOnMouseDown = (event) => {
    if (event.nativeEvent.which === 3) {
      rightClickOnDevice("speaker");
    }
  };

  const onPlayTestSound = () => {
    if (!isSpeakerTurnedOn) return;

    const iconSpeakerEnergyLevel = document.querySelector(
      "icon-speaker-test-energy-level"
    );
    iconSpeakerEnergyLevel.setAttribute(
      "play",
      iconSpeakerEnergyLevel.getAttribute("play") === "true" ? "false" : "true"
    );
  };
  const getSpeakerStateText = () => {
    if (isMobileDimension) return;

    return (
      <span
        dangerouslySetInnerHTML={{
          __html:
            `<b>${selectedSpeaker?.name}</b>` +
            (isSpeakerTurnedOn
              ? t("SPEAKER_TOOL_TIP_ACTIVE")
              : t("SPEAKER_TOOL_TIP_MUTED")),
        }}
      ></span>
    );
  };
  return (
    <div className="device-toggle">
      <Tooltip
        content={getSpeakerStateText()}
        position={tooltipPosition || Position.TOP_CENTER}
        portalClassName="device-tooltip"
        disabled={!showTooltip || isSpeakerDisabled}
      >
        <DeviceToggle
          {...test("SPEAKER_TOGGLE")}
          disabled={!speakers.length || !selectedSpeaker || isSpeakerDisabled}
          on={isSpeakerTurnedOn}
          classList="speaker"
          onClick={speakerOnClick}
          onMouseDown={speakerOnMouseDown}
        >
          {showTestSound &&
            speakers.length &&
            selectedSpeaker &&
            !isSpeakerDisabled && (
              <SpeakerTestEnergyLevel
                speakerId={selectedSpeaker && selectedSpeaker.id}
                isDisabled={!isSpeakerTurnedOn}
                playButtonId="speaker-test-btn"
              />
            )}
        </DeviceToggle>
      </Tooltip>
      <DeviceMenu
        deviceType="speaker"
        menuHeader={t("SELECT_SPEAKER")}
        disabled={!speakers.length || isSpeakerDisabled}
      >
        <button
          type="button"
          className="device-menu-toggle"
          {...test("SPEAKER_MENU_TOGGLE")}
        />
      </DeviceMenu>
      {showLabel && (
        <div className="toggle-label">
          <span>
            {isSpeakerDisabled
              ? t("SPEAKER_DISABLED")
              : selectedSpeaker
              ? selectedSpeaker.name
              : speakers.length
              ? t("NO_ACTIVE_SPEAKER")
              : t("NO_SPEAKER")}
          </span>
          {showTestSound &&
            speakers.length &&
            selectedSpeaker &&
            !isSpeakerDisabled && (
              <div className="speaker-test-wrapper">
                <Tooltip
                  content={t("TO_TEST_SOUND_UNMUTE_SPEAKER")}
                  position={Position.TOP}
                  disabled={isSpeakerTurnedOn}
                >
                  <button
                    type="button"
                    id="speaker-test-btn"
                    onClick={onPlayTestSound}
                    {...test("SPEAKER_TEST_BUTTON")}
                  />
                </Tooltip>
                <span
                  className="speaker-test-label"
                  {...test("SPEAKER_TEST_LABEL")}
                >
                  {t("TEST_SOUND")}
                </span>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(SpeakerToggle);
