import {
  BufferGeometry,
  CameraHelper,
  Color,
  DirectionalLight,
  DoubleSide,
  Euler,
  Line,
  LineLoop,
  LineBasicMaterial,
  Math as ThreeMath,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Ray,
  Scene,
  Shape,
  ShapeGeometry,
  Triangle,
  Vector3,
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
  car: null,
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
  app.camera.position.z = 0;
  app.camera.position.y = 2;
  app.camera.position.x = -7;
  app.camera.lookAt(0, 0, 0);
  app.renderer = new WebGLRenderer();
  app.renderer.setSize(window.innerWidth, window.innerHeight);
  app.el.appendChild(app.renderer.domElement);

  const color = 0xffffff;
  const intensity = 1;
  const light = new DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  app.scene.add(light);

  app.car = proceduralCar();
  app.scene.add(app.car);
};

const animate = () => {
  requestAnimationFrame(animate);
  app.car.rotation.y += 0.01;

  app.renderer.render(app.scene, app.camera);
};

const createMaterial = () => {
  // const material = new MeshPhongMaterial({
  //   side: DoubleSide,
  // });
  const material = new MeshPhongMaterial({
    color: 0x44aa88,
    side: DoubleSide,
  });

  // const hue = Math.random();
  // const saturation = 1;
  // const luminance = 0.5;
  // material.color.setHSL(hue, saturation, luminance);
  return material;
};

init();
animate();
