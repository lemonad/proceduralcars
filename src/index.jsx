import {
  AmbientLight,
  CameraHelper,
  Color,
  DirectionalLight,
  Fog,
  Object3D,
  OrthographicCamera,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { BloomPass } from "three/examples/jsm/postprocessing/BloomPass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { proceduralCar } from "./car";
import { road } from "./road";
import { FisheyeShader } from "./FisheyeShader";

const useLightHelpers = false;

const verticalFov = 100;
const aspectRatio = window.innerWidth / window.innerHeight;
const nearDistance = 0.1;
const farDistance = 1000;

let app = {
  el: document.getElementById("app"),
  scene: null,
  renderer: null,
  camera: null,
  composer: null,
  hero: null,
  leftLaneCars: [],
  rightLaneCars: [],
  lightHelpers: [],
};

const init = () => {
  app.scene = new Scene();
  app.scene.background = new Color(0x348868);
  app.scene.fog = new Fog(0x348868, 45, 50);

  app.camera = new PerspectiveCamera(
    verticalFov,
    aspectRatio,
    nearDistance,
    farDistance,
  );
  app.camera.position.set(10, 2, -5);
  app.camera.enableRotate = true;
  // app.camera.useTarget = true;
  // app.scene.add(app.camera.target);
  app.camera.lookAt(0, 0, 0);
  // app.camera.rotation.z = Math.PI / 2;
  app.renderer = new WebGLRenderer();
  app.renderer.setSize(window.innerWidth, window.innerHeight);
  app.renderer.shadowMap.enabled = true;
  app.renderer.shadowMap.type = PCFSoftShadowMap; // default THREE.PCFShadowMap

  console.log("Using WebGL2:", app.renderer.capabilities.isWebGL2);

  app.composer = new EffectComposer(app.renderer);
  const renderPass = new RenderPass(app.scene, app.camera);
  app.composer.addPass(renderPass);

  const fisheyePass = new ShaderPass(FisheyeShader);
  app.composer.addPass(fisheyePass);

  // const bloomPass = new BloomPass(1.0, 25, 1.0, 256);
  // app.composer.addPass(bloomPass);

  const filmPass = new FilmPass(0.2, 0, 0, false);
  app.composer.addPass(filmPass);

  app.el.appendChild(app.renderer.domElement);

  const ambientLight = new AmbientLight(0x404040, 0.5); // soft white light
  app.scene.add(ambientLight);

  const light = new DirectionalLight(0xffffff, 0.5);
  light.position.set(0.0, 4, -2.8);
  light.castShadow = true;

  light.shadow.mapSize.width = 512; // default
  light.shadow.mapSize.height = 512; // default

  light.shadow.camera = new OrthographicCamera(-50, 50, 50, -50, 0.5, 1000);
  app.scene.add(light);
  //app.scene.add(new CameraHelper(light.shadow.camera));

  const roadMesh = road();
  app.scene.add(roadMesh);

  app.hero = proceduralCar(true);
  app.hero.position.set(9, 0, -5);
  app.scene.add(app.hero);

  const heroCameraPos = new Vector3();
  heroCameraPos.add(app.hero.position);
  heroCameraPos.add(app.hero.driverPos);
  // heroCameraPos.add(new Vector3(3.5, 2.4, 0));
  // app.hero.position + app.hero.driverPos + new Vector3(0, 5, 0);
  console.log(heroCameraPos);
  app.camera.position.copy(heroCameraPos);
  // app.camera.position.set(8.8, 1.77, -5);

  setupKeyControls();
};

const animate = () => {
  requestAnimationFrame(animate);

  if (app.moveLeft) {
    app.hero.position.z += 0.1;
    app.camera.position.z += 0.1;
    app.camera.lookAt(0, app.hero.position.y, app.hero.position.z);
  } else if (app.moveRight) {
    app.hero.position.z -= 0.1;
    app.camera.position.z -= 0.1;
    app.camera.lookAt(0, app.hero.position.y, app.hero.position.z);
  }

  if (app.rightLaneCars.length !== 0 && app.rightLaneCars[0].position.x > 50) {
    removeObject3D(app.rightLaneCars[0]);
    app.rightLaneCars.shift();
  }

  if (
    app.rightLaneCars.length === 0 ||
    app.rightLaneCars[app.rightLaneCars.length - 1].position.x > -41
  ) {
    const car = proceduralCar();
    car.position.set(-50, 0, 2);
    car.rotateY(Math.PI);
    app.rightLaneCars.push(car);
    app.scene.add(car);
  }

  for (const c of app.rightLaneCars) {
    c.position.x += 0.1;
  }

  if (app.leftLaneCars.length !== 0 && app.leftLaneCars[0].position.x < -50) {
    removeObject3D(app.leftLaneCars[0]);
    app.leftLaneCars.shift();
  }

  if (
    app.leftLaneCars.length === 0 ||
    app.leftLaneCars[app.leftLaneCars.length - 1].position.x < 41
  ) {
    const car = proceduralCar();
    car.position.set(50, 0, -2);
    app.leftLaneCars.push(car);
    app.scene.add(car);
  }

  for (const c of app.leftLaneCars) {
    c.position.x -= 0.12;
  }

  app.composer.render();
};

const removeObject3D = (object) => {
  if (!(object instanceof Object3D)) return false;
  // for better memory management and performance
  if (object.geometry) {
    object.geometry.dispose();
  }
  if (object.material) {
    if (object.material instanceof Array) {
      // for better memory management and performance
      object.material.forEach((material) => material.dispose());
    } else {
      // for better memory management and performance
      object.material.dispose();
    }
  }
  if (object.parent) {
    object.parent.remove(object);
  }
  // the parent might be the scene or another Object3D, but it is sure to be removed this way
  return true;
};

const setupKeyControls = () => {
  document.onkeydown = function (e) {
    switch (e.keyCode) {
      case 65: // a.
        app.moveLeft = true;
        app.moveRight = false;
        break;
      case 68: // d.
        app.moveLeft = false;
        app.moveRight = true;
        break;
      // case 87:  // w.
      //   cube.rotation.x -= 0.1;
      //   break;
      // case 83:  // s
      //   cube.rotation.z += 0.1;
      //   break;
    }
  };

  document.onkeyup = function (e) {
    switch (e.keyCode) {
      case 65: // a.
        app.moveLeft = false;
        break;
      case 68: // d.
        app.moveRight = false;
        break;
    }
  };
};

init();
animate();
