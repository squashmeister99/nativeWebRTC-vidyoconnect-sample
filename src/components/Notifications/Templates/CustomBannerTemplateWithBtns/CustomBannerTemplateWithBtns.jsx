import React, { memo } from "react";
import Timer from "./TImer";
import "./CustomBannerTemplateWithBtns.css";

function CustomBannerTemplateWithBtns({ data, closeNotification }) {
  let additionalClassNameForCointainer = "";
  additionalClassNameForCointainer += data.type === "banner" ? " banner" : "";
  additionalClassNameForCointainer += data.className
    ? ` ${data.className}`
    : "";
  additionalClassNameForCointainer +=
    data.buttons && data.buttons.length > 0 ? " with-button" : "";

  function createButtons(buttons) {
    return (
      <div className="buttons">
        {buttons.map((item, index) => {
          const onClickHandler = () => {
            item.onClick ? item.onClick() : closeNotification(true);
            if (item.callBack) item.callBack();
          };
          return (
            <div
              key={index}
              className={
                "button" +
                (item.autoClickAfterNSeconds ? " button-with-countdown" : "")
              }
              onClick={onClickHandler}
            >
              {item.text && <span>{item.text}</span>}
              {}
              {item.autoClickAfterNSeconds && (
                <Timer buttonData={item} autoclick={onClickHandler} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  function createElement(element) {
    return <React.Fragment>{element}</React.Fragment>;
  }

  function createBanner(bannerData) {
    let image = bannerData.image || "";
    let header = bannerData.header || "";
    let name = (
      (bannerData.firstName || "") +
      " " +
      (bannerData.lastName || "") +
      " " +
      (bannerData.name || "")
    ).trim();
    let message = bannerData.message || "";
    let link = bannerData.link || "";
    let linkText = bannerData.linkText || link;
    let buttons = bannerData.buttons || [];

    return (
      <React.Fragment>
        {
          <React.Fragment>
            {image && createElement(image)}
            {(header || name || message) && (
              <div className="content">
                {header && <div className="header">{header}</div>}
                {name && <div className="name">{name}</div>}
                {message && <div className="message">{message}</div>}
                {link && (
                  <div className="link">
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      {linkText}
                    </a>
                  </div>
                )}
              </div>
            )}
            {buttons.length > 0 && createButtons(buttons)}
          </React.Fragment>
        }
      </React.Fragment>
    );
  }

  return (
    <div className={"custom_notification" + additionalClassNameForCointainer}>
      {data.type === "banner" && createBanner(data)}
    </div>
  );
}

export default memo(CustomBannerTemplateWithBtns);
