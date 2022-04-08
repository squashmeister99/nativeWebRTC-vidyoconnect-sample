import { useTranslation } from "react-i18next";
import { test } from "utils/helpers";

import "./InfoMsg.scss";
import React from "react";

const InfoMsg = ({ ...props }) => {
  const { t } = useTranslation();

  return (
    <div className="confirm" {...test("SETTINGS_POPUP")}>
      <div className="header">{props.header}</div>
      <div className="content">
        <div className="message">{props.message}</div>
      </div>
      <div className="buttons">
        <div
          className="button grey"
          onClick={props.onClose}
          {...test("INFO_MSG_CLOSE_BUTTON")}
        >
          {t("CANCEL")}
        </div>
        <div
          className="button green"
          onClick={props.onAction}
          {...test("INFO_MSG_ACTION_BUTTON")}
        >
          {props.actionButtonText}
        </div>
      </div>
    </div>
  );
};

export default InfoMsg;
