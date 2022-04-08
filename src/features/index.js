import * as VidyoConnector from "./VidyoConnector";

const Stethoscope =
  process.env.REACT_APP_FEATURE_STETHOSCOPE_DISABLED !== "true"
    ? require("./Stethoscope")
    : {
        Global: () => null,
        SelectList: () => null,
        ControlPanel: () => null,
        ParticipantListMenuItem: () => null,
      };

export { VidyoConnector, Stethoscope };
