// Geometría y definiciones cinemáticas de cada ejercicio (lienzo lógico 160x100)
export const FLOOR_Y = 84;
export const THIGH = 15.5;
export const SHIN = 15.5;
export const UPPER_ARM = 12;
export const FORE_ARM = 11.5;

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(t, 0, 1));
export const pLerp = (p1, p2, t) => ({ x: lerp(p1.x, p2.x, t), y: lerp(p1.y, p2.y, t) });

/**
 * Cinemática inversa (IK) de 2 huesos en 2D para rodillas y codos.
 */
export function solveIK(p1, p2, len1, len2, bendDir = 1) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const distRaw = Math.hypot(dx, dy);
  const maxReach = Math.max(0.001, len1 + len2 - 0.15);
  const minReach = Math.abs(len1 - len2) + 0.15;
  const d = clamp(distRaw, minReach, maxReach);
  const a = (len1 * len1 - len2 * len2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, len1 * len1 - a * a));
  const ux = distRaw > 0.0001 ? dx / distRaw : 0;
  const uy = distRaw > 0.0001 ? dy / distRaw : 1;
  const mx = p1.x + a * ux;
  const my = p1.y + a * uy;
  return {
    x: mx - bendDir * h * uy,
    y: my + bendDir * h * ux
  };
}

/**
 * Cinemática directa (FK) para extremidades libres.
 */
export function fk(origin, angleDeg, length) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: origin.x + Math.cos(rad) * length,
    y: origin.y + Math.sin(rad) * length
  };
}

function buildSquatPose(wp, factor) {
  const depth = factor * wp;
  const pelvis = { x: lerp(78, 66, depth), y: lerp(53, 66.5, depth) };
  const torsoLean = lerp(-90, -56, depth);
  const midSpine = fk(pelvis, torsoLean, 10.5);
  const shoulder = fk(pelvis, torsoLean, 20.5);
  const head = fk(shoulder, torsoLean + 8, 7.8);

  const rFoot = { x: 80, y: FLOOR_Y };
  const lFoot = { x: 78, y: FLOOR_Y - 0.8 };
  const rKnee = solveIK(pelvis, rFoot, THIGH, SHIN, -1);
  const lKnee = solveIK(pelvis, lFoot, THIGH, SHIN, -1);

  const armAng = lerp(84, -8, depth);
  const rElbow = fk(shoulder, armAng, UPPER_ARM);
  const rHand = fk(rElbow, armAng - 6, FORE_ARM);
  const lElbow = fk(shoulder, armAng - 4, UPPER_ARM);
  const lHand = fk(lElbow, armAng - 10, FORE_ARM);

  return { pelvis, midSpine, shoulder, head, lKnee, lFoot, rKnee, rFoot, lElbow, lHand, rElbow, rHand };
}

/**
 * Diccionario extensible de poses por ID de ejercicio (21 ejercicios).
 */
