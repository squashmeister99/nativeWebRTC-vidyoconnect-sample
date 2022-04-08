import React from "react";
import MessageComposer from "./MessageComposer";
import { Button } from "@blueprintjs/core";
import History from "./History";
import "./Chat.scss";

const Chat = (props) => {
  return (
    <section className={`chat ${props.isChatOpen ? "open" : ""}`}>
      <Button className="mobile-chat-toggle" onClick={props.toggleChat} />
      <div className="chat-content">
        <History />
      </div>
      <div className="chat-footer">
        <MessageComposer />
      </div>
    </section>
  );
};

export default Chat;
