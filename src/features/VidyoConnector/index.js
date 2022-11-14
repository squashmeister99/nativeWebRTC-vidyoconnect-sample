if (process.env.REACT_APP_VC_ADVANCED_SETTIGS_DISABLED !== "true") {
  module.exports.AdvancedSettings = require("./AdvancedSettings").default;
} else {
  module.exports.AdvancedSettings = () => null;
}

if (process.env.REACT_APP_VC_GLOBAL_MESSAGES_ENABLED === "true") {
  module.exports.GlobalMessages = require("./GlobalMessages").default;
} else {
  module.exports.GlobalMessages = () => null;
}

if (process.env.REACT_APP_VC_GOOGLE_ANALYTICS_DISABLED !== "true") {
  module.exports.GoogleAnalytics = require("./GoogleAnalytics");
} else {
  module.exports.GoogleAnalytics = {
    Settings: () => null,
  };
}

if (process.env.REACT_APP_VC_CREATE_ADHOC_ROOM_ENABLED === "true") {
  module.exports.AdHocRoom = require("./AdHocRoom");
} else {
  module.exports.AdHocRoom = {
    RoomLink: () => null,
    AdHocRoomInfoDialog: () => null,
  };
}
