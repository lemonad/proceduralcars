import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  SpotLight,
  SpotLightHelper,
  Vector3,
} from "three";
import { gaussian, skewNormal, truncatedSkewNormal } from "./random";

export function proceduralCar(withLights = false) {
  const adjustYForWheels = (v, frontCenter, rearCenter, radiusDiff) => {
    const deltaX = rearCenter.x - frontCenter.x;
    const deltaY = radiusDiff;
    const delta = deltaY / deltaX;
    v.setY(v.y + (v.x - frontCenter.x) * delta);
  };

  //             4  Δe   5
  //             +-------+
  //          Δd/         \Δf
  //     2 Δc  /           \ Δg 7
  //     +----+3           6+---+
  //    /Δb                      \Δh
  //    +------------------------+
  //    1           Δa           8
  //
  //     +---------+
  //    /           \
  //    +-----------+
  //    |           |
  //    +-----------+
  //          1
  //
  // 1 = (0, 0, 0)
  //
  // Δa = 100% [see below on rear wheel]
  // Δb = (-0.05, 0.1) [negative moves a to keep 100%?]
  // Δc = (0, 0.15)
  //
  // Rear wheel diameter = fron twheel diameter * [0, 25%]
  // lifting car linearly.

  const deltaB = new Vector3(
    truncatedSkewNormal(0, 0.05, -0.05, 0.1, 0.05),
    truncatedSkewNormal(0.5, 0.1, 0.3, 0.6),
    0,
  );
  const deltaC = new Vector3(
    truncatedSkewNormal(1, 0.5, 0, 1.7),
    truncatedSkewNormal(0, 0.2, 0, 0.3),
    0,
  );
  const deltaD = new Vector3(
    truncatedSkewNormal(0.3, 0.3, -0.1, 0.7),
    truncatedSkewNormal(0.5, 0.2, 0.35, 0.8),
    truncatedSkewNormal(0.1, 0.1, 0, 0.5),
  );
  const deltaE = new Vector3(
    truncatedSkewNormal(1.75, 0.5, 1.0, 3),
    truncatedSkewNormal(0, 0.2, -0.2, 0.2),
    truncatedSkewNormal(0, 0.5, -deltaD.z, 1.5),
  );
  const deltaF = new Vector3(
    truncatedSkewNormal(0.4, 0.2, 0, 1.0, -0.1),
    -truncatedSkewNormal(0.5, 0.2, 0.35, deltaD.y),
    -(deltaD.z + deltaE.z),
  );
  const deltaG = new Vector3(
    truncatedSkewNormal(0.6, 0.4, 0.2, 1.7),
    -truncatedSkewNormal(0, 0.1, 0, 0.2),
  );

  let p1 = new Vector3();
  let p2 = new Vector3().addVectors(p1, deltaB);
  let p3 = new Vector3().addVectors(p2, deltaC);
  let p4 = new Vector3().addVectors(p3, deltaD);
  let p5 = new Vector3().addVectors(p4, deltaE);
  let p6 = new Vector3().addVectors(p5, deltaF);
  let p7 = new Vector3().addVectors(p6, deltaG);
  const deltaH = new Vector3(
    truncatedSkewNormal(0, 0.05, -0.05, 0.1, 0.05),
    p1.y - p7.y,
    0,
  );
  let p8 = new Vector3().addVectors(p7, deltaH);

  const carLength = Math.max(p7.x, p8.x) - Math.min(p1.x, p2.x);

  const averageHoodHeight = (p2.y + p3.y) / 2;
  const averageTrunkHeight = (p6.y + p7.y) / 2;
  const wheelMaxRadius = Math.min(averageHoodHeight, averageTrunkHeight) * 0.9;
  const frontWheelRadius = truncatedSkewNormal(
    0.4,
    0.2,
    wheelMaxRadius * 0.5,
    wheelMaxRadius,
  );
  const rearWheelRadius = truncatedSkewNormal(
    0.4,
    0.2,
    frontWheelRadius,
    averageTrunkHeight * 0.9,
  );
  const wheelRadiusDiff = rearWheelRadius - frontWheelRadius;
  const frontWheelCenter = new Vector3(p1.x + 0.7, 0);
  const rearWheelCenter = new Vector3(p8.x - 0.6, wheelRadiusDiff);

  [p1, p2, p3, p4, p5, p6, p7, p8].forEach((v) =>
    adjustYForWheels(v, frontWheelCenter, rearWheelCenter, wheelRadiusDiff),
  );

  const frontWheelWidth = truncatedSkewNormal(0.3, 0.025, 0.2, 0.35);
  const rearWheelWidth = truncatedSkewNormal(
    frontWheelWidth,
    0.1,
    frontWheelWidth,
    0.5,
  );

  const delta1 = new Vector3((p1.x - p8.x) / 2, 0, -1);
  p1.add(delta1);
  p2.add(delta1);
  p3.add(delta1);
  p4.add(delta1);
  p5.add(delta1);
  p6.add(delta1);
  p7.add(delta1);
  p8.add(delta1);
  frontWheelCenter.add(delta1);
  rearWheelCenter.add(delta1);

  const delta = new Vector3(0, 0, 0);
  const p1z = p1.clone().setZ(-p1.z).add(delta);
  const p2z = p2.clone().setZ(-p2.z).add(delta);
  const p3z = p3.clone().setZ(-p3.z).add(delta);
  const p4z = p4.clone().setZ(-p4.z).add(delta);
  const p5z = p5.clone().setZ(-p5.z).add(delta);
  const p6z = p6.clone().setZ(-p6.z).add(delta);
  const p7z = p7.clone().setZ(-p7.z).add(delta);
  const p8z = p8.clone().setZ(-p8.z).add(delta);

  const geometry = new BufferGeometry();
  const positions = [
    // left lower side.
    p1,
    p3,
    p2,
    p1,
    p8,
    p3,
    p3,
    p8,
    p6,
    p8,
    p7,
    p6,
    // left upper side.
    p3,
    p6,
    p4,
    p4,
    p6,
    p5,

    // right lower side.
    p1z,
    p2z,
    p3z,
    p1z,
    p3z,
    p8z,
    p3z,
    p6z,
    p8z,
    p8z,
    p6z,
    p7z,
    // right upper side.
    p3z,
    p4z,
    p6z,
    p4z,
    p5z,
    p6z,
    // lower front.
    p1z,
    p1,
    p2z,
    p2z,
    p1,
    p2,
    // hood.
    p2z,
    p2,
    p3z,
    p3z,
    p2,
    p3,
    // windshield.
    p3z,
    p3,
    p4z,
    p4z,
    p3,
    p4,
    // roof.
    p4z,
    p4,
    p5z,
    p5z,
    p4,
    p5,
    // back window.
    p5z,
    p5,
    p6,
    p6,
    p5z,
    p6z,
    // trunk.
    p6z,
    p6,
    p7,
    p7,
    p6z,
    p7z,
    // lower back.
    p7z,
    p7,
    p8,
    p8,
    p7z,
    p8z,
    // Under.
    p1,
    p1z,
    p8,
    p1z,
    p8,
    p8z,
  ].flatMap((p) => p.toArray());
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();

  const carColor = new Color(0xffffff);
  carColor.setHex(Math.random() * 0xffffff);
  const carMaterial = new MeshPhongMaterial({
    color: carColor,
    specular: carColor,
    side: DoubleSide,
  });
  const tireMaterial = new MeshPhongMaterial({
    color: 0x222222,
  });
  const car = new Mesh(geometry, carMaterial);
  car.castShadow = true;
  car.receiveShadow = false;

  const backLeftTireGeometry = new CylinderGeometry(
    rearWheelRadius,
    rearWheelRadius,
    rearWheelWidth,
    16,
  )
    .rotateX(Math.PI / 2)
    .translate(rearWheelCenter.x, rearWheelCenter.y, 1);
  const backRightTireGeometry = new CylinderGeometry(
    rearWheelRadius,
    rearWheelRadius,
    rearWheelWidth,
    16,
  )
    .rotateX(Math.PI / 2)
    .translate(rearWheelCenter.x, rearWheelCenter.y, -1);
  const frontLeftTireGeometry = new CylinderGeometry(
    frontWheelRadius,
    frontWheelRadius,
    frontWheelWidth,
    16,
  )
    .rotateX(Math.PI / 2)
    .translate(frontWheelCenter.x, frontWheelCenter.y, 1);
  const frontRightTireGeometry = new CylinderGeometry(
    frontWheelRadius,
    frontWheelRadius,
    frontWheelWidth,
    16,
  )
    .rotateX(Math.PI / 2)
    .translate(frontWheelCenter.x, frontWheelCenter.y, -1);
  const rearLeftTire = new Mesh(backLeftTireGeometry, tireMaterial);
  const rearRightTire = new Mesh(backRightTireGeometry, tireMaterial);
  const frontLeftTire = new Mesh(frontLeftTireGeometry, tireMaterial);
  const frontRightTire = new Mesh(frontRightTireGeometry, tireMaterial);

  const headlightFixtureMaterial = new MeshPhongMaterial({
    color: 0xffffff,
  });
  const leftHeadlightFixtureGeometry = new CylinderGeometry(0.12, 0.12, 0.02, 8)
    .rotateZ(Math.PI / 2)
    .translate(p1.x - 0.01, (p2.y + p1.y) / 2, p1.z + 0.2);
  const leftHeadlightFixture = new Mesh(
    leftHeadlightFixtureGeometry,
    headlightFixtureMaterial,
  );
  car.add(leftHeadlightFixture);

  const rightHeadlightFixtureGeometry = new CylinderGeometry(
    0.12,
    0.12,
    0.02,
    8,
  )
    .rotateZ(Math.PI / 2)
    .translate(p1z.x - 0.01, (p2z.y + p1z.y) / 2, p1z.z - 0.2);
  const rightHeadlightFixture = new Mesh(
    rightHeadlightFixtureGeometry,
    headlightFixtureMaterial,
  );
  car.add(rightHeadlightFixture);

  const taillightFixtureMaterial = new MeshPhongMaterial({
    color: 0xff4444,
  });
  const leftTaillightFixtureGeometry = new BoxGeometry(
    0.02,
    0.12,
    0.22,
  ).translate(p8.x + 0.01, (p7.y + p8.y) / 2, p8.z + 0.3);
  const leftTaillightFixture = new Mesh(
    leftTaillightFixtureGeometry,
    taillightFixtureMaterial,
  );
  car.add(leftTaillightFixture);

  const rightTaillightFixtureGeometry = new BoxGeometry(
    0.02,
    0.12,
    0.22,
  ).translate(p8z.x + 0.01, (p7z.y + p8z.y) / 2, p8z.z - 0.3);
  const rightTaillightFixture = new Mesh(
    rightTaillightFixtureGeometry,
    taillightFixtureMaterial,
  );
  car.add(rightTaillightFixture);

  if (withLights) {
    const leftHeadlight = new SpotLight(
      0xffffaa,
      1, // Intensity.
      30, // Maximum distance.
      Math.PI / 6, // Angle.
      0.5, // Penumbra.
      1, // Decay (2 is physically correct).
    );
    leftHeadlight.position.set(p1.x, p1.y + 0.2, p1.z + 0.2);
    leftHeadlight.castShadow = true;
    leftHeadlight.target.position.set(p1.x - 0.5, p1.y + 0.02, p1.z + 0.2);
    car.add(leftHeadlight);
    car.add(leftHeadlight.target);

    const rightHeadlight = new SpotLight(
      0xffffaa,
      1, // Intensity.
      30, // Maximum distance.
      Math.PI / 6, // Angle.
      0.5, // Penumbra.
      1, // Decay (2 is physically correct).
    );
    rightHeadlight.position.set(p1z.x, p1z.y + 0.2, p1z.z - 0.2);
    rightHeadlight.castShadow = true;
    rightHeadlight.target.position.set(p1z.x - 0.5, p1z.y + 0.02, p1z.z - 0.2);
    car.add(rightHeadlight);
    car.add(rightHeadlight.target);

    const leftTaillight = new SpotLight(
      0xff4444,
      1, // Intensity.
      4, // Maximum distance.
      Math.PI / 8, // Angle.
      0.5, // Penumbra.
      0.25, // Decay (2 is physically correct).
    );
    leftTaillight.position.set(p8.x, p8.y + 0.2, p8.z + 0.2);
    leftTaillight.castShadow = true;
    leftTaillight.target.position.set(p8.x + 1, p8.y + 0.2, p8.z + 0.2);
    car.add(leftTaillight);
    car.add(leftTaillight.target);

    const rightTaillight = new SpotLight(
      0xff4444,
      1, // Intensity.
      4, // Maximum distance.
      Math.PI / 8, // Angle.
      0.5, // Penumbra.
      0.25, // Decay (2 is physically correct).
    );
    rightTaillight.position.set(p8z.x, p8z.y + 0.0, p8z.z - 0.2);
    rightTaillight.castShadow = true;
    rightTaillight.target.position.set(p8z.x + 1, p8z.y + 0, p8z.z - 0.2);
    car.add(rightTaillight);
    car.add(rightTaillight.target);
  }

  // const leftHeadlightHelper = new SpotLightHelper(leftHeadlight);
  // const rightHeadlightHelper = new SpotLightHelper(rightHeadlight);
  // const leftTaillightHelper = new SpotLightHelper(leftTaillight);
  // const rightTaillightHelper = new SpotLightHelper(rightTaillight);

  car.add(rearLeftTire, rearRightTire, frontLeftTire, frontRightTire);
  car.translateY(frontWheelRadius);

  const root = new Object3D();
  root.add(car);
  root.driverPos = new Vector3(
    (p3.x + p4.x) / 2,
    (p3.y + p4.y * 3) / 4 + frontWheelRadius,
    (p3.z + p3z.z * 3) / 4,
  );
  return root;
}
