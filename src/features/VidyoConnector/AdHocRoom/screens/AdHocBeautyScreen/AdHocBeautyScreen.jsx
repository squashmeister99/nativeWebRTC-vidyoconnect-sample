import React, { useEffect, useState, useCallback } from "react";
import { connect, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { Redirect, useLocation } from "react-router-dom";
import * as callActionCreators from "store/actions/call";
import * as devicesActionCreators from "store/actions/devices";
import * as configActionCreators from "store/actions/config";
import GuestSettingsIcon from "components/GuestSettingsIcon";
import MainLogoWhite from "components/MainLogoWhite";
import QuickMediaSettings from "containers/QuickMediaSettings";
import GuestJoin from "containers/GuestJoin";
import Settings from "containers/Settings";
import Modal from "components/Modal";
import Alert from "components/Alert";
import storage from "utils/storage";
import LoadingBlock from "components/LoadingBlock";
import { useLanguageDirection } from "utils/hooks";
import { useTranslation } from "react-i18next";
import AdHocRoomDialogs from "../../containers/AdHocRoomDialogs";
import { createAdHocRoom } from "../../actions/creators";
import { test } from "utils/helpers";
import "./AdHocBeautyScreen.scss";

const mapStateToProps = ({ app, call, devices, config, vc_adHocRoom }) => ({
  adHocRoom: vc_adHocRoom,
  isAppInited: app.inited,
  isCallJoining: call.joining,
  disconnectReason: call.disconnectReason,
  selectedCamera: devices.selectedCamera,
  isCameraTurnedOn: devices.isCameraTurnedOn,
  isMicrophoneTurnedOn: devices.isMicrophoneTurnedOn,
  isSpeakerTurnedOn: devices.isSpeakerTurnedOn,
  beautyScreenToggle: config.urlBeautyScreen.value,
  muteCameraOnJoinToggle: config.urlMuteCameraOnJoin.value,
  muteMicrophoneOnJoinToggle: config.urlMuteMicrophoneOnJoin.value,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(callActionCreators, dispatch),
  ...bindActionCreators(devicesActionCreators, dispatch),
  ...bindActionCreators(configActionCreators, dispatch),
});

const AdHocBeautyScreen = ({
  adHocRoom,
  isAppInited,
  startCall,
  isCallJoining,
  disconnectReason,
  selectedCamera,
  cameraTurnOn,
  cameraTurnOff,
  isCameraTurnedOn,
  microphoneTurnOn,
  microphoneTurnOff,
  isMicrophoneTurnedOn,
  speakerTurnOn,
  speakerTurnOff,
  isSpeakerTurnedOn,
  beautyScreenToggle,
  muteCameraOnJoinToggle,
  muteMicrophoneOnJoinToggle,
  setCompositorFixedParticipants,
}) => {
  const location = useLocation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const languageDirection = useLanguageDirection();
  const [areSettingsRendered, setSettingsRenderState] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState({});
  const [displayName, setDisplayName] = useState(
    location.state?.displayName || storage.getItem("displayName") || ""
  );

  if (!location.state) {
    location.state = { host: "" };
  }

  const onJoin = useCallback(
    ({ displayName }) => {
      setDisplayName(displayName);
      if (adHocRoom.isCreated) {
        startCall({
          host: adHocRoom.portal,
          roomKey: adHocRoom.roomKey,
          roomPin: adHocRoom.pin,
          displayName,
        });
      } else {
        dispatch(createAdHocRoom());
      }
    },
    [adHocRoom, dispatch, startCall]
  );

  const closeAlert = () => {
    setIsAlertOpen(false);
  };

  const toggleSettings = useCallback(() => {
    setSettingsRenderState(!areSettingsRendered);
  }, [areSettingsRendered]);

  useEffect(() => {
    setCompositorFixedParticipants({
      enableCompositorFixedParticipants: true,
    });
  }, [setCompositorFixedParticipants]);

  useEffect(() => {
    if (isAppInited && beautyScreenToggle && !muteCameraOnJoinToggle) {
      cameraTurnOn({ selectedCamera });
    }
    return () => {
      cameraTurnOff({ selectedCamera });
    };
    // eslint-disable-next-line
  }, [
    isAppInited,
    cameraTurnOn,
    cameraTurnOff,
    beautyScreenToggle,
    muteCameraOnJoinToggle,
  ]);

  useEffect(() => {
    if (isAppInited && beautyScreenToggle && !muteMicrophoneOnJoinToggle) {
      microphoneTurnOn();
    }
    return () => {
      microphoneTurnOff();
    };
  }, [
    isAppInited,
    microphoneTurnOn,
    microphoneTurnOff,
    beautyScreenToggle,
    muteMicrophoneOnJoinToggle,
  ]);

  useEffect(() => {
    if (isAppInited) {
      speakerTurnOn();
    }
    return () => {
      speakerTurnOff();
    };
  }, [isAppInited, speakerTurnOn, speakerTurnOff]);

  useEffect(() => {
    if (disconnectReason) {
      setAlertMessage({
        header: t("UNABLE_TO_JOIN_CONFERENCE"),
        text: t("ERROR_WHILE_JOINING_CONFERENCE_TRY_AGAIN"),
      });
      if (
        [
          "VIDYO_CONNECTORFAILREASON_RoomLocked",
          "VIDYO_CONNECTORFAILREASON_NotMember",
        ].includes(disconnectReason)
      ) {
        setAlertMessage({
          header: t("ROOM_IS_CURRENTLY_LOCKED"),
          text: t("YOU_CANNOT_JOIN_TO_LOCKED_ROOM"),
        });
      }
      setIsAlertOpen(true);
    }
    // eslint-disable-next-line
  }, [disconnectReason]);

  if (!isAppInited) {
    return (
      <div className="adhoc-initial-screen">
        <div className="content">
          <MainLogoWhite />
          <div className="initial-loader">
            <LoadingBlock />
          </div>
        </div>
      </div>
    );
  }

  if (isCallJoining) {
    return (
      <Redirect
        to={{
          pathname: "/JoiningCallScreen",
          state: {
            ...location.state,
            isCameraTurnedOn: beautyScreenToggle
              ? isCameraTurnedOn
              : !muteCameraOnJoinToggle,
            isMicrophoneTurnedOn: beautyScreenToggle
              ? isMicrophoneTurnedOn
              : !muteMicrophoneOnJoinToggle,
            isSpeakerTurnedOn,
            displayName,
          },
        }}
      />
    );
  }

  return (
    <div className="adhoc-beauty-screen" {...test("ADHOC_BEAUTY_SCREEN")}>
      <GuestSettingsIcon onClick={toggleSettings} />
      <div className="content" dir={languageDirection}>
        <div className="content-blocks">
          <div className="block-1">
            <MainLogoWhite />
            <Alert
              buttonText={t("OK")}
              onConfirm={closeAlert}
              message={alertMessage}
              isOpen={isAlertOpen}
            />
            <GuestJoin
              areSettingsRendered={areSettingsRendered}
              displayName={displayName}
              changeNameDisabled={false}
              onJoin={onJoin}
            />
          </div>
          {beautyScreenToggle && (
            <div className="block-2">
              <QuickMediaSettings />
            </div>
          )}
          <AdHocRoomDialogs onJoin={() => onJoin({ displayName })} />
        </div>
      </div>
      <Modal>
        {areSettingsRendered && <Settings onClose={toggleSettings} />}
      </Modal>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(AdHocBeautyScreen);
