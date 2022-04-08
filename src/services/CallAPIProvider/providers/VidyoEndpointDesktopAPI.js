import BaseCallAPIProvider from "./BaseCallAPIProvider";
import { debounce, throttle } from "throttle-debounce";
import { loadScript } from "utils/loaders.js";
import { logCallbacks } from "utils/logger";

const VCUtils = "./lib/VidyoClientPlugin/VCUtils.js";
const Dispatcher = "./lib/VidyoClientPlugin/VidyoClientDispatcher.js";
const Transport = "./lib/VidyoClientPlugin/VidyoConnectDesktopTransport.js";

const noop = () => {};

class VidyoEndpointDesktopAPI extends BaseCallAPIProvider {
  constructor() {
    if (VidyoEndpointDesktopAPI.instance) {
      return VidyoEndpointDesktopAPI.instance;
    }
    super();

    this.vc = null;
    this.vidyoEndpoint = null;
    this.vidyoUser = null;
    this.vidyoRoom = null;
    this.selfViews = [];
    this.rendererDevices = [];
  }

  async init() {
    console.log("VidyoEndpoint provider init");

    await loadScript(VCUtils);
    await loadScript(Dispatcher);
    await loadScript(Transport);

    this.vc = new window.VidyoClientLib.VidyoClient(
      "VidyoClientPlugIn",
      (status) => {}
    );

    await this.vc
      .CreateVidyoEndpoint(
        "viewId",
        "viewStyle",
        8,
        "",
        "warning info@VidyoCef info@VidyoCefStats info@VidyoClient info@LmiPortalSession info@LmiPortalMembership info@LmiResourceManagerUpdates info@LmiPace info@LmiIce all@LmiSignaling ",
        "VidyoConnect_common.log"
      )
      .then((vidyoEndpoint) => {
        this.vidyoEndpoint = vidyoEndpoint;
      })
      .then(() => {
        window.vidyoApp.get(
          `ConstructConferenceScene?e=${this.vidyoEndpoint.objId}`
        );
      })
      .then(() => {
        return this.startDeviceListener(
          this.vidyoEndpoint.RegisterLocalRendererEventListener,
          ([vidyoRenderer, ...rest]) => {
            this.vidyoRenderer = vidyoRenderer;
          }
        );
      })
      .then(() => {
        return navigator.mediaDevices
          .enumerateDevices()
          .then((rendererDevices) => {
            this.rendererDevices = rendererDevices.filter(
              (d) => d.kind === "videoinput"
            );
            console.log("Media devices", this.rendererDevices);
          });
      })
      .then(() => {
        return this.vidyoEndpoint.SelectLocalCamera({ localCamera: null });
      })
      .then(() => {
        return this.vidyoEndpoint.SelectLocalMicrophone({
          localMicrophone: null,
        });
      })
      .then(() => {
        return this.vidyoEndpoint.SelectLocalSpeaker({ localSpeaker: null });
      })
      .catch((e) => {
        console.error(e);
      });

    await this.vc
      .CreateVidyoUser(this.vidyoEndpoint)
      .then((vidyoUser) => {
        this.vidyoUser = vidyoUser;

        if (typeof this.vidyoUser.objId === "undefined") {
          console.error("Creating of vidyoUser instance failed");
          return null;
        }
      })
      .catch((error) => {
        console.error(
          "VC.Init() - CreateVidyoEndpoint failed reason: " + error?.message
        );
      });
  }

  async startCall({
    renderer,
    host,
    roomKey,
    displayName,
    onDisconnected,
  } = {}) {
    try {
      if (typeof onDisconnected !== "function") {
        onDisconnected = (reason, handler) => {
          console.log(
            `vidyoEndpoint.Connect : ${handler} callback received with ${reason}`
          );
        };
      }

      await new Promise((resolve, reject) => {
        this.vidyoUser
          .LoginAsGuest({
            displayName: displayName,
            roomKey: roomKey,
            host: host,
            port: 443,
            serviceType: "v",
            onLoginComplete: resolve,
            onLoggedOut: onDisconnected,
            onConnectionStatusChanged: () => {},
            onTokenReceived: () => {},
            onWebProxyCredentialsRequest: () => {},
          })
          .then((result) => {
            console.log("LoginAsGuest success");
          })
          .catch(reject);
      });

      this.vidyoRoom = await new Promise((resolve, reject) => {
        this.vidyoUser
          .CreateRoomFromKey({
            roomKey: roomKey,
            createToken: roomKey,
            onRoomCreated: resolve,
          })
          .then((result) => {
            console.log("VidyoRoom created");
          })
          .catch((e) => {
            console.error("VidyoRoom creating error", e);
            reject(e);
          });
      });

      await this.vidyoRoom
        .RegisterResourceManagerEventListener(noop, console.error)
        .then(console.log(`RegisterResourceManagerEventListener`));

      await this.startParticipantsListener();

      await new Promise((resolve, reject) => {
        this.vidyoRoom
          .Enter({
            password: "",
            onEntered: resolve,
            onExited: onDisconnected,
          })
          .catch(reject);
      });

      await new Promise((resolve, reject) => {
        this.vidyoRoom.AcquireMediaRoute(resolve, console.error).catch(reject);
      });

      await new Promise((resolve, reject) => {
        this.vidyoRoom
          .EnableMedia(
            resolve,
            (reason) => {
              console.error(reason);
              onDisconnected(reason);
            },
            (reason) => {
              console.error(reason);
              onDisconnected(reason);
            }
          )
          .catch(reject);
      });

      return true;
    } catch (error) {
      console.log("startCall error", error);
      return false;
    }
  }

