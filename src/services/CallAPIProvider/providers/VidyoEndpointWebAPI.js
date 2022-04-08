import BaseCallAPIProvider from "./BaseCallAPIProvider";
import { throttle } from "throttle-debounce";
import { loadScript } from "utils/loaders.js";

const VCUtils = "./lib/VidyoClientPlugin/VCUtils.js";
const Dispatcher = "./lib/VidyoClientPlugin/VidyoClientDispatcher.js";
const Transport = "./lib/VidyoClientPlugin/VidyoClientTransportWebRTC.js";

class VidyoEndpointWebAPI extends BaseCallAPIProvider {
  constructor() {
    if (VidyoEndpointWebAPI.instance) {
      return VidyoEndpointWebAPI.instance;
    }
    super();

    this.vc = null;
    this.vidyoEndpoint = null;
    this.vidyoUser = null;
    this.vidyoRoom = null;
  }

  async init() {
    await loadScript(VCUtils);
    await loadScript(Dispatcher);
    await loadScript(Transport);

    await new Promise((resolve, reject) => {
      this.vc = new window.VidyoClientLib.VidyoClient("", () => {
        resolve(this.vc);
      });
    });

    await this.vc
      .CreateVidyoEndpoint({
        viewId: "renderer",
        viewStyle: "VIDYO_CONNECTORVIEWSTYLE_Default",
        remoteParticipants: 8,
        logFileFilter: "warning info@VidyoClient",
        logFileName: "",
        consoleLogControlString: "",
        consoleLogFilter: "",
      })
      .then((vidyoEndpoint) => {
        this.vidyoEndpoint = vidyoEndpoint;
      });
  }

  startCall({ renderer, host, roomKey, displayName, onDisconnected } = {}) {
    host = host || "vvp8.vidyoqa.com";
    roomKey = roomKey || "CYPiYfGYHg";
    displayName = displayName || "React";
    renderer = renderer || "renderer";

    if (typeof onDisconnected !== "function") {
      onDisconnected = (reason, handler) => {
        console.log(
          `vidyoConnector.Connect : ${handler} callback received with ${reason}`
        );
      };
    }

    return new Promise((resolve, reject) => {
      this.vc
        .CreateVidyoUser(this.vidyoEndpoint)
        .then((vidyoUser) => {
          this.vidyoUser = vidyoUser;
        })
        .then(() => {
          return new Promise((resolve, reject) => {
            this.vidyoUser
              .LoginAsGuest({
                displayName,
                roomKey,
                host,
                port: 443,
                serviceType: "v",
                onLoginComplete: resolve,
                onLoggedOut: onDisconnected,
                onConnectionStatusChanged: () => {},
                onTokenReceived: () => {},
                onWebProxyCredentialsRequest: () => {},
              })
              .catch(reject);
          });
        })
        .then(() => {
          return new Promise((resolve, reject) => {
            this.vidyoUser
              .CreateRoomFromKey(roomKey, roomKey, (vidyoRoom) => {
                this.vidyoRoom = vidyoRoom;
                resolve();
              })
              .catch(reject);
          });
        })
        .then(() => {
          return new Promise((resolve, reject) => {
            this.vidyoRoom
              .Enter({
                password: "",
                onEntered: resolve,
                onExited: onDisconnected,
              })
              .catch(reject);
          });
        })
        .then(() => {
          return new Promise((resolve, reject) => {
            this.vidyoRoom.AcquireMediaRoute(resolve, reject).catch(reject);
          });
        })
        .then(() => {
          return new Promise((resolve, reject) => {
            this.vidyoRoom
              .EnableMedia(resolve, onDisconnected, onDisconnected)
              .catch(reject);
          });
        })
        .then((...args) => {
          resolve();
        })
        .catch(reject);
    });
  }

  endCall() {
    if (this.vidyoRoom) {
      this.vidyoRoom.Destruct();
    }
    if (this.vidyoUser) {
      this.vidyoUser.Destruct();
    }
    if (this.vidyoEndpoint) {
      return Promise.resolve(this.vidyoEndpoint.Destruct());
    }
    return Promise.resolve();
  }

  toggleCamera(privacy) {
    return this.vidyoEndpoint.SetCameraPrivacy({
      privacy,
    });
  }

  cameraTurnOn() {
    return this.toggleCamera(false);
  }

  cameraTurnOff() {
    return this.toggleCamera(true);
  }

  startDeviceListener(targetListener, onChanged) {
    let devices = [];

    const notify = throttle(500, () => {
      onChanged(devices);
    });

    return targetListener.call(this.vidyoEndpoint, {
      onAdded: (device) => {
        if (device.id !== "communications") {
          devices = [...devices, device];
          notify();
        }
      },
      onRemoved: (device) => {
        devices = devices.filter((d) => d.objId !== device.objId);
        notify();
      },
      onSelected: (device) => {
        device = devices.map((d) => {
          d.selected = d.objId === device.objId;
          return d;
        });
        notify();
      },
      onStateUpdated: (device, state) => {
        devices = devices.map((d) => {
          if (d.objId === device.objId) {
            switch (state) {
              case "VIDYO_DEVICESTATE_Suspended":
                d.isSuspended = true;
                break;
              case "VIDYO_DEVICESTATE_Unsuspended":
                d.isSuspended = false;
                break;
              case "VIDYO_DEVICESTATE_Controllable":
                d.isControllable = true;
                break;
              case "VIDYO_DEVICESTATE_DefaultChanged":
                d.isDefault = true;
                break;
              case "VIDYO_DEVICESTATE_ConfigureError":
              case "VIDYO_DEVICESTATE_Error":
                d.isFailed = true;
                d.isStarted = false;
                break;
              case "VIDYO_DEVICESTATE_Started":
                d.isFailed = false;
                d.isStarted = true;
                break;
              case "VIDYO_DEVICESTATE_Stopped":
                d.isStarted = false;
                break;
              default:
            }
          }
          return d;
        });
        notify();
      },
    });
  }

  subscribeOnCamerasChanges(onChanged) {
    return this.startDeviceListener(
      this.vidyoEndpoint.RegisterLocalCameraEventListener,
      onChanged
    );
  }

  unsubscribeFromCamerasChanges() {
    return this.vidyoEndpoint.UnregisterLocalCameraEventListener();
  }

  subscribeOnMicrophonesChanges(onChanged) {
    return this.startDeviceListener(
      this.vidyoEndpoint.RegisterLocalMicrophoneEventListener,
      onChanged
    );
  }

  unsubscribeFromMicrophonesChanges() {
    return this.vidyoEndpoint.UnregisterLocalMicrophoneEventListener();
  }

  subscribeOnSpeakersChanges(onChanged) {
    return this.startDeviceListener(
      this.vidyoEndpoint.RegisterLocalSpeakerEventListener,
      onChanged
    );
  }

  unsubscribeFromSpeakersChanges() {
    return this.vidyoEndpoint.UnregisterLocalSpeakerEventListener();
  }
}

export default VidyoEndpointWebAPI;
