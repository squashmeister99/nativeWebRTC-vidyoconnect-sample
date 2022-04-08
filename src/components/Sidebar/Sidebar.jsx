import React from "react";
import "./Sidebar.scss";
import { Button } from "@blueprintjs/core";

const Sidebar = (props) => {
  return (
    <section id="sidebar" className="sidebar">
      <Button
        className="mobile-side-bar-toggle"
        onClick={props.toggleSidebar}
      />
      {props.content}
    </section>
  );
};
export default Sidebar;
