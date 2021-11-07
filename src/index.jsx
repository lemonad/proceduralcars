import {
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { proceduralCar } from "./car";

const verticalFov = 40;
const aspectRatio = window.innerWidth / window.innerHeight;
const nearDistance = 0.1;
const farDistance = 1000;

let app = {
  el: document.getElementById("app"),
  scene: null,
  renderer: null,
  camera: null,
  cars: [],
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
  app.el.appendChild(app.renderer.domElement);

  const color = 0xffffff;
  const intensity = 1;
  const light = new DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  app.scene.add(light);

  for (let x = -1; x < 2; x++) {
    for (let y = -1; y < 2; y++) {
      const car = proceduralCar();
      car.position.x = x * 5;
      car.position.y = y * 3;
      app.cars.push(car);
      app.scene.add(car);
    }
  }
};

const animate = () => {
  requestAnimationFrame(animate);
  for (const c of app.cars) {
    c.rotation.y += 0.01;
  }

  app.renderer.render(app.scene, app.camera);
};

init();
animate();
