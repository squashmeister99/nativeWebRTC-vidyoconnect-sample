import React from "react";
import { isMobile as isMobileDevice, isAndroid } from "react-device-detect";
import { useSelector, useDispatch } from "react-redux";
import { startWindowShare } from "store/actions/call";
import { test } from "utils/helpers";
import "./Button.scss";

const ShareButton = () => {
  const localWindowShares = useSelector(
    (state) => state.call.localWindowShares
  );

  const shareButtonToggle = useSelector((state) => state.config.urlShare.value);

  const dispatch = useDispatch();

  const handleStartShare = () => {
    const windowShare = localWindowShares[0];
    if (windowShare) {
      dispatch(startWindowShare(windowShare));
    }
  };

  if (isMobileDevice || isAndroid || !shareButtonToggle) {
    return null;
  }

  return (
    <button
      className="share-button"
      {...test("SHARE_BUTTON")}
      onClick={handleStartShare}
    ></button>
  );
};

export default ShareButton;
