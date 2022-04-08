import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Alert from "components/Alert";

const GlobalMessages = (props) => {
  const tabIsDisabled = useSelector((state) => state.app.tabIsDisabled);
  const initError = useSelector((state) => state.app.initError);
  const { t } = useTranslation();

  if (initError) {
    return (
      <Alert
        className={"popup-with-button"}
        message={{
          header: t("BROWSER_APPLICATION_ERROR_HEADER"),
          text: t("BROWSER_APPLICATION_ERROR_MESSAGE"),
        }}
        buttonText={t("PERMISSION_ALERT_BUTTON")}
        onConfirm={() => {
          window.location.reload();
        }}
        isOpen={true}
      />
    );
  }

  if (tabIsDisabled) {
    return (
      <Alert
        className={"popup-without-button"}
        message={{
          header: t("BROWSER_TAB_UNLOAD_HEADER"),
          text: t("BROWSER_TAB_UNLOAD_MESSAGE"),
        }}
        isOpen={true}
      />
    );
  }

  return null;
};

export default GlobalMessages;
