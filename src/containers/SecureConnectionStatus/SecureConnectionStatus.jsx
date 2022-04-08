import React from "react";

import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { Tooltip, Position } from "@blueprintjs/core";
import { test } from "utils/helpers";
import "./SecureConnectionStatus.scss";

const connectionStatus = () => {
  return {
    secureConnection: true,
  };
};

const SecureConnectionStatus = ({ secureConnection }) => {
  const { t } = useTranslation();

  return secureConnection ? (
    <div className="secure-status-wrap">
      <Tooltip
        content={t("THIS_CONFERENCE_IS_SECURE")}
        position={Position.BOTTOM}
      >
        <div className="secure-status-container">
          <div
            className="secure-status-icon"
            {...test("SECURE_CONNECTION_ICON")}
          ></div>
        </div>
      </Tooltip>
    </div>
  ) : (
    <div className="secure-status-wrap">
      <Tooltip
        content={t("THIS_CONFERENCE_IS_NOT_SECURE")}
        position={Position.BOTTOM}
      >
        <div className="secure-status-container">
          <div
            className="secure-status-icon unsecure"
            {...test("UNSECURE_CONNECTION_ICON")}
          ></div>
        </div>
      </Tooltip>
    </div>
  );
};

export default connect(connectionStatus, null)(SecureConnectionStatus);
