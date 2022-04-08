import React from "react";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { Position, Tooltip } from "@blueprintjs/core";

import "./RecorderStatus.scss";

const mapState = ({ call }, props) => {
  return {
    recorderOn: call.recorderOn,
  };
};

const RecorderStatus = ({ recorderOn }) => {
  const { t } = useTranslation();
  return recorderOn ? (
    <Tooltip
      content={t("THE_CONFERENCE_IS_BEING_RECORDED")}
      position={Position.BOTTOM}
    >
      <div className="recorder-status-container">
        <div className="recorder-status-icon active"></div>
      </div>
    </Tooltip>
  ) : null;
};

export default connect(mapState, null)(RecorderStatus);
