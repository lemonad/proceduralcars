import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DecalGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Object3D,
  PlaneGeometry,
  SpotLight,
  SpotLightHelper,
  Vector3,
} from "three";

export function road() {
  var root = new Object3D();
  root.rotation.x = -Math.PI / 2;
  root.rotation.z = Math.PI / 2;
  root.position.set(0, 0, 0);

  const pavementMaterial = new MeshPhongMaterial({
    color: 0x666666,
    specular: 0x666666,
  });
  var midLineMaterial = new MeshPhongMaterial({
    color: 0xddcc00,
  });
  var sideLineMaterial = new MeshPhongMaterial({
    color: 0xdddddd,
  });

  const pavementGeometry = new PlaneGeometry(11.5, 100);
  const pavement = new Mesh(pavementGeometry, pavementMaterial);
  root.add(pavement);

  const leftSideLineGeometry = new PlaneGeometry(0.25, 100).translate(
    -4,
    0,
    0.1,
  );
  const leftSideLine = new Mesh(leftSideLineGeometry, sideLineMaterial);
  root.add(leftSideLine);
  const rightSideLineGeometry = new PlaneGeometry(0.25, 100).translate(
    4,
    0,
    0.1,
  );
  const rightSideLine = new Mesh(rightSideLineGeometry, sideLineMaterial);
  root.add(rightSideLine);

  const midLineGeometry = new PlaneGeometry(0.25, 2.75);
  const midLine = new Mesh(midLineGeometry, midLineMaterial);

  let d = -49;
  while (d < 50) {
    const mc = midLine.clone();
    mc.position.set(0, d, 0.1);
    mc.rotation.set(0, 0, 0);
    root.add(mc);
    d += 6;
  }

  return root;
}
