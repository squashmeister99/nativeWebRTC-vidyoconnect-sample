import React from "react";
import { test } from 'utils/helpers';

import "./GuestSettingsIcon.scss";

const GuestSettingsIcon = (props) => {
  const onClick = props.onClick || null;
  return (
    <div className="guest-settings-icon" onClick={onClick}>
      <button className="gear-icon" {...test("SETTINGS_ICON")}></button>
    </div>
  );
};

export default GuestSettingsIcon;
