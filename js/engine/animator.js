import { computePose, FLOOR_Y, pLerp } from '../data/poses.js';

/**
 * Destello orgánico en la zona muscular o articular principal.
 */
function drawMuscleHighlight(ctx, pose, zone, sx, sy, pulse) {
  const pts = [];
  switch (zone) {
    case 'shoulders_upperback':
      pts.push(pose.shoulder, pose.midSpine);
      break;
    case 'hips':
    case 'glutes':
      pts.push(pose.pelvis);
      break;
    case 'spine':
      pts.push(pose.midSpine, pose.pelvis);
      break;
    case 'thighs_glutes':
      pts.push(pose.pelvis, pLerp(pose.pelvis, pose.rKnee, 0.55));
      break;
    case 'chest_arms':
      pts.push(pose.shoulder, pLerp(pose.shoulder, pose.rElbow, 0.55));
      break;
    case 'core':
      pts.push(pose.midSpine, pLerp(pose.pelvis, pose.midSpine, 0.5));
      break;
    case 'core_spine':
      pts.push(pose.midSpine, pose.pelvis);
      break;
    case 'core_shoulders':
      pts.push(pose.midSpine, pose.shoulder);
      break;
    case 'back_glutes':
      pts.push(pose.midSpine, pose.pelvis);
      break;
    case 'hips_hamstrings':
      pts.push(pose.pelvis, pLerp(pose.pelvis, pose.rKnee, 0.6));
      break;
    case 'full_stretch':
      pts.push(pose.midSpine, pose.shoulder, pLerp(pose.pelvis, pose.rKnee, 0.5));
      break;
    case 'knees':
      pts.push(pose.rKnee, pose.lKnee);
      break;
    case 'ankles':
      pts.push(pose.rFoot, pose.lFoot);
      break;
    case 'knees_ankles':
      pts.push(pose.rKnee, pose.rFoot);
      break;
    default:
      pts.push(pose.midSpine);
  }

  const radius = (9 + pulse * 3.5) * sx;
  pts.forEach(p => {
    const cx = p.x * sx;
    const cy = p.y * sy;
    const grad = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);
    grad.addColorStop(0, `rgba(212, 107, 67, ${0.42 + pulse * 0.2})`);
    grad.addColorStop(0.55, `rgba(212, 107, 67, ${0.18 + pulse * 0.1})`);
    grad.addColorStop(1, 'rgba(212, 107, 67, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

export const KinematicEngine = {
  render(canvas, exercise, u, isDark) {
    if (!canvas || !exercise) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, w, h);

    const scale = Math.min(w / 160, h / 100);
    const offsetX = (w - 160 * scale) / 2;
    const offsetY = (h - 100 * scale) / 2;
    ctx.translate(offsetX, offsetY);

    const sx = scale;
    const sy = scale;
    const pose = computePose(exercise.id, u);
    const pulse = 0.5 + 0.5 * Math.sin(u * Math.PI * 2);

    const colors = isDark
      ? {
          floor: 'rgba(255,255,255,0.08)',
          mat: '#245B47',
          matHighlight: '#3D8B6E',
          shadow: 'rgba(0,0,0,0.35)',
          limbBack: '#5C6E68',
          limbFront: '#E7EFEA',
          torso: '#B7D8C9',
          joint: '#3D8B6E',
          accent: '#E3845E',
          head: '#F2F5F3'
        }
      : {
          floor: 'rgba(28,25,23,0.08)',
          mat: '#3D8B6E',
          matHighlight: '#56A687',
          shadow: 'rgba(28,25,23,0.10)',
          limbBack: '#94A39D',
          limbFront: '#2A3531',
          torso: '#2E7259',
          joint: '#3D8B6E',
          accent: '#D46B43',
          head: '#2A3531'
        };

    // 1. Suelo y colchoneta
    ctx.strokeStyle = colors.floor;
    ctx.lineWidth = 1.2 * sx;
    ctx.beginPath();
    ctx.moveTo(12 * sx, (FLOOR_Y + 2) * sy);
    ctx.lineTo(148 * sx, (FLOOR_Y + 2) * sy);
    ctx.stroke();

    ctx.fillStyle = colors.mat;
    ctx.beginPath();
    ctx.roundRect(28 * sx, (FLOOR_Y - 0.5) * sy, 104 * sx, 3.2 * sy, 1.6 * sx);
    ctx.fill();

    ctx.fillStyle = colors.matHighlight;
    ctx.beginPath();
    ctx.roundRect(30 * sx, (FLOOR_Y - 0.5) * sy, 100 * sx, 1.1 * sy, 0.8 * sx);
    ctx.fill();

    const centerX = (pose.pelvis.x + pose.shoulder.x) / 2;
    ctx.fillStyle = colors.shadow;
    ctx.beginPath();
    ctx.ellipse(centerX * sx, (FLOOR_Y + 0.4) * sy, 24 * sx, 2.2 * sy, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Línea guía opcional (ej. Plancha)
    if (pose.guideLine) {
      ctx.save();
      ctx.setLineDash([3 * sx, 3 * sx]);
      ctx.strokeStyle = colors.accent;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.1 * sx;
      ctx.beginPath();
      ctx.moveTo(pose.guideLine[0].x * sx, (pose.guideLine[0].y - 5) * sy);
      ctx.lineTo(pose.guideLine[1].x * sx, (pose.guideLine[1].y - 5) * sy);
      ctx.stroke();
      ctx.restore();
    }

    const drawLimb = (p1, p2, p3, color, width1, width2, toe = null) => {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = width1 * sx;
      ctx.beginPath();
      ctx.moveTo(p1.x * sx, p1.y * sy);
      ctx.lineTo(p2.x * sx, p2.y * sy);
      ctx.stroke();

      ctx.lineWidth = width2 * sx;
      ctx.beginPath();
      ctx.moveTo(p2.x * sx, p2.y * sy);
      ctx.lineTo(p3.x * sx, p3.y * sy);
      ctx.stroke();

      if (toe) {
        ctx.lineWidth = width2 * 0.85 * sx;
        ctx.beginPath();
        ctx.moveTo(p3.x * sx, p3.y * sy);
        ctx.lineTo(toe.x * sx, toe.y * sy);
        ctx.stroke();
      } else {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p3.x * sx, p3.y * sy, width2 * 0.52 * sx, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const lHip = pose.lHip || pose.pelvis;
    const rHip = pose.rHip || pose.pelvis;
    const lSh = pose.lSh || pose.shoulder;
    const rSh = pose.rSh || pose.shoulder;

    // 3. Extremidades lejanas
    drawLimb(lHip, pose.lKnee, pose.lFoot, colors.limbBack, 4.3, 3.5, pose.lToe);
    drawLimb(lSh, pose.lElbow, pose.lHand, colors.limbBack, 3.4, 2.8);

    // 4. Destello de zona muscular o articular principal
    drawMuscleHighlight(ctx, pose, exercise.highlightZone, sx, sy, pulse);

    // 5. Torso curvo
    ctx.lineCap = 'round';
    ctx.strokeStyle = colors.torso;
    ctx.lineWidth = 6.2 * sx;
    ctx.beginPath();
    ctx.moveTo(pose.pelvis.x * sx, pose.pelvis.y * sy);
    ctx.quadraticCurveTo(pose.midSpine.x * sx, pose.midSpine.y * sy, pose.shoulder.x * sx, pose.shoulder.y * sy);
    ctx.stroke();

    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.4 * sx;
    ctx.beginPath();
    ctx.moveTo(pose.pelvis.x * sx, pose.pelvis.y * sy);
    ctx.quadraticCurveTo(pose.midSpine.x * sx, pose.midSpine.y * sy, pose.shoulder.x * sx, pose.shoulder.y * sy);
    ctx.stroke();

    // 6. Cuello y cabeza
    ctx.strokeStyle = colors.limbFront;
    ctx.lineWidth = 2.8 * sx;
    ctx.beginPath();
    ctx.moveTo(pose.shoulder.x * sx, pose.shoulder.y * sy);
    ctx.lineTo(pose.head.x * sx, pose.head.y * sy);
    ctx.stroke();

    ctx.fillStyle = colors.head;
    ctx.beginPath();
    ctx.arc(pose.head.x * sx, pose.head.y * sy, 4.4 * sx, 0, Math.PI * 2);
    ctx.fill();

    // 7. Extremidades cercanas
    drawLimb(rHip, pose.rKnee, pose.rFoot, colors.limbFront, 4.6, 3.8, pose.rToe);
    drawLimb(rSh, pose.rElbow, pose.rHand, colors.limbFront, 3.7, 3.1);

    // 8. Puntos articulares (incluye tobillo cuando la pose articula pie)
    const joints = [pose.shoulder, pose.pelvis, pose.rKnee, pose.rElbow];
    if (pose.rToe) joints.push(pose.rFoot);
    joints.forEach((j, idx) => {
      const isPrimary = idx < 2 || idx === 4;
      ctx.fillStyle = isPrimary ? colors.accent : colors.joint;
      ctx.beginPath();
      ctx.arc(j.x * sx, j.y * sy, (isPrimary ? 1.8 : 1.3) * sx, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  },

  getBreathState(exercise, u) {
    if (!exercise || !exercise.breath) return { label: 'Respira suave', isInhale: true };
    const [inStart, inEnd] = exercise.breath.inhale;
    const isInhale = u >= inStart && u < inEnd;
    return {
      label: isInhale ? 'Inhala profundo' : 'Exhala lento',
      isInhale
    };
  }
};