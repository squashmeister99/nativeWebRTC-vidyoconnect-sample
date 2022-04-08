import React, { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as userActionCreators from "store/actions/user";
import * as googleAnalytics from "store/actions/googleAnalytics";
import { useTranslation } from "react-i18next";
import { Button, Classes } from "@blueprintjs/core";
import BeautyInput from "components/BeautyInput";
import TermsConditionsPrivacy from "containers/TermsConditionsPrivacy";
import { test } from "utils/helpers";
import logger from "utils/logger";
import {
  isIOS,
  isAndroid,
  isSafari,
  isChrome,
  deviceDetect,
} from "react-device-detect";
import Spinner from "components/Spinner";
import Alert from "components/Alert";
import "./GuestJoin.scss";

const mapStateToProps = ({ devices }) => {
  return {
    hasMicrophonePermission: !devices.microphoneDisableReasons.includes(
      "NO_PERMISSION"
    ),
    hasMicrophone: !!devices.microphones.length,
  };
};

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(userActionCreators, dispatch),
  ...bindActionCreators(googleAnalytics, dispatch),
});

const GuestJoin = ({
  updateUser,
  onJoin,
  areSettingsRendered,
  hasCameraPermission,
  hasMicrophonePermission,
  hasSpeakerPermission,
  hasCamera,
  hasMicrophone,
  noDevicePermission,
  ...props
}) => {
  const [isTooltip, setTootltip] = useState(false);
  const [tcEnabled, setTCEnabled] = useState(false);
  const [displayName, setDisplayName] = useState(props.displayName || "");
  const [isValidated, setIsValidated] = useState(false);
  const [spinnerVisible, setSpinnerVisible] = useState(true);
  const [permissionAlertMessage, setPermissionAlertMessage] = useState({
    isOpen: false,
    message: {},
  });
  const { t } = useTranslation();
  const hasDevicesPermissions = hasMicrophonePermission;
  if (!hasDevicesPermissions) {
    logger.error(`No permission to access camera or microphone}`);
  }

  const getPermissionMessage = useCallback(() => {
    if (isAndroid) {
      return t("PERMISSION_ALERT_MESSAGE_ANDROID");
    }
    if (isIOS) {
      return t("PERMISSION_ALERT_MESSAGE_IOS");
    }
    if (isSafari) {
      return t("PERMISSION_ALERT_MESSAGE_SAFARI");
    }
    if (isChrome) {
      return t("PERMISSION_ALERT_MESSAGE_CHROME");
    }
    return t("PERMISSION_ALERT_MESSAGE_DEFAULT");
  }, [t]);

  const trimmedDisplayName = displayName.trim();

  const onDisplayNameChange = (event) => {
    setDisplayName(event.target.value);
  };

  const onJoinClick = () => {
    if (!isValidated) {
      if (!tcEnabled) {
        setTootltip(true);
      }
      return;
    }
    updateUser({ name: trimmedDisplayName });
    if (onJoin) {
      onJoin({
        displayName: trimmedDisplayName,
      });
    }
  };

  const checkCloudPortalCallback = () => {
    setSpinnerVisible(false);
  };

  const acceptedTC = (userAgreement) => {
    setTootltip(false);
    setIsValidated(userAgreement && trimmedDisplayName);
    setTCEnabled(userAgreement);
  };

  const toggleJoin = () => {
    setIsValidated(trimmedDisplayName && tcEnabled);
  };

  useEffect(toggleJoin, [displayName]);

  useEffect(() => {
    if (!hasDevicesPermissions) {
      noDevicePermission(JSON.stringify(deviceDetect()));
      setPermissionAlertMessage({
        isOpen: true,
        message: {
          header: t("PERMISSION_ALERT_HEADER"),
          html: getPermissionMessage(),
        },
      });
    }
  }, [hasDevicesPermissions, t, getPermissionMessage, noDevicePermission]);

  return (
    <div className={`guest-join-container ${spinnerVisible ? "loading" : ""}`}>
      {spinnerVisible && (
        <div className="loading">
          <Spinner height="32" />
          <div className="message">{t("WAIT_WHILE_PAGE_LOADING")}</div>
        </div>
      )}
      <Alert
        buttonText={t("PERMISSION_ALERT_BUTTON")}
        onConfirm={() => {
          window.location.reload();
        }}
        message={permissionAlertMessage.message}
        isOpen={permissionAlertMessage.isOpen}
      />
      <div className={`guest-join-content ${!spinnerVisible ? "visible" : ""}`}>
        <BeautyInput
          value={displayName}
          placeholder={t("ENTER_YOUR_NAME")}
          onChange={onDisplayNameChange}
          disabled={props.changeNameDisabled}
          {...test("DISPLAY_NAME_INPUT")}
        />
        <TermsConditionsPrivacy
          areSettingsRendered={areSettingsRendered}
          acceptedTC={acceptedTC}
          isValidated={isValidated}
          isTooltip={isTooltip}
          checkCloudPortalCallback={checkCloudPortalCallback}
        />

        <Button
          fill={true}
          data-invalid={!(isValidated && hasDevicesPermissions)}
          className={Classes.INTENT_SUCCESS}
          onClick={onJoinClick}
          {...test("JOIN_BUTTON")}
        >
          {t("JOIN")}
        </Button>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(GuestJoin);
