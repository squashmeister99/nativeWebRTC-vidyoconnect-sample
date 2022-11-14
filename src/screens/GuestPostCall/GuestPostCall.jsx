import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { bindActionCreators } from "redux";
import * as callActionCreators from "store/actions/call";
//import { useHistory } from "react-router-dom";
import GuestSettingsIcon from "components/GuestSettingsIcon";
import MainLogoWhite from "components/MainLogoWhite";
import Settings from "containers/Settings";
import Modal from "components/Modal";
import { test } from "utils/helpers";
import * as googleAnalytics from "../../store/actions/googleAnalytics";
import Alert from "components/Alert";

import "./GuestPostCall.scss";

const mapStateToProps = ({ config, call, user }) => ({
  disconnectReason: call.disconnectReason,
  customParameters: config.customParameters,
  userIsRegistered: user.isRegistered,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(callActionCreators, dispatch),
  ...bindActionCreators(googleAnalytics, dispatch),
});
//let postCallUrlTimer = null;
//const postCallUrlDelay = 5000;

const GuestPostCall = ({
  rejoinCall,
  disconnectReason,
  customParameters,
  userIsRegistered,
  gaOpenPostCallURL,
}) => {
  const [isAlertOpen, setIsAlertOpen] = useState(true);
  //const history = useHistory();
  const { t } = useTranslation();
  const [areSettingsRendered, setSettingsRenderState] = useState(false);
  const [isPostCallUrlOpened, showPostCallUrl] = useState(false);

  const isFailed = // TODO: support different providers
    disconnectReason !== "VIDYO_CONNECTORDISCONNECTREASON_Disconnected";

  /*function handleClick() {
    clearTimeout(postCallUrlTimer);
    if (isAndroid) {
      window.location.reload();
    } else {
      rejoinCall();
      history.entries.length = 0;
      history.push("/InitialScreen", { rejoin: true });
    }
  }*/

  function toggleSettings() {
    setSettingsRenderState(!areSettingsRendered);
  }

  function openPostCallURL() {
    const reURL =
      // eslint-disable-next-line
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    const { registered, unregistered } = customParameters;
    const postCallURL = userIsRegistered
      ? registered?.postCallURL
      : unregistered?.postCallURL;

    if (postCallURL) {
      if (reURL.test(postCallURL)) {
        const openWindow = window.open(postCallURL, "_blank");
        if (!openWindow) {
          /*postCallUrlTimer = setTimeout(() => {
            window.location.href = postCallURL;
          }, postCallUrlDelay);*/
        }
        gaOpenPostCallURL(postCallURL);
        showPostCallUrl(true);
      } else {
        console.log(
          "Invalid custom property:",
          "Reason: postCallURL value is set incorrectly"
        );
      }
    } else {
      console.log(
        "Invalid custom property:",
        "Reason: postCallURL property is missed or value is empty"
      );
    }
  }
  useEffect(() => {
    if (!isPostCallUrlOpened) {
      openPostCallURL();
    }
  });

  const closeAlert = () => {
    setIsAlertOpen(false);
  };

  function getDisconnectReasonText(disconnectReasonErrorCode) {
    let errorText = "";
    switch (disconnectReasonErrorCode) {
      case "VIDYO_CONNECTORDISCONNECTREASON_Booted":
        errorText = "YOU_HAVE_BEEN_DISCONNECTED_BY_MODERATOR";
        break;
      default:
        errorText = "DISCONNECTED_DUE_TO_PROBLEM";
        break;
    }
    return errorText;
  }

  return (
    <div className="guest-post-call-screen" {...test("GUEST_POST_SCREEN")}>
      <GuestSettingsIcon onClick={toggleSettings} />
      <div className="content">
        <MainLogoWhite />
        <div>
          <div id="guest-logout-message">
            <h2
              className="guest-logout-message-title"
              {...test("THANKS_FOR_PARTICIPATING_TITLE")}
            >
              {t("THANKS_FOR_PARTICIPATING")}
            </h2>
            {isFailed && (
              <Alert
                className={"popup-with-button"}
                buttonText={t("OK")}
                onConfirm={closeAlert}
                message={{
                  header: t("YOU_ARE_NO_LONGER_IN_CONFERENCE"),
                  text: t(getDisconnectReasonText(disconnectReason)),
                }}
                isOpen={isAlertOpen}
              />
            )}
            <p
              className="guest-logout-message-description"
              {...test("DISCONNECT_CALL_DESCRIPTION")}
            >
              To learn more and signup for a new trial account please reach us
              at
              <a
                href="https://www.vidyo.com/develop-video-app-platform/#contact-us"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                https://www.vidyo.com/develop-video-app-platform/#contact-us
              </a>
            </p>
          </div>
        </div>
      </div>
      <Modal>
        {areSettingsRendered && <Settings onClose={toggleSettings} />}
      </Modal>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(GuestPostCall);
