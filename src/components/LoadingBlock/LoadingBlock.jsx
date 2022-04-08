import React, { Component } from "react";
import Spinner from "../Spinner";
import "./LoadingBlock.scss";

class LoadingBlock extends Component {
  render() {
    return (
      <div className="loading-block">
        <Spinner height="32" />
      </div>
    );
  }
}

export default LoadingBlock;
