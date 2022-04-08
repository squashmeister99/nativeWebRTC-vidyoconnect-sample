import { Effect, MediaStream, MediaStreamCapture, Player, Dom } from "./BanubaSDK.js";

(async () => {

  const params = new URLSearchParams(window.location.search);
  const effectParam = params.get('effect') || 'blur_bg';

  const playerId = `webar_${(new Date()).valueOf()}`;

  Player.setDefaultOptions({
    clientToken: "yP1X0g3guj9tLpdDuVJAMTRKfEC8pkAjGbiOTzWJzEqOv1CNuBIpNWiCXvyDAeFppOIMJ02jYYdMdzz0CTqwG6QijovqYOmbF5Z+ceCdhTAO7Kkrf3a5z3CylBTbmqO4AUrcJJtWv4RRjQ+cFCNFA1WF2QVCQvEY2ZK9j9SF8gBIfGEkFiKob02WYAbSGb0cDLtoOfE/7snOL4qguy+NMRVweEy1DKiuBhLWk2rFulv/HLF73Ir7L9dA8dNZ+12q7m8uofZNjqmShMh96c7ptbxD1y0FzgNj8vz1ptBMhB8WV3Pn+IxHKe0N0T+q3KM1CQfSSoTT1zwt2g==",
    devicePixelRatio: 1
   })

   const player = await Player.create({
     locateFile: {
       "BanubaSDK.data": "banuba/BanubaSDK.data",
       "BanubaSDK.wasm": "banuba/BanubaSDK.wasm",
       "BanubaSDK.simd.wasm": "banuba/BanubaSDK.simd.wasm",
     },
   });

   // await new Promise (resolve =>  setTimeout(() => resolve(), 5000))

   const effect = await Effect.preload(`banuba/${effectParam}.zip`);

   // const statsElement = document.createElement("div");
   // statsElement.id = 'banuba_stats';
   // statsElement.style = `
   //   position: fixed !important;
   //   top: 0px !important;
   //   right: 0px !important;
   //   display: inline-block;
   //   color: white;
   // `;
   // document.body.appendChild(statsElement);
   //
   // let interval;
   // const getStats = () => {
   //   clearInterval(interval);
   //   let received = 0, proccessed = 0, rendered = 0;
   //   player.addEventListener("framereceived", () => { received++; })
   //   player.addEventListener("frameprocessed", () => { proccessed++; })
   //   player.addEventListener("framerendered", () => { rendered++; })
   //   interval = setInterval(() => {
   //     let c = document.querySelector(`#${playerId} canvas`) || {width: 0, height: 0};
   //     statsElement.innerText = `Canvas(${c.width}X${c.height}): ${received}/${proccessed}/${rendered}`;
   //     received = 0, proccessed = 0, rendered = 0;
   //   }, 1000);
   // }
   //
   // getStats();

   const playerElement = document.createElement("div");
   playerElement.id = playerId;
   playerElement.style = `
     position: absolute !important;
     top: -9999px !important;
     left: -9999px !important;
     display: !important;
   `;
   document.body.appendChild(playerElement);

  let _isBanubaInited = false;
  const store = localStorage.getItem("VIDYO_CONNECT");
  let isBlurBackgroundChecked;
  if (store) {
    isBlurBackgroundChecked = JSON.parse(store).blurBackground
  }
  if (isBlurBackgroundChecked) {
    player.applyEffect(effect);
    _isBanubaInited = true;
  }

  let streams = [];
  let lastStream = null;

  const clearStream = (stream) => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  window.banuba = {
    get isBanubaInited() {
      return _isBanubaInited;
    },
    clearEffect: () => player.clearEffect(),
    applyEffect: async (effectArg) => {
      _isBanubaInited = true;
      return player.applyEffect(effectArg || effect)
    },
    blurBackground: async (stream, useCache) => {
      if (!_isBanubaInited) return  stream;
      if (lastStream?.active && useCache) {
        // applicable only for self-view
        clearStream(stream);
        const clonedBlurredStream = lastStream.clone();
        console.warn("Called blurBackground and get blurredStreamCapture from cache", clonedBlurredStream)
        return clonedBlurredStream;
      }

      player.use(new MediaStream(stream), {resize: (width, height) => {
          //if (width > 640) { return [640, 360]; }
          return [width, height];
        }});
      Dom.render(player, `#${playerId}`);
      const blurredStream = new MediaStreamCapture(player);
      blurredStream.addEventListener("inactive", () => clearStream(stream));
      lastStream = blurredStream;
      console.warn("Called blurBackground, and get fresh blurredStreamCapture", blurredStream)
      return blurredStream;
    },
    getLastStream: () => {
      const clonedBlurredStream = lastStream?.clone();
      console.warn(`Called getLastStream and get ${clonedBlurredStream ? "blurredStreamCapture" : "null"} from cache`, clonedBlurredStream)
      return clonedBlurredStream;
    },
    stopStreams: () => {
      console.warn("stop stream cached in BanubaPlugin");
      [...streams, lastStream].forEach(stream => {
        clearStream(stream)
      })
      streams = [];
      lastStream = null;
    }
  }

  window.banubaPluginReady = true;
  const event = new Event('BanubaPluginReady', { bubbles: true });
  window.document.body.dispatchEvent(event);
})()
