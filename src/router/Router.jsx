import React from "react";

import { Route, MemoryRouter, Switch, Redirect } from "react-router-dom";

import InitialScreen from "screens/InitialScreen";
import GuestInitialScreen from "screens/GuestInitialScreen";
import GuestBeautyScreen from "screens/GuestBeautyScreen";
import GuestAccessCodeScreen from "screens/GuestAccessCodeScreen";
import JoiningCallScreen from "screens/JoiningCallScreen";
import LeavingCallScreen from "screens/LeavingCallScreen";
import GuestInCall from "screens/GuestInCall";
import GuestPostCall from "screens/GuestPostCall";
import BrowserCheckScreen from "screens/BrowserCheckScreen";
import UserHomeScreen from "screens/UserHomeScreen";

import GlobalMessages from "containers/GlobalMessages";
import { VidyoConnector } from "features";

class RouterComponent extends React.Component {
  render() {
    return (
      <MemoryRouter>
        <Switch>
          <Route path="/InitialScreen" component={InitialScreen} />
          <Route path="/GuestInitialScreen" component={GuestInitialScreen} />
          <Route path="/GuestBeautyScreen" component={GuestBeautyScreen} />
          <Route
            path="/GuestAccessCodeScreen"
            component={GuestAccessCodeScreen}
          />
          <Route path="/JoiningCallScreen" component={JoiningCallScreen} />
          <Route path="/LeavingCallScreen" component={LeavingCallScreen} />
          <Route path="/GuestInCall" component={GuestInCall} />
          <Route path="/GuestPostCall" component={GuestPostCall} />
          <Route path="/BrowserCheckScreen" component={BrowserCheckScreen} />
          <Route path="/UserHomeScreen" component={UserHomeScreen} />
          <Redirect to="/BrowserCheckScreen" />
        </Switch>
        <VidyoConnector.GlobalMessages />
        <GlobalMessages />
      </MemoryRouter>
    );
  }
}

export default RouterComponent;
