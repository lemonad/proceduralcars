// https://en.wikipedia.org/wiki/Marsaglia_polar_method
export const gaussian = (mu = 0, sigma = 1) => {
  let x, y, s;
  do {
    // We want 0 < x, y < 1 but Math.random() ∈ [0,1).
    do {
      x = Math.random();
    } while (x === 0);
    do {
      y = Math.random();
    } while (y === 0);
    x = 2.0 * x - 1.0;
    y = 2.0 * y - 1.0;
    s = x * x + y * y;
    x = 2.0 * x - 1.0;
  } while (s >= 1 || s === 0);

  const f = Math.sqrt((-2.0 * Math.log(s)) / s);
  return [x * f * sigma + mu, y * f * sigma + mu];
};

// https://spin.atomicobject.com/2019/09/30/skew-normal-prng-javascript/
// ξ - Mean,
// ω - scale / stddev,
// α - shape / skewness.
export const skewNormal = (ξ, ω, α = 0) => {
  const [u0, v] = gaussian(0, 1);
  if (α === 0) {
    return ξ + ω * u0;
  }
  const 𝛿 = α / Math.sqrt(1 + α * α);
  const u1 = 𝛿 * u0 + Math.sqrt(1 - 𝛿 * 𝛿) * v;
  const z = u0 >= 0 ? u1 : -u1;
  return ξ + ω * z;
};

// NOTE Loops until value within range is objtain
export const truncatedSkewNormal = (ξ, ω, min, max, α = 0) => {
  if (min >= max) {
    throw new Error("Min must be larger than max");
  }
  let x;
  do {
    x = skewNormal(ξ, ω, α);
  } while (x < min || x > max);
  return x;
};
