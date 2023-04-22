# A-Frame Component: Web-based U2Net
<img alt="Screenshot" src="img/screenshot.jpg" width="600">

### **Description / Rationale**
This is the A-Frame component, which loads web-based U2Net (for more information check <a href="https://github.com/xuebinqin/U-2-Net">U2Net page</a>) neural network allowing to do salient object detection. The component is compatible with latest version of A-Frame (ver. 1.4.1).   

### **Instructions**
To see the component at work add "u2net" component to <a-scene> element. The component has the following attributes: 
* arSystem: { type: "string", default: "mindAR" } - defines which free web-based AR system is used. It can be  "mindAR" or "arJS".
* nnModel: { type: "string", default: "models/u2netp_default.onnx" } - indicates which U2Net model is used. It has the following options: u2netp_default.onnx, u2netp_320.onnx, u2netp_224.onnx, u2netp_124.onnx  
* uiText: { default: "" } - the text which appears during the loading of the U2Net model. If uiLogo is indicated as well, it will only show this text.
* uiLogo: { default: "" } - the logo url. Logo appears during rhe loading of the U2Net model. If uiText is indicated as well, it will show uiText only. 
* uiOverlayColor: { default: "rgba(0, 0, 0, 1)" } - the color of the overlay which appears during U2Net model loading. RGBA values are accepted.

In order to work, it also requires indication of the following in the <head> section of html document:
OnnxRuntimeWeb: 
```
<script src="https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js"></script>
```
WebAR system: 
```
<script src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.1/dist/mindar-image-aframe.prod.js"></script> 
```
or  
```
<script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>
```
And a plane with the following parameters inside marker tags:
```
<a-plane id="u2netPlane" width="1" height="1" scale="0 0 0" material="">
<img id="selected-image" src=""/>
 </a-plane>
```  
Example implementation for MindAr.js is given below:
```
<html>
<head>
  <script src="https://aframe.io/releases/1.4.1/aframe.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.1/dist/mindar-image-aframe.prod.js"></script>
  <!-- import ONNXRuntime Web from CDN -->
  <script src="https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js"></script>
    <!-- import ONNXRuntime Web from CDN -->
  <script src="js/u2net-component.js"></script>
</head>
<body> 
  <a-scene u2net="uiText: Loading cool experience...; nnModel: models/u2netp_default.onnx"
    mindar-image="imageTargetSrc: https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.1/examples/image-tracking/assets/band-example/band.mind;"
    vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
    <a-entity mindar-image-target="targetIndex: 0">
      <a-plane id="u2netPlane" width="1" height="1" scale="0 0 0" material="">
        <img id="selected-image" src=""/>
      </a-plane>
    </a-entity>
    <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
  </a-scene>
</body>
</html>
```
Example implementation for AR.js is given below:
```
<html>
<head>
    <script src="https://aframe.io/releases/1.4.1/aframe.min.js"></script>
    <!-- we import arjs version without NFT but with marker + location based support -->
    <script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>
  <!-- import ONNXRuntime Web from CDN -->
  <script src="https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js"></script>
    <!-- import ONNXRuntime Web from CDN -->
  <script src="js/u2net-component.js"></script>
</head>
<body> 
  <a-scene u2net="uiLogo: img/loader.gif; arSystem: arJS"
  embedded arjs>
    <a-marker preset="hiro">
      <a-plane id="u2netPlane" width="1" height="1" scale="0 0 0" material="">
        <img id="selected-image" src=""/>
      </a-plane>
    </a-marker>
    <a-entity camera></a-entity>
  </a-scene>
</body>
</html>
```
Please note that not all shaders are supported by this loader. Also, 3d models are not supported.
To see some shaders at work, load a shader (already exported from ShaderFrog) from shaders folder. Here is the list of shaders: 
```
    shader0 - Water Shader
    shader1 - Patterns Shader
    shader2 - Blue Glow Shader
    shader3 - Toon Shader
    shader4 - BlackWhite Line Shader
    shader5 - Smoke Shader
    shader6 - Marching Ants Outline
    shader7 - BlueWhite Line Shader
    shader8 - Sky Shader
    shader9 - Fire Shader
    shader10 - Heat Map Shader
    shader11 - Lava Shader
    shader12 - Space Shader
    shader13 - Water Waves Shader
```
If you want to use other shaders, make sure to select "Export" > "Three.js" in ShaderFrog's environment, which will export shader in JSON file format.  

### **Tech Stack**
The project is powered by AFrame and Three.js. 

### **Demo**
See demo of the component here: [Demo](https://shaderfrog-component.glitch.me/)
