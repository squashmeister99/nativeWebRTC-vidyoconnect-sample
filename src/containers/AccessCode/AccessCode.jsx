import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ReactComponent as RedKeyIcon } from "assets/images/others/key-red.svg";
import { Button, Classes, Position, Tooltip } from "@blueprintjs/core";
import BeautyInput from "components/BeautyInput";
import { test } from 'utils/helpers';

import "./AccessCode.scss";

const MemoizedRedKeyIcon = React.memo(RedKeyIcon);

const AccessCode = ({
  showIncorrectPinTooltip,
  areSettingsRendered,
  onJoin,
}) => {
  const [accessCode, setAccessCode] = useState("");
  const { t } = useTranslation();

  const [isPinTooltipOpened, showPinTooltip] = useState(
    showIncorrectPinTooltip || false
  );

  const handleAccessCodeChange = (event) => {
    setAccessCode(event.target.value.trim());
    showPinTooltip(false);
  };

  const onJoinClick = () => {
    if (onJoin) {
      onJoin({
        accessCode,
      });
    }
  };

  useEffect(() => {
    if (areSettingsRendered) {
      showPinTooltip(false);
    }
  }, [areSettingsRendered]);

  return (
    <div className="access-code-container">
      <div className="header">
        <p>
          <MemoizedRedKeyIcon width="16" height="16" />
          <span>{t("ACCESS_CODE_REQUIRED")}</span>
        </p>
        <p>{t("ACCESS_CODE_ENTER")}</p>
      </div>
      <div className="controls">
        <Tooltip
          isOpen={isPinTooltipOpened}
          content={
            <span {...test('ACCESS_CODE_ERROR_MESSAGE')}>
              {t("INCORRECT_ACCESS_CODE")}
            </span>
          }
          popoverClassName={Classes.INTENT_DANGER}
          position={Position.BOTTOM}
        >
          <BeautyInput
            {...test('ACCESS_CODE_INPUT')}
            value={accessCode}
            style={
              isPinTooltipOpened && {
                boxShadow: "inset 0 0 0 1px red",
              }
            }
            placeholder={t("ENTER_ACCESS_CODE")}
            onChange={handleAccessCodeChange}
          />
        </Tooltip>
        <Button
          {...test('JOIN_BUTTON')}
          fill={true}
          disabled={!accessCode}
          className={Classes.INTENT_SUCCESS}
          onClick={onJoinClick}
        >
          {t("JOIN")}
        </Button>
      </div>
    </div>
  );
};

export default React.memo(AccessCode);
