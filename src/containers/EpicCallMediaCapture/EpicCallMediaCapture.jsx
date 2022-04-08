import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { b64toBlob, guid, takeVideoSnapShot } from "../../utils/helpers";
import { Login } from "services/SoapAPIProvider/soapAPIRequests/Login";
import SnapShotPopup from "components/SnapShotPopup/SnapShotPopup";
import storage from "utils/storage";
import { useTranslation } from "react-i18next";
import {
  useCurrentUser,
  useMobileDimension,
  useOrientation,
  useRequestsInProgress,
} from "utils/hooks";
import LandScapeModePopup from "components/LandScapeModePopup/LandScapeModePopup";
import hunterChat from "utils/hunterChat";
import { sendChatMessage } from "store/actions/chat";

import "./EpicCallMediaCapture.scss";
import { setJwtToken, setRefreshToken } from "store/actions/config";
import { portalJWTRequest } from "utils/portalJWTRequest";
import showNotification from "components/Notifications/Notifications";

const EpicCallMediaCapture = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isMobileDimension] = useMobileDimension();
  const [orientation] = useOrientation();
  const { urlEpicCallLaunchToken, listOfGCPServices, jwtToken } = useSelector(
    (state) => state.config
  );
  const call = useSelector((state) => state.call);
  const { authToken, portal } = storage.getItem("user") || {};
  const [documentMediaTypes, setDocumentMediaTypes] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showSnapshotPopup, setShowSnapshotPopup] = useState(false);
  const [sendMediaInProgress, setSendMediaInProgress] = useState(false);
  const [imageData, setImageData] = useState(null);

  const currentUser = useCurrentUser();
  const epicCallMediaAPIServer = listOfGCPServices?.epicService?.url;
  const specialMessageInfo = {
    specMessageClass: "MSGCLASS_HUNTER",
    specMessageType: "MSGTYPE_PRIVATE",
  };

  const [isRequestInProgress, addRequestInProgress, deleteRequestInProgress] =
    useRequestsInProgress();

  const handleError = (e, message) => {
    const error = e?.response?.data?.error
      ? e.response.data.error?.message || JSON.stringify(e.response.data.error)
      : e?.message;

    console.error(`EPIC Call Media Capture: ${message}. Reason:`, error);
  };

  const onSendingError = () => {
    setShowSnapshotPopup(false);
    setSendMediaInProgress(false);

    return showNotification("bannerWithBtns", {
      type: "banner",
      showFor: 10000,
      message: t("SNAPHOT_SAVED_ERROR_MESSAGE"),
      buttons: [
        {
          autoClickAfterNSeconds: 10,
          text: `${t("HIDE")}`,
        },
      ],
    });
  };

  const startSession = useCallback(async () => {
    const URL = `${epicCallMediaAPIServer}/sessions`;

    if (isRequestInProgress(URL)) {
      console.log(
        `EPIC Call Media Capture: prevent sending ${URL} request, since it already in-progress.`
      );
      return;
    }

    const data = {
      launchToken: urlEpicCallLaunchToken.value,
    };

    const options = {
      url: URL,
      method: "POST",
      data,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    };

    try {
      if (!urlEpicCallLaunchToken.value) {
        throw new Error("Launch token value is not available");
      }

      addRequestInProgress(URL);
      const res = await portalJWTRequest(options);

      console.log(
        "EPIC Call Media Capture: session started with status -",
        res?.data?.status
      );

      return res;
    } catch (e) {
      handleError(e, "error occur while starting session");
    } finally {
      deleteRequestInProgress(URL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlEpicCallLaunchToken.value, epicCallMediaAPIServer, jwtToken]);

  const waitReadySessionStatus = useCallback(async () => {
    const URL = `${epicCallMediaAPIServer}/sessions/status`;

    if (isRequestInProgress(URL)) {
      console.log(
        `EPIC Call Media Capture: prevent sending ${URL} request, since it already in-progress.`
      );
      return;
    }

    const options = {
      url: URL,
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    };
    try {
      addRequestInProgress(URL);
      const res = await portalJWTRequest(options);

      if (res?.data?.data?.stage === "PROGRESSING") {
        return new Promise((resolve) => {
          setTimeout(resolve, 3000);
        }).then(waitReadySessionStatus);
      }

      return res;
    } catch (e) {
      handleError(e, "error occur while fetching session status");
    } finally {
      deleteRequestInProgress(URL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epicCallMediaAPIServer, jwtToken]);

  const sendMedia = async (mediaData, description, documentType) => {
    if (!mediaData || !description || !documentType) {
      throw Error("EPIC Call Media Capture: sendMedia() some param is missing");
    }

    const imageData = b64toBlob(mediaData);
    const formData = new FormData();

    formData.append("documentType", documentType);
    formData.append("description", description);
    formData.append("file", imageData, "xray.png");

    const options = {
      url: `${epicCallMediaAPIServer}/media`,
      data: formData,
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        Accept: "application/json",
      },
    };

    try {
      setSendMediaInProgress(true);
      const res = await portalJWTRequest(options);

      return res.data;
    } catch (e) {
      handleError(e, "error occur while send image to ERP");
      onSendingError();
    }
  };

  const getMediaStatus = async (mediaId) => {
    const options = {
      url: `${epicCallMediaAPIServer}/media/status`,
      method: "GET",
      params: {
        mediaId,
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    };
    try {
      const res = await portalJWTRequest(options);

      if (res?.data?.data?.state === "PROGRESSING") {
        return new Promise((resolve) => {
          setTimeout(resolve, 2000);
        }).then(getMediaStatus.bind(null, mediaId));
      }

      return res;
    } catch (e) {
      handleError(e, "error occur while fetching media status");
      onSendingError();
    }
  };

  const saveSnapShotERP = async function (
    imageData,
    documentType,
    description
  ) {
    const today = new Date();
    const date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    const time =
      today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
    const dateTime = date + "-" + time;
    const fileName = "snapShot-" + dateTime + ".jpeg";

    try {
      const sendMediaResponse = await sendMedia(
        imageData,
        description,
        documentType,
        fileName
      );

      if (sendMediaResponse?.status === "success") {
        const mediaId = sendMediaResponse?.data?.mediaId;

        if (mediaId) {
          getMediaStatus(mediaId)
            .then((res) => {
              if (res?.data?.data?.state === "COMPLETED") {
                showNotification("bannerWithBtns", {
                  type: "banner",
                  className: "snapshot-success",
                  showFor: 10000,
                  message: t("SNAPHOT_SAVED_ERP_MESSAGE"),
                  buttons: [
                    {
                      autoClickAfterNSeconds: 10,
                      text: `${t("HIDE")}`,
                    },
                  ],
                });
                setSendMediaInProgress(false);
                closeSnapShotPopup();
              } else {
                throw new Error("Media status response = FAILED");
              }
            })
            .catch((e) => {
              handleError(e, "error occur while getting media status");
              onSendingError();
            });
        } else {
          throw new Error(`Error on getting mediId. mediaId=${mediaId}`);
        }

        return sendMediaResponse;
      }
    } catch (e) {
      handleError(e, "error occur while saving image on ERP");
      onSendingError();
    }
  };

  useEffect(() => {
    if (!jwtToken) {
      Login(portal, authToken, {
        returnJwtTokens: true,
        endpointGuid: guid(),
      }).then((res) => {
        dispatch(setJwtToken(res?.jwtToken));
        dispatch(setRefreshToken(res?.refreshToken));
      });
    }
  }, [authToken, dispatch, jwtToken, portal]);

  useEffect(() => {
    if (jwtToken && epicCallMediaAPIServer && !sessionStarted) {
      startSession().then((res) => {
        if (res?.status === 200 || res?.status === 202) {
          setSessionStarted(true);
        }
      });
    }
  }, [jwtToken, startSession, epicCallMediaAPIServer, sessionStarted]);

  useEffect(() => {
    if (sessionStarted && !documentMediaTypes) {
      waitReadySessionStatus().then((res) => {
        if (res?.data?.data?.documentMediaTypes) {
          setDocumentMediaTypes(res.data.data.documentMediaTypes);
        }
      });
    }
  }, [documentMediaTypes, sessionStarted, waitReadySessionStatus]);

  /**
   * Handle click on Tile
   */
  const snapshotButtonClickHandler = useCallback(
    (event) => {
      if (sessionStarted && event.target.closest(".make-snapshot")) {
        const container = event.target.closest(".video-container");
        const isShare = container.classList.contains("application-type");
        const participantID = container?.dataset?.participantId;

        const remoteUserID = (call.participants.list || []).find(
          (p) => p.id === participantID
        )?.userId;
        const currentUserID = currentUser?.userId;

        if (remoteUserID) {
          const messageType = isShare ? 2 : 1;
          const messageData = {
            snapshotOf: remoteUserID,
            sendBy: currentUserID,
            messageType,
          };

          const message = hunterChat.createMessage(
            messageData,
            specialMessageInfo,
            null,
            true,
            "snapshot"
          );

          dispatch(sendChatMessage({ message }));
        }

        if (container) {
          const tile = container.querySelector("video");
          if (!tile) return;
          const imageData = takeVideoSnapShot(tile);
          if (imageData) {
            setImageData(imageData);
            setShowSnapshotPopup(true);
          }
        }
      }
    },
    [
      call.participants.list,
      currentUser,
      dispatch,
      sessionStarted,
      specialMessageInfo,
    ]
  );

  const closeSnapShotPopup = () => {
    setShowSnapshotPopup(false);
    setSendMediaInProgress(false);
  };

  useEffect(() => {
    document.addEventListener("click", snapshotButtonClickHandler);

    return () => {
      document.removeEventListener("click", snapshotButtonClickHandler);
    };
  }, [snapshotButtonClickHandler]);

  // snapshot button workaround for current Compositor implementation
  // TODO delete when will be a possibility to add custom controls to video tile
  useEffect(() => {
    if (!urlEpicCallLaunchToken.value || !documentMediaTypes) {
      return undefined;
    }

    const interval = setInterval(() => {
      const tiles = document.querySelectorAll(".video-container");

      if (tiles && tiles.length) {
        tiles.forEach((tile) => {
          const snapShotBtn = tile.querySelector(".make-snapshot");

          if (!snapShotBtn) {
            if (
              !tile.classList.contains("video-muted") &&
              !tile.classList.contains("local-track")
            ) {
              const controls = tile.querySelector(".video-tile-controls");

              if (controls) {
                controls.insertAdjacentHTML(
                  "afterbegin",
                  '<div class="tile-control make-snapshot"></div>'
                );
              }
            }
            return;
          }

          if (!tile.classList.contains("video-muted")) {
            snapShotBtn.classList.remove("hide");
          } else {
            snapShotBtn.classList.add("hide");
          }
        });
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [documentMediaTypes, urlEpicCallLaunchToken.value]);

  const renderPopup = () => {
    const mobileLandscape = isMobileDimension && orientation === "landscape";
    if (showSnapshotPopup) {
      return (
        <>
          <SnapShotPopup
            hide={mobileLandscape}
            imageData={imageData}
            onClose={closeSnapShotPopup}
            onSaveERP={saveSnapShotERP}
            documentMediaTypes={documentMediaTypes}
            containerClass={sendMediaInProgress ? "in-progress" : ""}
          />
          {mobileLandscape && (
            <LandScapeModePopup
              title={t("MEDIA_CAPTURE_NOT_WORK_IN_LANDSCAPE_MODE")}
            />
          )}
        </>
      );
    }
    return null;
  };

  return renderPopup();
};

export default EpicCallMediaCapture;
