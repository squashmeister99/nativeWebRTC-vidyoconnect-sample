import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { sendChatMessage } from "store/actions/chat";
import {
  InputGroup,
  Button,
  Classes,
  Position,
  Tooltip,
} from "@blueprintjs/core";
import sendIcon from "assets/images/buttons/send.svg";
import { test } from "utils/helpers";
import { useTranslation } from "react-i18next";
import "./MessageComposer.scss";

const MAX_MESSSAGE_LENGTH = 1024;

const MessageComposer = () => {
  const [message, setMessage] = useState("");
  const [isOpenToolTip, setOpenToolTip] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const onChange = (event) => {
    var newMessageLength = event.target.value.length;
    if (newMessageLength <= MAX_MESSSAGE_LENGTH) {
      setOpenToolTip(false);
      setMessage(event.target.value);
    } else {
      setOpenToolTip(true);
      let txtText = event.target.value.substring(0, MAX_MESSSAGE_LENGTH);
      setMessage(txtText);
    }
  };

  const onPaste = (event) => {
    let pasteText = (event.clipboardData || window.clipboardData).getData(
      "text"
    );
    var newMessageLength = pasteText.length;
    if (newMessageLength > MAX_MESSSAGE_LENGTH) {
      event.preventDefault();
      setOpenToolTip(true);
    }
  };

  const sendMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      dispatch(sendChatMessage({ message: trimmedMessage }));
      setMessage("");
    }
  };

  const onKeyDown = function (event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="message-composer">
      <Tooltip
        isOpen={isOpenToolTip}
        content={<span>{t("ENTER_LESS_CHARACTERS")}</span>}
        popoverClassName={Classes.INTENT_DANGER + " red-border"}
        position={Position.TOP}
      >
        <InputGroup
          {...test("CHAT_MESSAGE_INPUT")}
          value={message}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
        />
      </Tooltip>
      <Button
        {...test("SEND_MESSAGE")}
        disabled={!message}
        onClick={sendMessage}
        className="send-message"
        icon={<img src={sendIcon} height={22} alt="icon" />}
      />
    </div>
  );
};

export default MessageComposer;