export const POSE_BUILDERS = {
  shoulder_thoracic(u) {
    const twist = Math.sin(u * Math.PI * 2);
    const armLift = ease(Math.abs(Math.sin(u * Math.PI)));
    const pelvis = { x: 80, y: 53 };
    const midSpine = { x: 80 + twist * 1.2, y: 44 };
    const shoulder = { x: 80 + twist * 2.5, y: 35 };
    const head = { x: 80 + twist * 2.2, y: 27 };

    const lFoot = { x: 74, y: FLOOR_Y };
    const rFoot = { x: 86, y: FLOOR_Y };
    const lKnee = solveIK({ x: 77, y: 53 }, lFoot, THIGH, SHIN, -0.2);
    const rKnee = solveIK({ x: 83, y: 53 }, rFoot, THIGH, SHIN, 0.2);

    const lSh = { x: shoulder.x - 5 + twist * 2, y: shoulder.y };
    const rSh = { x: shoulder.x + 5 + twist * 2, y: shoulder.y };
    const lAngle = lerp(115, -135, armLift) - twist * 22;
    const rAngle = lerp(65, -45, armLift) - twist * 22;
    const lElbow = fk(lSh, lAngle, UPPER_ARM);
    const lHand = fk(lElbow, lAngle - 14, FORE_ARM);
    const rElbow = fk(rSh, rAngle, UPPER_ARM);
    const rHand = fk(rElbow, rAngle + 14, FORE_ARM);

    return {
      pelvis, midSpine, shoulder, head, lSh, rSh,
      lHip: { x: 77, y: 53 }, rHip: { x: 83, y: 53 },
      lKnee, lFoot, rKnee, rFoot, lElbow, lHand, rElbow, rHand
    };
  },

  march_hip_open(u) {
    const phaseA = u < 0.5 ? ease(u < 0.25 ? u * 4 : (0.5 - u) * 4) : 0;
    const phaseB = u >= 0.5 ? ease(u < 0.75 ? (u - 0.5) * 4 : (1 - u) * 4) : 0;
    const bounce = -1.2 * (phaseA + phaseB);
    const pelvis = { x: 80, y: 53 + bounce };
    const midSpine = { x: 80, y: 44 + bounce };
    const shoulder = { x: 80, y: 34.5 + bounce };
    const head = { x: 80.5, y: 26.5 + bounce };

    const rFootStand = { x: 80.5, y: FLOOR_Y };
    const lFootStand = { x: 79.5, y: FLOOR_Y };
    const rKneeUp = fk(pelvis, -10, THIGH);
    const rFootUp = fk(rKneeUp, 88, SHIN);
    const lKneeUp = fk(pelvis, -8, THIGH);
    const lFootUp = fk(lKneeUp, 88, SHIN);

    const rKnee = pLerp(solveIK(pelvis, rFootStand, THIGH, SHIN, -1), rKneeUp, phaseA);
    const rFoot = pLerp(rFootStand, rFootUp, phaseA);
    const lKnee = pLerp(solveIK(pelvis, lFootStand, THIGH, SHIN, -1), lKneeUp, phaseB);
    const lFoot = pLerp(lFootStand, lFootUp, phaseB);

    const rArmAng = lerp(85, 35, phaseB) + lerp(0, 30, phaseA);
    const lArmAng = lerp(85, 35, phaseA) + lerp(0, 30, phaseB);
    const rElbow = fk(shoulder, rArmAng, UPPER_ARM);
    const rHand = fk(rElbow, rArmAng - 65, FORE_ARM);
    const lElbow = fk(shoulder, lArmAng, UPPER_ARM);
    const lHand = fk(lElbow, lArmAng - 65, FORE_ARM);

    return { pelvis, midSpine, shoulder, head, lKnee, lFoot, rKnee, rFoot, lElbow, lHand, rElbow, rHand };
  },

  cat_cow(u, w) {
    const arch = w;
    const pelvis = { x: 64, y: lerp(62, 60.5, arch) };
    const shoulder = { x: 92, y: lerp(61.5, 59, arch) };
    const midSpine = { x: 78, y: lerp(67.5, 51.5, arch) };
    const head = { x: lerp(100, 97, arch), y: lerp(54, 65.5, arch) };

    const lKnee = { x: 63, y: FLOOR_Y - 1.5 };
    const rKnee = { x: 65, y: FLOOR_Y - 1 };
    const lFoot = { x: 48, y: FLOOR_Y - 1 };
    const rFoot = { x: 50, y: FLOOR_Y - 0.5 };

    const lHand = { x: 91, y: FLOOR_Y - 1 };
    const rHand = { x: 93, y: FLOOR_Y - 0.5 };
    const lElbow = solveIK(shoulder, lHand, UPPER_ARM, FORE_ARM, 1);
    const rElbow = solveIK(shoulder, rHand, UPPER_ARM, FORE_ARM, 1);

    return { pelvis, midSpine, shoulder, head, lKnee, lFoot, rKnee, rFoot, lElbow, lHand, rElbow, rHand };
  },

  glute_bridge(u, w, wp) {
    const lift = wp;
    const shoulder = { x: 56, y: FLOOR_Y - 3.5 };
    const head = { x: 47, y: FLOOR_Y - 4.5 };
    const pelvis = { x: lerp(77, 79, lift), y: lerp(FLOOR_Y - 3.2, 66.5, lift) };
    const midSpine = { x: (shoulder.x + pelvis.x) / 2, y: lerp(FLOOR_Y - 3.3, 73.5, lift) };

    const rFoot = { x: 102, y: FLOOR_Y - 0.5 };
    const lFoot = { x: 100, y: FLOOR_Y - 1.2 };
    const rKnee = solveIK(pelvis, rFoot, THIGH, SHIN, -1);
    const lKnee = solveIK(pelvis, lFoot, THIGH, SHIN, -1);

    const rElbow = { x: 67, y: FLOOR_Y - 2.5 };
    const rHand = { x: 78, y: FLOOR_Y - 1.5 };
    const lElbow = { x: 66, y: FLOOR_Y - 3 };
    const lHand = { x: 77, y: FLOOR_Y - 2 };

    return { pelvis, midSpine, shoulder, head, lKnee, lFoot, rKnee, rFoot, lElbow, lHand, rElbow, rHand };
  },

  half_squat(u, w, wp) {
    return buildSquatPose(wp, 0.55);
  },

  controlled_squat(u, w, wp) {
    return buildSquatPose(wp, 1.0);
  },

  knee_pushup(u, w, wp) {
    const down = wp;
    const lKnee = { x: 58, y: FLOOR_Y - 1.5 };
    const rKnee = { x: 60, y: FLOOR_Y - 0.8 };
    const lFoot = { x: 47, y: 74 };
    const rFoot = { x: 49, y: 74.5 };

    const bodyAng = lerp(-31, -11, down);
    const pelvis = fk(rKnee, bodyAng, THIGH);
    const midSpine = fk(pelvis, bodyAng, 10.5);
    const shoulder = fk(pelvis, bodyAng, 21);
    const head = fk(shoulder, bodyAng - 4, 8);

    const rHand = { x: 96, y: FLOOR_Y - 0.5 };
    const lHand = { x: 94, y: FLOOR_Y - 1.3 };
    const rElbow = solveIK(shoulder, rHand, UPPER_ARM, FORE_ARM, 1);
    const lElbow = solveIK(shoulder, lHand, UPPER_ARM, FORE_ARM, 1);

    return { pelvis, midSpine, shoulder, head, lKnee, lFoot, rKnee, rFoot, lElbow, lHand, rElbow, rHand };
  },

  full_pushup(u, w, wp) {
    const down = wp;
    const rFoot = { x: 45, y: FLOOR_Y - 0.5 };
    const lFoot = { x: 43, y: FLOOR_Y - 1.2 };
    const bodyAng = lerp(-24, -8, down);
    const rKnee = fk(rFoot, bodyAng, SHIN);
    const lKnee = fk(lFoot, bodyAng, SHIN);
    const pelvis = fk(rKnee, bodyAng, THIGH);
    const midSpine = fk(pelvis, bodyAng, 10.5);
    const shoulder = fk(pelvis, bodyAng, 21);
    const head = fk(shoulder, bodyAng - 3, 8);

    const rHand = { x: 99, y: FLOOR_Y - 0.5 };
    const lHand = { x: 97, y: FLOOR_Y - 1.3 };
    const rElbow = solveIK(shoulder, rHand, UPPER_ARM, FORE_ARM, 1);
    const lElbow = solveIK(shoulder, lHand, UPPER_ARM, FORE_ARM, 1);

    return { pelvis, midSpine, shoulder, head, lKnee, lFoot, rKnee, rFoot, lElbow, lHand, rElbow, rHand };
  },

  bird_dog(u) {
    const extA = u < 0.5 ? ease(u < 0.2 ? u / 0.2 : u < 0.32 ? 1 : (0.5 - u) / 0.18) : 0;
    const extB = u >= 0.5 ? ease(u < 0.7 ? (u - 0.5) / 0.2 : u < 0.82 ? 1 : (1 - u) / 0.18) : 0;

    const pelvis = { x: 68, y: 61 };
    const midSpine = { x: 80, y: 60.5 };
    const shoulder = { x: 92, y: 60 };
    const head = { x: 100.5, y: 58.5 };

    const rKneeBase = { x: 68, y: FLOOR_Y - 0.8 };
    const rFootBase = { x: 53, y: FLOOR_Y - 0.5 };
    const lKneeBase = { x: 66, y: FLOOR_Y - 1.6 };
    const lFootBase = { x: 51, y: FLOOR_Y - 1.3 };

    const rHandBase = { x: 93, y: FLOOR_Y - 0.5 };
    const rElbowBase = solveIK(shoulder, rHandBase, UPPER_ARM, FORE_ARM, 1);
    const lHandBase = { x: 91, y: FLOOR_Y - 1.3 };
    const lElbowBase = solveIK(shoulder, lHandBase, UPPER_ARM, FORE_ARM, 1);

    const legExtKnee = { x: pelvis.x - THIGH, y: pelvis.y - 1 };
    const legExtFoot = { x: pelvis.x - THIGH - SHIN, y: pelvis.y - 2 };
    const armExtElbow = { x: shoulder.x + UPPER_ARM, y: shoulder.y - 1 };
    const armExtHand = { x: shoulder.x + UPPER_ARM + FORE_ARM, y: shoulder.y - 2 };

    const rElbow = pLerp(rElbowBase, armExtElbow, extA);
    const rHand = pLerp(rHandBase, armExtHand, extA);
    const lKnee = pLerp(lKneeBase, legExtKnee, extA);
    const lFoot = pLerp(lFootBase, legExtFoot, extA);

    const lElbow = pLerp(lElbowBase, armExtElbow, extB);
    const lHand = pLerp(lHandBase, armExtHand, extB);
    const rKnee = pLerp(rKneeBase, legExtKnee, extB);
    const rFoot = pLerp(rFootBase, legExtFoot, extB);

    return { pelvis, midSpine, shoulder, head, lKnee, lFoot, rKnee, rFoot, lElbow, lHand, rElbow, rHand };
  },

  plank_short(u) {
    const breath = Math.sin(u * Math.PI * 2);
    const rFoot = { x: 45, y: FLOOR_Y - 0.5 };
    const lFoot = { x: 43, y: FLOOR_Y - 1.2 };
    const ang = -10.5;
    const rKnee = fk(rFoot, ang, SHIN);
    const lKnee = fk(lFoot, ang, SHIN);
    const pelvis = fk(rKnee, ang, THIGH);
    const midSpine = { x: pelvis.x + 10.5, y: pelvis.y - 2.0 + breath * 0.9 };
    const shoulder = { x: pelvis.x + 21, y: pelvis.y - 3.6 + breath * 0.5 };
    const head = { x: shoulder.x + 8, y: shoulder.y - 0.5 };

    const rElbow = { x: shoulder.x + 1, y: FLOOR_Y - 1 };
    const rHand = { x: rElbow.x + FORE_ARM, y: FLOOR_Y - 1 };
    const lElbow = { x: shoulder.x - 1, y: FLOOR_Y - 1.8 };
    const lHand = { x: lElbow.x + FORE_ARM, y: FLOOR_Y - 1.8 };

    return {
      pelvis, midSpine, shoulder, head, lKnee, lFoot, rKnee, rFoot, lElbow, lHand, rElbow, rHand,
      guideLine: [rFoot, shoulder]
    };
  },

  plank_shoulder_tap(u) {
    const tapR = u < 0.5 ? ease(u < 0.25 ? u * 4 : (0.5 - u) * 4) : 0;
    const tapL = u >= 0.5 ? ease(u < 0.75 ? (u - 0.5) * 4 : (1 - u) * 4) : 0;

    const rFoot = { x: 45, y: FLOOR_Y - 0.5 };
    const lFoot = { x: 43, y: FLOOR_Y - 1.2 };
    const ang = -21;
    const rKnee = fk(rFoot, ang, SHIN);
    const lKnee = fk(lFoot, ang, SHIN);
    const pelvis = fk(rKnee, ang, THIGH);
    const midSpine = fk(pelvis, ang, 10.5);
    const shoulder = fk(pelvis, ang, 21);
    const head = fk(shoulder, ang - 2, 8);

    const rHandBase = { x: 98, y: FLOOR_Y - 0.5 };
    const rElbowBase = solveIK(shoulder, rHandBase, UPPER_ARM, FORE_ARM, 1);
    const lHandBase = { x: 96, y: FLOOR_Y - 1.4 };
    const lElbowBase = solveIK(shoulder, lHandBase, UPPER_ARM, FORE_ARM, 1);

    const tapElbow = { x: shoulder.x + 4, y: shoulder.y + 10 };
    const tapHand = { x: shoulder.x - 1, y: shoulder.y + 1 };

    const rElbow = pLerp(rElbowBase, tapElbow, tapR);
    const rHand = pLerp(rHandBase, tapHand, tapR);
    const lElbow = pLerp(lElbowBase, tapElbow, tapL);
    const lHand = pLerp(lHandBase, tapHand, tapL);

    return { pelvis, midSpine, shoulder, head, lKnee, lFoot, rKnee, rFoot, lElbow, lHand, rElbow, rHand };
  },

  gentle_lunge(u, w, wp) {
    const down = wp;
    const rFoot = { x: 95, y: FLOOR_Y };
    const lFoot = { x: 64, y: FLOOR_Y };
    const pelvis = { x: lerp(79, 80, down), y: lerp(54, 67, down) };
    const midSpine = { x: pelvis.x + 0.5, y: pelvis.y - 10 };
    const shoulder = { x: pelvis.x + 1, y: pelvis.y - 20 };
    const head = { x: shoulder.x + 0.5, y: shoulder.y - 8 };

    const rKnee = solveIK(pelvis, rFoot, THIGH, SHIN, -1);
    const lKnee = solveIK(pelvis, lFoot, THIGH, SHIN, -1);

    const rElbow = fk(shoulder, lerp(92, 70, down), UPPER_ARM);
    const rHand = fk(rElbow, lerp(110, 15, down), FORE_ARM * 0.85);
    const lElbow = fk(shoulder, lerp(86, 112, down), UPPER_ARM);
    const lHand = fk(lElbow, lerp(95, 55, down), FORE_ARM * 0.85);

    return { pelvis, midSpine, shoulder, head, lKnee, lFoot, rKnee, rFoot, lElbow, lHand, rElbow, rHand };
  },

  superman(u, w, wp) {
    const lift = wp;
    const pelvis = { x: 78, y: FLOOR_Y - 2.5 };
    const midSpine = { x: 88, y: lerp(FLOOR_Y - 2.8, FLOOR_Y - 5.2, lift) };
    const shoulder = { x: 98, y: lerp(FLOOR_Y - 3, FLOOR_Y - 10.5, lift) };
    const head = { x: 106, y: lerp(FLOOR_Y - 4, FLOOR_Y - 13.5, lift) };

    const legAng = lerp(178, 163, lift);
    const rKnee = fk(pelvis, legAng, THIGH);
    const rFoot = fk(rKnee, legAng - 2, SHIN);
    const lKnee = fk({ x: pelvis.x, y: pelvis.y - 0.8 }, legAng + 1, THIGH);
    const lFoot = fk(lKnee, legAng - 1, SHIN);

    const armAng = lerp(-2, -19, lift);
    const rElbow = fk(shoulder, armAng, UPPER_ARM);
    const rHand = fk(rElbow, armAng - 3, FORE_ARM);
    const lElbow = fk({ x: shoulder.x, y: shoulder.y - 0.8 }, armAng - 2, UPPER_ARM);
    const lHand = fk(lElbow, armAng - 4, FORE_ARM);

    return { pelvis, midSpine, shoulder, head, lKnee, lFoot, rKnee, rFoot, lElbow, lHand, rElbow, rHand };
  },

  downdog_cobra(u, w, wp) {
    const t = wp;
    const rHand = { x: 103, y: FLOOR_Y - 0.5 };
    const lHand = { x: 101, y: FLOOR_Y - 1.3 };
    const rFoot = { x: 47, y: FLOOR_Y - 0.5 };
    const lFoot = { x: 45, y: FLOOR_Y - 1.3 };

    const pelvisDD = { x: 69, y: 49 };
    const midDD = { x: 79, y: 57 };
    const shDD = { x: 89, y: 65 };
    const headDD = { x: 95, y: 71 };

    const pelvisCobra = { x: 78, y: FLOOR_Y - 3 };
    const midCobra = { x: 89, y: 74 };
    const shCobra = { x: 98, y: 61 };
    const headCobra = { x: 104, y: 53 };

    const pelvis = pLerp(pelvisDD, pelvisCobra, t);
    const midSpine = pLerp(midDD, midCobra, t);
    const shoulder = pLerp(shDD, shCobra, t);
    const head = pLerp(headDD, headCobra, t);

    const rKnee = solveIK(pelvis, rFoot, THIGH, SHIN, -1);
    const lKnee = solveIK(pelvis, lFoot, THIGH, SHIN, -1);
    const rElbow = solveIK(shoulder, rHand, UPPER_ARM, FORE_ARM, 1);
    const lElbow = solveIK(shoulder, lHand, UPPER_ARM, FORE_ARM, 1);

    return { pelvis, midSpine, shoulder, head, lKnee, lFoot, rKnee, rFoot, lElbow, lHand, rElbow, rHand };
  },

  child_pose(u, w) {
    const breath = w;
    const rFoot = { x: 48, y: FLOOR_Y - 0.8 };
    const lFoot = { x: 47, y: FLOOR_Y - 1.4 };
    const rKnee = { x: 65, y: FLOOR_Y - 1 };
    const lKnee = { x: 64, y: FLOOR_Y - 1.6 };

    const pelvis = { x: 54, y: lerp(73, 74.5, breath) };
    const midSpine = { x: 67, y: lerp(69.5, 67.2, breath) };
    const shoulder = { x: 80, y: lerp(74, 73.2, breath) };
    const head = { x: 87.5, y: lerp(79.5, 80, breath) };

    const rHand = { x: lerp(104, 107, breath), y: FLOOR_Y - 0.6 };
    const lHand = { x: lerp(102, 105, breath), y: FLOOR_Y - 1.4 };
    const rElbow = solveIK(shoulder, rHand, UPPER_ARM, FORE_ARM, 1);
    const lElbow = solveIK(shoulder, lHand, UPPER_ARM, FORE_ARM, 1);

    return { pelvis, midSpine, shoulder, head, lKnee, lFoot, rKnee, rFoot, lElbow, lHand, rElbow, rHand };
  },

  hip_hamstring_stretch(u, w, wp) {
    const t = wp;
    const lKnee = { x: 64, y: FLOOR_Y - 1 };
    const lFoot = { x: 49, y: FLOOR_Y - 0.8 };
    const rFoot = { x: 96, y: FLOOR_Y - 0.5 };

    const pelvis = { x: lerp(76, 65, t), y: lerp(67, 63, t) };
    const torsoAng = lerp(-82, -45, t);
    const midSpine = fk(pelvis, torsoAng, 10.5);
    const shoulder = fk(pelvis, torsoAng, 20.5);
    const head = fk(shoulder, torsoAng + 8, 7.6);

    const rKnee = solveIK(pelvis, rFoot, THIGH, SHIN, -1);

    const rHand = pLerp({ x: 89, y: 69 }, { x: 89, y: 77 }, t);
    const lHand = pLerp({ x: 87, y: 69 }, { x: 87, y: 78 }, t);
    const rElbow = solveIK(shoulder, rHand, UPPER_ARM, FORE_ARM, 1);
    const lElbow = solveIK(shoulder, lHand, UPPER_ARM, FORE_ARM, 1);

    return { pelvis, midSpine, shoulder, head, lKnee, lFoot, rKnee, rFoot, lElbow, lHand, rElbow, rHand };
  },

  // --- BLOQUE DE TOBILLOS Y RODILLAS PARA FÚTBOL ---

  // 17. DORSIFLEXIÓN DE TOBILLO EN MEDIA RODILLA (talón pegado al suelo, rodilla pasa dedos)
  ankle_dorsiflexion(u, w, wp) {
    const t = wp;
    const lKnee = { x: 64, y: FLOOR_Y - 1 };
    const lFoot = { x: 49, y: FLOOR_Y - 1 };
    const lToe = { x: 45, y: FLOOR_Y - 0.6 };

    const backThighAng = lerp(-75, -34, t);
    const pelvis = fk(lKnee, backThighAng, THIGH);
    const torsoAng = lerp(-86, -68, t);
    const midSpine = fk(pelvis, torsoAng, 10.5);
    const shoulder = fk(pelvis, torsoAng, 20.5);
    const head = fk(shoulder, torsoAng + 6, 7.6);

    // Pie delantero completamente plano en el suelo (talón no se despega)
    const rFoot = { x: 83, y: FLOOR_Y - 0.6 };
    const rToe = { x: 90, y: FLOOR_Y - 0.6 };
    const rKnee = solveIK(pelvis, rFoot, THIGH, SHIN, -1);

    // Manos guiando suavemente sobre la rodilla delantera
    const rHand = { x: rKnee.x - 1, y: rKnee.y - 1.4 };
    const lHand = { x: rKnee.x - 3, y: rKnee.y - 1.4 };
    const rElbow = solveIK(shoulder, rHand, UPPER_ARM, FORE_ARM, 1);
    const lElbow = solveIK(shoulder, lHand, UPPER_ARM, FORE_ARM, 1);

    return {
      pelvis, midSpine, shoulder, head,
      lKnee, lFoot, lToe, rKnee, rFoot, rToe,
      lElbow, lHand, rElbow, rHand
    };
  },

  // 18. ELEVACIÓN DE TALONES CONTROLADA (puntas fijas, talón sube y baja)
  calf_raise(u, w, wp) {
    const t = wp;
    const rToe = { x: 86, y: FLOOR_Y - 0.5 };
    const lToe = { x: 84, y: FLOOR_Y - 1.2 };

    const footAng = lerp(180, 228, t);
    const rFoot = fk(rToe, footAng, 7);
    const lFoot = fk(lToe, footAng, 7);

    const liftY = rFoot.y - (FLOOR_Y - 0.5);
    const shiftX = rFoot.x - 79;

    const pelvis = { x: 79 + shiftX * 0.9, y: 52.8 + liftY };
    const midSpine = { x: pelvis.x + 0.3, y: pelvis.y - 10 };
    const shoulder = { x: pelvis.x + 0.6, y: pelvis.y - 20 };
    const head = { x: shoulder.x + 0.5, y: shoulder.y - 8 };

    const rKnee = solveIK(pelvis, rFoot, THIGH, SHIN, -1);
    const lKnee = solveIK(pelvis, lFoot, THIGH, SHIN, -1);

    const rElbow = fk(shoulder, lerp(92, 76, t), UPPER_ARM);
    const rHand = fk(rElbow, lerp(108, 35, t), FORE_ARM * 0.85);
    const lElbow = fk(shoulder, lerp(86, 102, t), UPPER_ARM);
    const lHand = fk(lElbow, lerp(98, 52, t), FORE_ARM * 0.85);

    return {
      pelvis, midSpine, shoulder, head,
      lKnee, lFoot, lToe, rKnee, rFoot, rToe,
      lElbow, lHand, rElbow, rHand
    };
  },

  // 19. EQUILIBRIO A UNA PIERNA CON ALCANCE (propiocepción de tobillo y rodilla)
  single_leg_reach(u) {
    const fwd = u < 0.5 ? ease(u < 0.25 ? u * 4 : (0.5 - u) * 4) : 0;
    const bwd = u >= 0.5 ? ease(u < 0.75 ? (u - 0.5) * 4 : (1 - u) * 4) : 0;
    const bend = Math.max(fwd, bwd);

    const rFoot = { x: 79, y: FLOOR_Y - 0.5 };
    const rToe = { x: 86, y: FLOOR_Y - 0.5 };

    const pelvis = { x: lerp(79, 77, bend), y: lerp(53.5, 57.5, bend) };
    const rKnee = solveIK(pelvis, rFoot, THIGH, SHIN, -1);

    const torsoAng = -90 - fwd * 8 + bwd * 20;
    const midSpine = fk(pelvis, torsoAng, 10.5);
    const shoulder = fk(pelvis, torsoAng, 20.5);
    const head = fk(shoulder, torsoAng + 4, 7.8);

    const lKneeNeutral = fk(pelvis, 84, THIGH);
    const lFootNeutral = fk(lKneeNeutral, 96, SHIN);
    const lKneeFwd = fk(pelvis, 44, THIGH);
    const lFootFwd = fk(lKneeFwd, 50, SHIN);
    const lKneeBwd = fk(pelvis, 134, THIGH);
    const lFootBwd = fk(lKneeBwd, 140, SHIN);

    const lKnee = u < 0.5 ? pLerp(lKneeNeutral, lKneeFwd, fwd) : pLerp(lKneeNeutral, lKneeBwd, bwd);
    const lFoot = u < 0.5 ? pLerp(lFootNeutral, lFootFwd, fwd) : pLerp(lFootNeutral, lFootBwd, bwd);
    const lToe = fk(lFoot, 18, 6.2);

    const rArmAng = lerp(82, 42, bend);
    const lArmAng = lerp(96, 128, bend);
    const rElbow = fk(shoulder, rArmAng, UPPER_ARM);
    const rHand = fk(rElbow, rArmAng - 20, FORE_ARM);
    const lElbow = fk(shoulder, lArmAng, UPPER_ARM);
    const lHand = fk(lElbow, lArmAng + 15, FORE_ARM);

    return {
      pelvis, midSpine, shoulder, head,
      lKnee, lFoot, lToe, rKnee, rFoot, rToe,
      lElbow, lHand, rElbow, rHand
    };
  },

  // 20. ZANCADA LATERAL CONTROLADA (vista frontal para cortes y aductores)
  lateral_lunge(u) {
    const toR = u < 0.5 ? ease(u < 0.25 ? u * 4 : (0.5 - u) * 4) : 0;
    const toL = u >= 0.5 ? ease(u < 0.75 ? (u - 0.5) * 4 : (1 - u) * 4) : 0;
    const side = toR - toL;
    const depth = Math.abs(side);

    const lFoot = { x: 63, y: FLOOR_Y - 0.6 };
    const lToe = { x: 59, y: FLOOR_Y - 0.3 };
    const rFoot = { x: 97, y: FLOOR_Y - 0.6 };
    const rToe = { x: 101, y: FLOOR_Y - 0.3 };

    const pelvis = { x: 80 + side * 10, y: 56 + depth * 11 };
    const lHip = { x: pelvis.x - 4, y: pelvis.y };
    const rHip = { x: pelvis.x + 4, y: pelvis.y };

    const lKnee = solveIK(lHip, lFoot, THIGH, SHIN, toL > 0 ? 0.25 : 0.12);
    const rKnee = solveIK(rHip, rFoot, THIGH, SHIN, toR > 0 ? -0.25 : -0.12);

    const midSpine = { x: pelvis.x + side * 1.4, y: pelvis.y - 9.5 };
    const shoulder = { x: pelvis.x + side * 2.2, y: pelvis.y - 18.5 };
    const head = { x: shoulder.x + side * 0.4, y: shoulder.y - 7.8 };

    const lSh = { x: shoulder.x - 5.2, y: shoulder.y };
    const rSh = { x: shoulder.x + 5.2, y: shoulder.y };

    const lElbow = { x: lSh.x - 2.5 + depth * 2.5, y: lSh.y + 9 - depth * 2 };
    const lHand = { x: shoulder.x - 1, y: shoulder.y + 11 - depth * 4 };
    const rElbow = { x: rSh.x + 2.5 - depth * 2.5, y: rSh.y + 9 - depth * 2 };
    const rHand = { x: shoulder.x + 1, y: shoulder.y + 11 - depth * 4 };

    return {
      pelvis, midSpine, shoulder, head, lSh, rSh, lHip, rHip,
      lKnee, lFoot, lToe, rKnee, rFoot, rToe,
      lElbow, lHand, rElbow, rHand
    };
  },

  // 21. BAJADA EXCÉNTRICA DE RODILLA (frenado lento 3s + subida firme)
  eccentric_step_down(u) {
    const ecc = u < 0.65
      ? ease(u / 0.65)
      : u < 0.75
        ? 1
        : ease(1 - (u - 0.75) / 0.25);

    const rFoot = { x: 75, y: FLOOR_Y - 0.5 };
    const rToe = { x: 82, y: FLOOR_Y - 0.5 };

    const pelvis = { x: lerp(75, 67, ecc), y: lerp(53, 64.5, ecc) };
    const rKnee = solveIK(pelvis, rFoot, THIGH, SHIN, -1);

    const torsoAng = lerp(-88, -68, ecc);
    const midSpine = fk(pelvis, torsoAng, 10.5);
    const shoulder = fk(pelvis, torsoAng, 20.5);
    const head = fk(shoulder, torsoAng + 6, 7.8);

    const lFoot = pLerp({ x: 82, y: 79 }, { x: 91, y: FLOOR_Y - 0.5 }, ecc);
    const lToe = pLerp({ x: 85.5, y: 74.8 }, { x: 94.5, y: FLOOR_Y - 4.8 }, ecc);
    const lKnee = solveIK(pelvis, lFoot, THIGH, SHIN, -1);

    const armAng = lerp(82, -5, ecc);
    const rElbow = fk(shoulder, armAng, UPPER_ARM);
    const rHand = fk(rElbow, armAng - 6, FORE_ARM);
    const lElbow = fk(shoulder, armAng - 5, UPPER_ARM);
    const lHand = fk(lElbow, armAng - 10, FORE_ARM);

    return {
      pelvis, midSpine, shoulder, head,
      lKnee, lFoot, lToe, rKnee, rFoot, rToe,
      lElbow, lHand, rElbow, rHand
    };
  }
};

export function computePose(exerciseId, u) {
  const w = ease(u < 0.5 ? u * 2 : (1 - u) * 2);
  const wp = u < 0.4 ? ease(u / 0.4) : u < 0.55 ? 1 : u < 0.95 ? ease(1 - (u - 0.55) / 0.4) : 0;
  const builder = POSE_BUILDERS[exerciseId] || POSE_BUILDERS.shoulder_thoracic;
  return builder(u, w, wp);
}