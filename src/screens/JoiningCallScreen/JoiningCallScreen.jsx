import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useTranslation } from "react-i18next";
import { Redirect, useLocation } from "react-router-dom";
import * as callActionCreators from "store/actions/call";
import { Spinner } from "@blueprintjs/core";
import { test } from 'utils/helpers';
import "./JoiningCallScreen.scss";

const mapStateToProps = ({ call }) => ({
  isCallActive: call.active,
  disconnectReason: call.disconnectReason,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(callActionCreators, dispatch),
});

const JoiningCallScreen = ({ isCallActive, disconnectReason }) => {
  const location = useLocation();
  const { t } = useTranslation();

  if (disconnectReason) {
    return disconnectReason === "VIDYO_CONNECTORFAILREASON_InvalidToken" ? (
      <Redirect
        to={{
          pathname: "/GuestAccessCodeScreen",
          state: location.state,
        }}
      />
    ) : (
      <Redirect
        to={{
          pathname: "/GuestBeautyScreen",
          state: location.state,
        }}
      />
    );
  }

  if (isCallActive) {
    return (
      <Redirect
        to={{
          pathname: "/GuestInCall",
          state: location.state,
        }}
      />
    );
  }

  return (
    <div className="joining-call-screen" {...test('GUEST_JOINING_SCREEN')}>
      <div className="content">
        {t("JOINING_CALL_DOTS")}
        <div className="initial-loader">
          <Spinner className="bp3-intent-white" />
        </div>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(JoiningCallScreen);
