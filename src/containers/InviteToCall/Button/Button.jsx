import React from "react";
import { test } from "utils/helpers";
import "./Button.scss";

const InviteToCallButton = (props) => {
  const onClick = props.onClick || null;

  return (
    <button
      className="invite-to-call-button"
      {...test("INVITE_TO_CALL")}
      onClick={onClick}
    ></button>
  );
};

export default InviteToCallButton;
