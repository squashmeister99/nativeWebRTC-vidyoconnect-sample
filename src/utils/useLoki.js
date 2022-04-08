import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getCallAPIProvider } from "services/CallAPIProvider";

const getVidyoConnector = () =>
  getCallAPIProvider().vidyoConnector || getCallAPIProvider().vidyoEndpoint;

const startSendingStats = (pushURL) => {
  getVidyoConnector().SetOptions({
    pushStats: {
      enabled: true,
      pushURL,
      // pushInterval: 10000,    // optional (ms)
      // trackingID: "test-id",  // optional
    },
  });
  console.log(`Start sending statistics to: ${pushURL}`);
};

const stopSendingStats = () => {
  getVidyoConnector().SetOptions({
    pushStats: {
      enabled: false,
    },
  });
  console.log(`Stop sending statistics`);
};

const useLoki = (isCallActive, insightServerUrl) => {
  const location = useLocation();

  useEffect(() => {
    if (isCallActive && insightServerUrl) {
      startSendingStats(insightServerUrl);
    }
  }, [location, isCallActive, insightServerUrl]);

  useEffect(() => {
    return () => {
      if (insightServerUrl) {
        stopSendingStats();
      }
    };
  }, [insightServerUrl]);

  return stopSendingStats;
};

export default useLoki;
