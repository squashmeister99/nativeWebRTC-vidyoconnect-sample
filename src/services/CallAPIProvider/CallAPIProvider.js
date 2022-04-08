import VidyoConnectorAPI from "./providers/VidyoConnectorAPI";
import VidyoEndpointWebAPI from "./providers/VidyoEndpointWebAPI";
import VidyoEndpointDesktopAPI from "./providers/VidyoEndpointDesktopAPI";

let selectedProvider = null;

export const getCallAPIProvider = () => {
  if (selectedProvider) {
    return selectedProvider;
  }

  let provider = window.appConfig.REACT_APP_CALL_API_PROVIDER;

  if (provider === "VidyoConnectorAPI") {
    selectedProvider = new VidyoConnectorAPI();
  } else if (provider === "VidyoEndpointWebAPI") {
    selectedProvider = new VidyoEndpointWebAPI();
  } else if (provider === "VidyoEndpointDesktopAPI") {
    selectedProvider = new VidyoEndpointDesktopAPI();
  }

  window.callProvider = selectedProvider;
  return selectedProvider;
};
