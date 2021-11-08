import {
  Color,
  DirectionalLight,
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { proceduralCar } from "./car";
import { road } from "./road";

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
  leftLaneCars: [],
  rightLaneCars: [],
  lightHelpers: [],
};

const init = () => {
  app.scene = new Scene();
  app.scene.background = new Color(0x348868);
  app.camera = new PerspectiveCamera(
    verticalFov,
    aspectRatio,
    nearDistance,
    farDistance,
  );
  app.camera.position.set(20, 10, 20);
  app.camera.lookAt(0, 0, 0);
  app.renderer = new WebGLRenderer();
  app.renderer.setSize(window.innerWidth, window.innerHeight);

  app.composer = new EffectComposer(app.renderer);
  const renderPass = new RenderPass(app.scene, app.camera);
  app.composer.addPass(renderPass);

  app.el.appendChild(app.renderer.domElement);

  const color = 0xffffff;
  const intensity = 1.0;
  const light = new DirectionalLight(color, intensity);
  light.castShadow = true;
  light.position.set(20, 20, 40);
  app.scene.add(light);

  const roadMesh = road();
  app.scene.add(roadMesh);
};

const animate = () => {
  requestAnimationFrame(animate);

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
    c.position.x += 0.15;
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
    c.position.x -= 0.2;
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

init();
animate();
