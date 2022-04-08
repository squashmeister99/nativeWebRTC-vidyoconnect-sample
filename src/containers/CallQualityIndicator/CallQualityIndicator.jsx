import React from "react";
import { connect } from "react-redux";
import { SvgIcon } from "./../SvgIcon";
import "./CallQualityIndicator.scss";

const mapState = ({ call }) => {
  return {
    availibleResources: call.availibleResources,
  };
};

const CallQualityIndicator = (availibleResources) => {
  const colorIndicator = {
    poor: "red",
    average: "yellow",
    good: "green",
  };

  const getBandwidthSend = (bandwidthSend) => {
    let videoBandWidthSend = bandwidthSend ? bandwidthSend : "good";
    if (videoBandWidthSend < 70) {
      return "poor";
    } else if (videoBandWidthSend < 90) {
      return "average";
    } else {
      return "good";
    }
  };

  const getBandwidthReceive = (bandwidthReceive) => {
    let videoBandWidthReceive = bandwidthReceive ? bandwidthReceive : "good";
    if (videoBandWidthReceive < 70) {
      return "poor";
    } else if (videoBandWidthReceive < 90) {
      return "average";
    } else {
      return "good";
    }
  };

  let availableBandwidth = availibleResources.availibleResources
    ? availibleResources.availibleResources
    : null;
  let colorBandwidthSend = availableBandwidth
    ? getBandwidthSend(availableBandwidth.bandwidthSend)
    : "good";
  let colorBandwidthReceive = availableBandwidth
    ? getBandwidthReceive(availableBandwidth.bandwidthReceive)
    : "good";

  return (
    <div id="call-quality-indicator">
      <SvgIcon
        name="arrow-down"
        customClass={"font-" + colorIndicator[colorBandwidthSend]}
      />
      <SvgIcon
        name="arrow-up"
        customClass={"font-" + colorIndicator[colorBandwidthReceive]}
      />
    </div>
  );
};

export default connect(mapState, null)(CallQualityIndicator);
