// U2Net Component
AFRAME.registerComponent("u2net", {
  schema: {
    arSystem: { type: "string", default: "mindAR" }, //mindAR or arJS
    nnModel: { type: "string", default: "models/u2netp_default.onnx" }, // u2netp_320.onnx, u2netp_224.onnx, u2netp_124.onnx  
    uiText: { default: "" }, // any text string
    uiLogo: { default: "" }, // 'any logo url'
    uiOverlayColor: { default: "rgba(0, 0, 0, 1)" },
  },
  init: function () {
    // Variables
    let canvas;
    let maskCanvas;
    let captureButton;
    let video;
    let resultImg;
    let w, h;


    // Check model used
    if (this.data.nnModel == "models/u2netp_default.onnx") {
      w = 320;
      h = 320;
    } else if (this.data.nnModel == "models/u2netp_320.onnx") {
      w = 320;
      h = 320;
    } else if (this.data.nnModel == "models/u2netp_224.onnx") {
      w = 224;
      h = 224;
    } else if (this.data.nnModel == "models/u2netp_124.onnx") {
      w = 124;
      h = 124;
    }

    // Determine AR system used
    if (this.data.arSystem == "mindAR") {
      const sceneEl = document.querySelector("a-scene");
      sceneEl.addEventListener("arReady", () => {
        video = document.querySelector("video");
      });
    } else if (this.data.arSystem == "arJS") {
      window.addEventListener("arjs-video-loaded", function () {
        video = document.querySelector("video");
      });
    }

    // Create canvas and button elements
    this.el.addEventListener("loaded", () => {
      canvas = document.createElement("canvas");
      canvas.setAttribute("id", "canvas");
      canvas.setAttribute("width", w);
      canvas.setAttribute("height", h);
      canvas.style.display = "none";
      this.el.appendChild(canvas);

      maskCanvas = document.createElement("canvas");
      maskCanvas.setAttribute("id", "mask-canvas");
      maskCanvas.setAttribute("width", w);
      maskCanvas.setAttribute("height", h);
      maskCanvas.style.display = "none";
      this.el.appendChild(maskCanvas);

      captureButton = document.createElement("button");
      captureButton.setAttribute("id", "capture");
      captureButton.setAttribute(
        "style",
        "position: absolute; bottom: 50px; left: 50%; transform: translateX(-50%); z-index: 3;"
      );
      captureButton.innerText = "Capture";
      this.el.appendChild(captureButton);

      // Create overlay element
      this.overlay = document.createElement("div");
      this.overlay.id = "overlay";
      this.overlay.style.position = "absolute";
      this.overlay.style.top = "0";
      this.overlay.style.left = "0";
      this.overlay.style.width = "100%";
      this.overlay.style.height = "100%";
      this.overlay.style.backgroundColor = this.data.uiOverlayColor;
      this.overlay.style.zIndex = "3";
      this.overlay.style.display = "none";
      this.el.appendChild(this.overlay);

      // Create UI text element
      if (this.data.uiText) {
        this.uiText = document.createElement("div");
        this.uiText.id = "uiText";
        this.uiText.style.position = "absolute";
        this.uiText.style.top = "50%";
        this.uiText.style.left = "50%";
        this.uiText.style.transform = "translate(-50%, -50%)";
        this.uiText.style.color = "white";
        this.uiText.style.fontSize = "20px";
        this.uiText.innerText = this.data.uiText;
        this.overlay.appendChild(this.uiText);
      } else if (this.data.uiLogo) {
        // Create UI logo element
        this.uiLogo = document.createElement("img");
        this.uiLogo.id = "uiLogo";
        this.uiLogo.src = this.data.uiLogo;
        this.uiLogo.style.position = "absolute";
        this.uiLogo.style.top = "50%";
        this.uiLogo.style.left = "50%";
        this.uiLogo.style.display = "block";
        this.uiLogo.style.transform = "translate(-50%, -50%)";
        this.overlay.appendChild(this.uiLogo);
      }
    });

    // Take screenshot
    this.el.addEventListener("click", (event) => {
      if (event.target === captureButton) {
        this.overlay.style.display = "block";
        canvas
          .getContext("2d")
          .drawImage(video, 0, 0, canvas.width, canvas.height);
        document
          .querySelector("#selected-image")
          .setAttribute("src", canvas.toDataURL());
        doPrediction(this.data.nnModel);
      }
    });

    // U2Net Main Part
    async function doPrediction(model) {
      const ctx = canvas.getContext("2d");
      const maskCtx = maskCanvas.getContext("2d");
      const session = await ort.InferenceSession.create(model, {
        executionProviders: ["wasm"],
      }).then(console.log("model loaded"));
      const inputNames = session.inputNames;
      const outputNames = session.outputNames;
      let image = document.querySelector("#selected-image");
      let oc = document.createElement("canvas"),
        octx = oc.getContext("2d");
      oc.width = w;
      oc.height = h;
      octx.drawImage(image, 0, 0, oc.width, oc.height);
      let input_imageData = octx.getImageData(0, 0, w, h); // change this for input
      let floatArr = new Float32Array(w * h * 3);
      let floatArr1 = new Float32Array(w * h * 3);
      let floatArr2 = new Float32Array(w * h * 3);

      let j = 0;
      for (let i = 1; i < input_imageData.data.length + 1; i++) {
        if (i % 4 != 0) {
          floatArr[j] = input_imageData.data[i - 1].toFixed(2) / 255;
          j = j + 1;
        }
      }
      for (let i = 1; i < floatArr.length + 1; i += 3) {
        floatArr1[i - 1] = (floatArr[i - 1] - 0.485) / 0.229; // red color
        floatArr1[i] = (floatArr[i] - 0.456) / 0.224; // green color
        floatArr1[i + 1] = (floatArr[i + 1] - 0.406) / 0.225; // blue color
      }
      let k = 0;
      for (let i = 0; i < floatArr.length; i += 3) {
        floatArr2[k] = floatArr[i];
        k = k + 1;
      }
      let l = 102400;
      for (let i = 1; i < floatArr.length; i += 3) {
        floatArr2[l] = floatArr[i];
        l = l + 1;
      }
      let m = 204800;
      for (let i = 2; i < floatArr.length; i += 3) {
        floatArr2[m] = floatArr[i];
        m = m + 1;
      }
      let n = 409600;
      for (let i = 2; i < floatArr.length; i += 3) {
        floatArr2[n] = floatArr[i]; // red   color
        n = n + 1;
      }
      let o = 819200;
      for (let i = 2; i < floatArr.length; i += 3) {
        floatArr2[o] = floatArr[i]; // red   color
        o = o + 1;
      }

      let p = 1638400;
      for (let i = 2; i < floatArr.length; i += 3) {
        floatArr2[p] = floatArr[i]; // red   color
        p = p + 1;
      }

      const input = new ort.Tensor("float32", floatArr2, [1, 3, w, h]);
      const feeds = { "input.1": input };
      const results = await session.run(feeds).then();
      const pred = Object.values(results)[0];
      let myImageData = ctx.createImageData(w, h);
      for (let i = 0; i < pred.data.length * 4; i += 4) {
        let pixelIndex = i;
        if (i != 0) {
          t = i / 4;
        } else {
          t = 0;
        }
        if (Math.round(pred.data[t] * 255)) {
          myImageData.data[pixelIndex] = Math.round(pred.data[t] * 255); // red color
          myImageData.data[pixelIndex + 1] = Math.round(pred.data[t] * 255); // green color
          myImageData.data[pixelIndex + 2] = Math.round(pred.data[t] * 255); // blue color
          myImageData.data[pixelIndex + 3] = 255;
        }
      }
      // Apply image mask
      ctx.putImageData(myImageData, 0, 0);
      maskCtx.drawImage(image, 0, 0, oc.width, oc.height);
      maskCtx.globalCompositeOperation = "destination-in";
      maskCtx.drawImage(canvas, 0, 0);
      resultImg = document.getElementById("selected-image");
      resultImg.setAttribute("src", maskCanvas.toDataURL("image/png"));
      resultImg.setAttribute("width", w);
      resultImg.setAttribute("height", h);
      document.querySelector("#overlay").style.display = "none";
      document
        .querySelector("#u2netPlane")
        .setAttribute("material", "src: #mask-canvas; transparent: true;");
      document.querySelector("#u2netPlane").setAttribute("scale", "1 1 1");
    }
  },
});