  endCall() {
    return this.vidyoUser.Logout();
  }

  toggleCamera(privacy) {
    return this.vidyoEndpoint.SetCameraPrivacy({
      privacy,
    });
  }

  async cameraTurnOn(selectedCamera) {
    if (selectedCamera && this.vidyoRenderer) {
      return selectedCamera
        .AddToLocalRenderer(this.vidyoRenderer)
        .then((streamID) => {
          const rendererId = window.vidyoApp.getRendererId(streamID.toString());
          const vRendererId = `V${rendererId}`;
          const rendererDevice = this.rendererDevices.filter((d) => !d.used)[0];
          rendererDevice.used = true;
          window.vidyoApp.registerVidyoRenderer(
            vRendererId,
            rendererDevice.label
          );
          window.vidyoApp.updateVidyoRendererParameters([
            {
              srcID: vRendererId,
              width: 222,
              height: 118,
              ranking: 0,
              dynamic: false,
              show: true,
              crop: true,
            },
          ]);
          navigator.mediaDevices
            .getUserMedia({
              audio: false,
              video: {
                deviceId: rendererDevice.deviceId,
              },
            })
            .then((stream) => {
              this.selfViews.forEach((svId) => {
                const selfView = document.querySelector(`#${svId} video`);
                selfView.id = vRendererId;
                selfView.srcObject = stream;
                selfView.onloadedmetadata = function (e) {
                  selfView.play();
                };
                selfView.rendererDevice = rendererDevice;
              });
            });
        });
    }
  }

  cameraTurnOff(selectedCamera) {
    if (selectedCamera && this.vidyoRenderer) {
      this.selfViews.forEach((svId) => {
        const selfView = document.querySelector(`#${svId} video`);
        selfView.removeAttribute("id");
        window.vidyoApp.unregisterVidyoRenderer(selfView.id);
        if (selfView.scrObject) {
          selfView.srcObject = null;
          selfView.scrObject.getVideoTracks().forEach((track) => {
            track.stop();
          });
        }
        if (selfView.rendererDevice) {
          selfView.rendererDevice.used = false;
        }
      });
      return selectedCamera.RemoveFromLocalRenderer(this.vidyoRenderer);
    }
  }

  toggleMicrophone(privacy) {
    return this.vidyoEndpoint.SetMicrophonePrivacy({
      privacy,
    });
  }

  toggleSpeaker(privacy) {
    return this.vidyoEndpoint.SetSpeakerPrivacy({
      privacy,
    });
  }

  microphoneTurnOff() {
    return this.toggleMicrophone(false);
  }

  microphoneTurnOn() {
    return this.toggleMicrophone(true);
  }

  speakerTurnOn() {
    return this.toggleSpeaker(true);
  }

  speakerTurnOff() {
    return this.toggleSpeaker(false);
  }

  async addSelfView({ viewId }) {
    this.selfViews.push(viewId);
    document.getElementById(viewId).innerHTML = `
      <video class="desktop-video-tile" data-ranking="0" autoplay vidyostate="canplay event triggered"></video>
    `;
  }

  async removeSelfView({ viewId }) {
    this.selfViews = this.selfViews.filter((id) => id === viewId);
    document.getElementById(viewId).innerHTML = ``;
  }

  selectCamera(localCamera) {
    return this.vidyoEndpoint.SelectLocalCamera({
      localCamera,
    });
  }

  selectMicrophone(localMicrophone) {
    return this.vidyoEndpoint.SelectLocalMicrophone({
      localMicrophone,
    });
  }

  selectSpeaker(localSpeaker) {
    return this.vidyoEndpoint.SelectLocalSpeaker({
      localSpeaker,
    });
  }

  startShare({ localWindowShare }) {
    return this.vidyoEndpoint.SelectLocalWindowShare({
      localWindowShare,
    });
  }

  stopShare() {
    return this.vidyoEndpoint.SelectLocalWindowShare({
      localWindowShare: null,
    });
  }

