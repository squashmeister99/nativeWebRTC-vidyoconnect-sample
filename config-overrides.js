const path = require("path");
const { IgnorePlugin, NormalModuleReplacementPlugin } = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

const brandPath = `branding/${process.env.REACT_APP_BRAND}`;

module.exports = function override(config) {
  config.resolve.modules.push(path.resolve(__dirname, brandPath));

  config.plugins.push(new CopyPlugin({
    patterns: [{ from: `${brandPath}/public`, to: "." }]
  }));

  if (process.env.REACT_APP_SETTINGS_ACCOUNT_TAB_DISABLED === 'true') {
    config.plugins.push(new IgnorePlugin({
      resourceRegExp: /AccountTab/,
      contextRegExp: /containers\/Settings\/Tabs/,
    }));
  }

  if (process.env.REACT_APP_VC_ADVANCED_SETTIGS_DISABLED === 'true') {
    config.plugins.push(new IgnorePlugin({
      resourceRegExp: /AdvancedSettings/,
      contextRegExp: /features\/VidyoConnector/,
    }));
  }

  if (process.env.REACT_APP_VC_GLOBAL_MESSAGES_ENABLED !== 'true') {
    config.plugins.push(new IgnorePlugin({
      resourceRegExp: /GlobalMessages/,
      contextRegExp: /features\/VidyoConnector/,
    }));
  }

  if (process.env.REACT_APP_VC_GOOGLE_ANALYTICS_DISABLED === 'true') {
    config.plugins.push(new IgnorePlugin({
      resourceRegExp: /GoogleAnalytics/,
      contextRegExp: /features\/VidyoConnector/,
    }));
  }

  if (process.env.REACT_APP_VC_CREATE_ADHOC_ROOM_ENABLED === 'true') {
    const screenPath = 'features/VidyoConnector/AdHocRoom/screens/AdHocBeautyScreen';
    config.plugins.push(new NormalModuleReplacementPlugin(
      /(.*)GuestInitialScreen(\.*)/,
      function (resource) {
        resource.request = screenPath;
      }
    ));
  }

  return config;
};
