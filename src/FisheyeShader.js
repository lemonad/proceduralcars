/**
 * Full-screen textured quad shader
 */

var FisheyeShader = {
  uniforms: {
    tDiffuse: { value: null },
    opacity: { value: 1.0 },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,

  fragmentShader: /* glsl */ `
    uniform float opacity;
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    const float PI = 3.1415926535;

    vec2 distort(vec2 pos) {
      float n = length(pos);
      float z = sqrt(1.0 - n * n);
      float r = atan(n, z) / PI;
      float phi = atan(pos.y, pos.x);
      float u = r * cos(phi) + 0.5;
      float v = r * sin(phi) + 0.5;
      return vec2(u, v);

      // float theta = atan(pos.y, pos.x);
      // radius = pow(radius, 3.0);
      // pos.x = radius * cos(theta);
      // pos.y = radius * sin(theta);
      // return 0.5 * (pos + 1.0);
    }

    void main() {
      // vec2 xy = 2.0 * vUv.xy - 1.0;
      // float d = length(xy);
      // if (d >= 1.0) {
      //   discard;
      // }

      // vec2 uv = distort(xy);
      //
      vec2 uv = vUv - 0.5;
      float z = sqrt(1.0 - uv.x * uv.x - uv.y * uv.y);
      float a = 1.0 / (z * tan((PI / 1.6) * 0.5));

      vec4 texel = texture2D( tDiffuse, (uv * a) + 0.5 );
      gl_FragColor = texel;
    }`,
};

export { FisheyeShader };