  startDeviceListener(targetListener, onChanged, selectDevice) {
    let devices = [];
    let deviceSelected = false;

    const notify = throttle(500, () => {
      if (this.vidyoEndpoint) {
        onChanged(devices);
      }
    });

    return targetListener.call(this.vidyoEndpoint, {
      onAdded: (device) => {
        if (!device || device.name === "WebPluginVirtualCamera") {
          return;
        }
        devices = [...devices, device];
        notify();
        if (!deviceSelected && selectDevice) {
          deviceSelected = true;
          selectDevice(device);
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
        if (!device) {
          return;
        }
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
      onChanged,
      (localCamera) => {
        return this.vidyoEndpoint.SelectLocalCamera({
          localCamera,
        });
      }
    );
  }

  unsubscribeFromCamerasChanges() {
    return this.vidyoEndpoint.UnregisterLocalCameraEventListener();
  }

  subscribeOnMicrophonesChanges(onChanged) {
    return this.startDeviceListener(
      this.vidyoEndpoint.RegisterLocalMicrophoneEventListener,
      onChanged,
      (localMicrophone) => {
        return this.vidyoEndpoint.SelectLocalMicrophone({
          localMicrophone,
        });
      }
    );
  }

  unsubscribeFromMicrophonesChanges() {
    return this.vidyoEndpoint.UnregisterLocalMicrophoneEventListener();
  }

  subscribeOnSpeakersChanges(onChanged) {
    return this.startDeviceListener(
      this.vidyoEndpoint.RegisterLocalSpeakerEventListener,
      onChanged,
      (localSpeaker) => {
        return this.vidyoEndpoint.SelectLocalSpeaker({
          localSpeaker,
        });
      }
    );
  }

  unsubscribeFromSpeakersChanges() {
    return this.vidyoEndpoint.UnregisterLocalSpeakerEventListener();
  }

  GetStatsJson() {
    return this.vidyoEndpoint.GetStatsJson();
  }

  startParticipantsListener(onChanged) {
    let participants = {
      list: [],
      participantJoined: null,
      participantLeft: null,
    };

    this.vidyoRoom.ReportLocalParticipantOnJoined({
      reportLocalParticipant: true,
    });

    return this.vidyoRoom.RegisterParticipantEventListener(
      logCallbacks({
        context: "Participant",
        onParticipantJoined: (participantJoined) => {
          participants.list.push(participantJoined);
          participants.participantJoined = participantJoined;
          if (
            this.onParticipantChanged &&
            typeof this.onParticipantChanged === "function"
          ) {
            this.onParticipantChanged(participants);
          }
        },
        onParticipantLeft: (participantLeft) => {
          participants.list = participants.list.filter(
            (participant) => participant.id !== participantLeft.id
          );
          participants.participantLeft = participantLeft;
          if (
            this.onParticipantChanged &&
            typeof this.onParticipantChanged === "function"
          ) {
            this.onParticipantChanged(participants);
          }
        },
        onDynamicParticipantChanged: function (participants, cameras) {
          // participant changes camera state
        },
        onLoudestParticipantChanged: function (participant, audioOnly) {
          // participant changes audio state
        },
      })
    );
  }

  subscribeOnParticipantsChanges(onChanged) {
    this.onParticipantChanged = onChanged;
  }

  unsubscribeFromParticipantsChanges() {
    return this.vidyoRoom.UnregisterParticipantEventListener();
  }

  startRecorderStatusListener(onChanged) {
    this.vidyoRoom
      .RegisterRecorderInCallEventListener(
        logCallbacks({
          context: "RecorderInCall",
          onRecorderInCallChanged: (status) => {
            onChanged(status);
          },
        })
      )
      .then(function () {
        console.log("RegisterRecorderInCallEventListener Success");
      })
      .catch(function () {
        console.error("RegisterRecorderInCallEventListener Failed");
      });
  }

  subscribeOnRecorderStatusChanges(onChanged) {
    return this.startRecorderStatusListener(onChanged);
  }

  unsubscribeFromRecorderStatusChanges() {
    return this.vidyoRoom.UnregisterRecorderInCallEventListener;
  }

  startLocalShareListener(targetListener, onChanged) {
    let shares = [];

    const notify = debounce(500, () => {
      if (this.vidyoEndpoint) {
        onChanged(shares);
      }
    });

    return targetListener
      .call(this.vidyoEndpoint, {
        onAdded: (share) => {
          shares.push(share);
          notify();
        },
        onRemoved: (share) => {
          shares = shares.filter((item) => item.id !== share.id);
          notify();
        },
        onSelected: (share) => {
          for (let share_ of shares) {
            if (share) {
              share_.selected = share_.objId === share.objId;
            } else {
              share_.selected = false;
            }
          }
          notify();
        },
        onStateUpdated: (share, state) => {},
      })
      .then(function (result) {
        console.log(`${targetListener.name} Success`);
      })
      .catch(function () {
        console.error(`${targetListener.name} Failed`);
      });
  }

  startRemoteShareListener(targetListener, onChanged) {
    let shares = [];

    const notify = debounce(500, () => {
      if (this.vidyoConnector) {
        onChanged(shares);
      }
    });

    return targetListener
      .call(
        this.vidyoEndpoint,
        logCallbacks({
          context: "RemoteShare",
          onAdded: (share) => {
            shares.push(share);
            notify();
          },
          onRemoved: (share) => {
            shares = shares.filter((item) => item.id !== share.id);
            notify();
          },
          onStateUpdated: (share, participant, state) => {},
        })
      )
      .then(function (result) {
        console.log(`${targetListener.name} Success`);
      })
      .catch(function () {
        console.error(`${targetListener.name} Failed`);
      });
  }

  subscribeOnLocalWindowShareChanges(onChanged) {
    return this.startLocalShareListener(
      this.vidyoEndpoint.RegisterLocalWindowShareEventListener,
      onChanged
    );
  }

  unsubscribeFromLocalWindowShareChanges() {
    return this.vidyoEndpoint.UnregisterLocalWindowShareEventListener();
  }

  subscribeOnRemoteWindowShareChanges(onChanged) {
    return this.startRemoteShareListener(
      this.vidyoEndpoint.RegisterRemoteWindowShareEventListener,
      onChanged
    );
  }

  unsubscribeFromRemoteWindowShareChanges() {
    return this.vidyoEndpoint.UnregisterRemoteWindowShareEventListener();
  }

  startRemoteCamerasListener(onChanged) {
    let cameras = [];

    this.vidyoEndpoint
      .RegisterRemoteCameraEventListener(
        logCallbacks({
          context: "RemoteCamera",
          onAdded: (camera, participant) => {
            camera.participant = participant;
            cameras.push(camera);
            onChanged(cameras);
          },
          onRemoved: (camera, participant) => {
            cameras = cameras.filter((item) => item.id !== camera.id);
            onChanged(cameras);
          },
          onStateUpdated: (camera, participant, state) => {},
        })
      )
      .then(function () {
        console.log("RegisterRemoteCameraEventListener Success");
      })
      .catch(function () {
        console.error("RegisterRemoteCameraEventListener Failed");
      });
  }

  startRemoteMicrophoneListener(onChanged) {
    let microphones = [];

    this.vidyoEndpoint
      .RegisterRemoteMicrophoneEventListener(
        logCallbacks({
          context: "RemoteMicrophone",
          onAdded: (microphone, participant) => {
            microphone.participant = participant;
            microphones.push(microphone);
            onChanged(microphones);
          },
          onRemoved: (microphone, participant) => {
            microphones = microphones.filter(
              (item) => item.id !== microphone.id
            );
            onChanged(microphones);
          },
          onStateUpdated: (microphone, participant, state) => {
            let states = {
              VIDYO_DEVICESTATE_Resumed: true,
              VIDYO_DEVICESTATE_Paused: false,
            };
            microphones.forEach((item) => {
              if (item.id === microphone.id) {
                item.microphoneOn = states[state];
              }
            });
            onChanged(microphones);
          },
        })
      )
      .then(function () {
        console.log("RegisterRemotemicrophoneEventListener Success");
      })
      .catch(function () {
        console.error("RegisterRemotemicrophoneEventListener Failed");
      });
  }

  subscribeOnRemoteCamerasChanges(onChanged) {
    return this.startRemoteCamerasListener(onChanged);
  }

  subscribeOnRemoteMicrophonesChanges(onChanged) {
    return this.startRemoteMicrophoneListener(onChanged);
  }

  subscribeOnResourceManagerChanges(onChanged) {
    return true; // todo
  }

  unsubscribeResourceManagerChanges() {
    return true; // todo
  }

  //TODO implement(not clear what API we should to use)
  subscribeOnPermissionsChanges(onChanged) {
    return true;
  }

  //TODO implement(not clear what API we should to use)
  unsubscribeFromPermissionsChanges() {
    return true;
  }

  subscribeOnModerationEvents(onModerationCommand) {
    return this.vidyoRoom.RegisterModerationCommandEventListener({
      onModerationCommand,
    });
  }

  unsubscribeFromModerationEvents() {
    return this.vidyoRoom.UnregisterModerationCommandEventListener();
  }

  // TODO check and maybe rework
  desctructEndpoint() {
    if (this.vidyoEndpoint) {
      this.vidyoEndpoint.Destruct();
    }
  }

  // TODO implement
  pinParticipant(options) {
    // return this.vidyoRenderer.PinParticipant(options);
  }
}

export default VidyoEndpointDesktopAPI;
