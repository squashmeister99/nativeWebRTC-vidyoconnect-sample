import React from "react";
import { Alert as BlueprintAlert, Intent } from "@blueprintjs/core";
import { test } from "utils/helpers";
import { Checkbox } from "@blueprintjs/core";
import "./Alert.scss";

const Alert = ({
  buttonText,
  onConfirm,
  message,
  isOpen,
  className,
  onCancel,
  cancelButtonText,
  checkbox,
}) => {
  return (
    <BlueprintAlert
      className={className}
      cancelButtonText={cancelButtonText}
      confirmButtonText={buttonText}
      isOpen={isOpen}
      intent={Intent.DANGER}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <div className="message-container">
        {message.header && (
          <div className="message-header" {...test("ALERT_HEADER")}>
            {message.header}
          </div>
        )}
        {message.text && (
          <div className="message-content" {...test("ALERT_MESSAGE")}>
            {message.text}
          </div>
        )}
        {message.html && (
          <div
            className="message-content"
            dangerouslySetInnerHTML={{
              __html: message.html,
            }}
            {...test("ALERT_MESSAGE")}
          ></div>
        )}
      </div>
      {checkbox && (
        <Checkbox
          value={checkbox.checked}
          label={checkbox.label}
          onChange={checkbox.onChange}
        />
      )}
    </BlueprintAlert>
  );
};

export default Alert;
