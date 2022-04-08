import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { test } from "utils/helpers";
import "./Toggle.scss";

const Toggle = ({ isChatOpen, onClick }) => {
  const historyLength = useSelector((state) => state.chat.history.length);
  const chatButtonToggle = useSelector((state) =>
    state.config.urlChat.isDefault
      ? state.config.portalFeatures?.["EndpointPublicChat"]
      : state.config.urlChat.value
  );
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [readMessageCount, setReadMessageCount] = useState(0);

  useEffect(() => {
    if (isChatOpen) {
      setUnreadMessageCount(0);
      setReadMessageCount(historyLength);
    } else {
      setUnreadMessageCount(historyLength - readMessageCount);
    }
  }, [isChatOpen, historyLength, readMessageCount]);

  if (!chatButtonToggle) {
    return null;
  }

  return (
    <button className="chat-toggle" {...test("CHAT_BUTTON")} onClick={onClick}>
      {unreadMessageCount ? (
        <div className="unread-message-counter">
          {unreadMessageCount < 10 ? unreadMessageCount : "9+"}
        </div>
      ) : null}
    </button>
  );
};

export default Toggle;
