import React from "react";
import MicrophoneToggle from "./toggles/MicrophoneToggle";
import SpeakerToggle from "./toggles/SpeakerToggle";
import CameraToggle from "./toggles/CameraToggle";
import SelfView from "containers/SelfView";
import FlipCameraButton from "containers/FlipCameraButton";
import { Position } from "@blueprintjs/core";
import "./QuickMediaSettings.scss";

const QuickMediaSettings = () => {
  return (
    <div className="quick-media-settings">
      <div className="media-devices">
        <SpeakerToggle
          showLabel={true}
          showTestSound={true}
          tooltipPosition={Position.RIGHT}
        />
        <MicrophoneToggle showLabel={true} tooltipPosition={Position.RIGHT} />
        <CameraToggle showLabel={true} tooltipPosition={Position.RIGHT} />
      </div>
      <SelfView externalControls={<FlipCameraButton />} />
    </div>
  );
};

export default React.memo(QuickMediaSettings);
