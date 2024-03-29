import {
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { proceduralCar } from "./car";

const useLightHelpers = false;

const verticalFov = 40;
const aspectRatio = window.innerWidth / window.innerHeight;
const nearDistance = 0.1;
const farDistance = 1000;

let app = {
  el: document.getElementById("app"),
  scene: null,
  renderer: null,
  camera: null,
  composer: null,
  cars: [],
  lightHelpers: [],
};

const init = () => {
  app.scene = new Scene();
  app.scene.background = new Color(0xaaaaaa);
  app.camera = new PerspectiveCamera(
    verticalFov,
    aspectRatio,
    nearDistance,
    farDistance,
  );
  app.camera.position.z = 15;
  app.camera.position.y = 2;
  app.camera.position.x = 0;
  app.camera.lookAt(0, 0, 0);
  app.renderer = new WebGLRenderer();
  app.renderer.setSize(window.innerWidth, window.innerHeight);

  app.composer = new EffectComposer(app.renderer);
  const renderPass = new RenderPass(app.scene, app.camera);
  app.composer.addPass(renderPass);

  app.el.appendChild(app.renderer.domElement);

  const color = 0xffffff;
  const intensity = 1;
  const light = new DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  app.scene.add(light);

  for (let x = -1; x < 2; x++) {
    for (let y = -1; y < 2; y++) {
      const [
        car,
        leftHeadlightHelper,
        rightHeadlightHelper,
        leftTaillightHelper,
        rightTaillightHelper,
      ] = proceduralCar();
      car.position.x = x * 5;
      car.position.y = y * 3;
      app.cars.push(car);
      app.scene.add(car);
      if (useLightHelpers) {
        app.lightHelpers.push(leftHeadlightHelper);
        app.scene.add(leftHeadlightHelper);
        app.lightHelpers.push(rightHeadlightHelper);
        app.scene.add(rightHeadlightHelper);
        app.lightHelpers.push(leftTaillightHelper);
        app.scene.add(leftTaillightHelper);
        app.lightHelpers.push(rightTaillightHelper);
        app.scene.add(rightTaillightHelper);
      }
    }
  }
};

const animate = () => {
  requestAnimationFrame(animate);
  for (const c of app.cars) {
    c.rotation.y += 0.01;
  }
  for (const lh of app.lightHelpers) {
    lh.update();
  }

  app.composer.render();
};

init();
animate();
