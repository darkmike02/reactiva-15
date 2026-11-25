import { EXERCISES } from './exercises.js';

export const PHASES = [
  {
    id: 1,
    name: 'Fase 1',
    subtitle: 'Semanas 1-2',
    title: 'Despertar y Movilidad',
    desc: 'Ejercicios suaves y regresiones amigables para activar articulaciones sin dolor.',
    tempoHint: 'Ritmo cómodo y pausado · Descansa unos segundos si lo necesitas'
  },
  {
    id: 2,
    name: 'Fase 2',
    subtitle: 'Semanas 3-4',
    title: 'Control y Estabilidad',
    desc: 'Mayor rango de movimiento, estabilidad de core y fuerza base progresiva.',
    tempoHint: 'Controla cada repetición · Pausa breve en el punto clave'
  },
  {
    id: 3,
    name: 'Fase 3',
    subtitle: 'Semanas 5-6',
    title: 'Fuerza Funcional y Elasticidad',
    desc: 'Transición a flexiones completas, zancadas fluidas y movilidad dinámica.',
    tempoHint: 'Movimiento fluido y firme · Mantén buena postura hasta el final'
  },
  {
    id: 4,
    name: 'Fase 4',
    subtitle: 'Semana 7+',
    title: 'Flujo Completo de 15 Min',
    desc: 'Circuito equilibrado de fuerza sostenida y flexibilidad integral cada mañana.',
    tempoHint: 'Flujo continuo de 15 min · Respiración profunda y energía sostenida'
  }
];

export const FOCUSES = [
  {
    id: 'A',
    label: 'Día A',
    title: 'Cuerpo Completo y Postura',
    short: 'Cuerpo Completo',
    desc: 'Despierta todo el cuerpo con énfasis en espalda sana, piernas, tobillos y empuje suave.'
  },
  {
    id: 'B',
    label: 'Día B',
    title: 'Piernas, Rodillas y Tobillos',
    short: 'Piernas y Tobillos',
    desc: 'Fortalece piernas, glúteos y estabilidad de rodilla y tobillo para cambios de ritmo y fútbol.'
  },
  {
    id: 'C',
    label: 'Día C',
    title: 'Tren Superior y Core',
    short: 'Superior y Core',
    desc: 'Mejora la fuerza de brazos, hombros y faja abdominal sin sobrecargar el cuello.'
  },
  {
    id: 'D',
    label: 'Día D',
    title: 'Movilidad y Recuperación Activa',
    short: 'Movilidad Activa',
    desc: 'Flujo restaurador con propiocepción y descarga articular para sentirte ligero y estable.'
  }
];

/**
 * Genera la rutina EXACTA de 15:00 minutos (900 segundos) para cualquier Fase (1-4) y Enfoque (A-D).
 *  - Calentamiento: 3 × (45s + 15s) = 180s (3 min)
 *  - Fuerza y Control: 9 × (45s + 15s) = 540s (9 min)
 *  - Flexibilidad: 2 × (45s + 15s) + 1 × 60s = 180s (3 min)
 */
export function buildDailyRoutine(phaseId, focusId) {
  const warmupMap = {
    A: ['shoulder_thoracic', 'ankle_dorsiflexion', 'cat_cow'],
    B: ['ankle_dorsiflexion', 'march_hip_open', 'cat_cow'],
    C: ['shoulder_thoracic', 'cat_cow', 'march_hip_open'],
    D: ['cat_cow', 'ankle_dorsiflexion', 'shoulder_thoracic']
  };

  const cooldownMap = {
    A: phaseId >= 2 ? ['hip_hamstring_stretch', 'downdog_cobra', 'child_pose'] : ['hip_hamstring_stretch', 'cat_cow', 'child_pose'],
    B: ['hip_hamstring_stretch', 'ankle_dorsiflexion', 'child_pose'],
    C: phaseId >= 2 ? ['downdog_cobra', 'shoulder_thoracic', 'child_pose'] : ['shoulder_thoracic', 'cat_cow', 'child_pose'],
    D: phaseId >= 2 ? ['downdog_cobra', 'hip_hamstring_stretch', 'child_pose'] : ['hip_hamstring_stretch', 'cat_cow', 'child_pose']
  };

  const strengthMatrix = {
    1: {
      A: ['half_squat', 'knee_pushup', 'glute_bridge', 'single_leg_reach', 'calf_raise', 'knee_pushup', 'bird_dog', 'plank_short', 'half_squat'],
      B: ['half_squat', 'calf_raise', 'glute_bridge', 'single_leg_reach', 'half_squat', 'calf_raise', 'bird_dog', 'glute_bridge', 'plank_short'],
      C: ['knee_pushup', 'bird_dog', 'plank_short', 'calf_raise', 'knee_pushup', 'bird_dog', 'plank_short', 'glute_bridge', 'knee_pushup'],
      D: ['cat_cow', 'single_leg_reach', 'glute_bridge', 'half_squat', 'calf_raise', 'plank_short', 'bird_dog', 'single_leg_reach', 'hip_hamstring_stretch']
    },
    2: {
      A: ['controlled_squat', 'knee_pushup', 'glute_bridge', 'single_leg_reach', 'lateral_lunge', 'knee_pushup', 'calf_raise', 'plank_short', 'superman'],
      B: ['controlled_squat', 'calf_raise', 'lateral_lunge', 'glute_bridge', 'eccentric_step_down', 'single_leg_reach', 'gentle_lunge', 'calf_raise', 'plank_short'],
      C: ['knee_pushup', 'plank_short', 'superman', 'bird_dog', 'knee_pushup', 'calf_raise', 'plank_short', 'superman', 'bird_dog'],
      D: ['downdog_cobra', 'single_leg_reach', 'glute_bridge', 'lateral_lunge', 'superman', 'ankle_dorsiflexion', 'plank_short', 'eccentric_step_down', 'bird_dog']
    },
    3: {
      A: ['controlled_squat', 'full_pushup', 'lateral_lunge', 'plank_shoulder_tap', 'eccentric_step_down', 'calf_raise', 'full_pushup', 'superman', 'plank_shoulder_tap'],
      B: ['controlled_squat', 'lateral_lunge', 'eccentric_step_down', 'calf_raise', 'gentle_lunge', 'glute_bridge', 'single_leg_reach', 'eccentric_step_down', 'plank_short'],
      C: ['full_pushup', 'plank_shoulder_tap', 'superman', 'single_leg_reach', 'full_pushup', 'plank_shoulder_tap', 'calf_raise', 'plank_short', 'knee_pushup'],
      D: ['downdog_cobra', 'lateral_lunge', 'single_leg_reach', 'superman', 'ankle_dorsiflexion', 'plank_shoulder_tap', 'eccentric_step_down', 'downdog_cobra', 'calf_raise']
    },
    4: {
      A: ['controlled_squat', 'full_pushup', 'lateral_lunge', 'plank_shoulder_tap', 'eccentric_step_down', 'downdog_cobra', 'full_pushup', 'calf_raise', 'plank_shoulder_tap'],
      B: ['controlled_squat', 'lateral_lunge', 'eccentric_step_down', 'calf_raise', 'gentle_lunge', 'single_leg_reach', 'superman', 'eccentric_step_down', 'glute_bridge'],
      C: ['full_pushup', 'plank_shoulder_tap', 'superman', 'downdog_cobra', 'full_pushup', 'plank_short', 'calf_raise', 'single_leg_reach', 'plank_shoulder_tap'],
      D: ['downdog_cobra', 'lateral_lunge', 'single_leg_reach', 'eccentric_step_down', 'superman', 'plank_shoulder_tap', 'hip_hamstring_stretch', 'calf_raise', 'downdog_cobra']
    }
  };

  const warmupIds = warmupMap[focusId] || warmupMap.A;
  const strengthIds = (strengthMatrix[phaseId] && strengthMatrix[phaseId][focusId]) || strengthMatrix[1].A;
  const cooldownIds = cooldownMap[focusId] || cooldownMap.A;
  const phaseInfo = PHASES.find(p => p.id === phaseId) || PHASES[0];

  const blocks = [
    {
      id: 'warmup',
      title: 'Calentamiento y Movilidad',
      durationMin: 3,
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
      accentColor: 'amber',
      items: warmupIds.map((exId) => ({
        exercise: EXERCISES[exId],
        workSec: 45,
        restSec: 15,
        cue: 'Movimientos amplios y suaves, sincronizados con tu respiración.'
      }))
    },
    {
      id: 'strength',
      title: 'Fuerza y Control con Peso Corporal',
      durationMin: 9,
      badgeClass: 'bg-sage-100 text-sage-800 dark:bg-sage-500/20 dark:text-sage-300',
      accentColor: 'sage',
      items: strengthIds.map((exId, idx) => ({
        exercise: EXERCISES[exId],
        workSec: 45,
        restSec: 15,
        cue: phaseId === 1
          ? 'Prioriza técnica limpia sobre velocidad; toma aire si lo necesitas.'
          : phaseId === 2
            ? 'Controla la bajada en 2 segundos y mantén el abdomen firme.'
            : idx % 2 === 0
              ? 'Ritmo constante y firme cuidando la alineación articular.'
              : phaseInfo.tempoHint
      }))
    },
    {
      id: 'cooldown',
      title: 'Flexibilidad y Enfriamiento',
      durationMin: 3,
      badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300',
      accentColor: 'sky',
      items: cooldownIds.map((exId, idx) => ({
        exercise: EXERCISES[exId],
        workSec: idx === cooldownIds.length - 1 ? 60 : 45,
        restSec: idx === cooldownIds.length - 1 ? 0 : 15,
        cue: idx === cooldownIds.length - 1
          ? 'Último minuto: respira lento y suelta toda la tensión para iniciar el día renovado.'
          : 'Estira sin dolor agudo, exhalando profundo en cada postura.'
      }))
    }
  ];

  const flatSteps = [];
  let exerciseNumber = 0;
  blocks.forEach(block => {
    block.items.forEach(item => {
      exerciseNumber++;
      flatSteps.push({
        type: 'work',
        blockTitle: block.title,
        exerciseIndex: exerciseNumber,
        totalExercises: 15,
        exercise: item.exercise,
        duration: item.workSec,
        cue: item.cue
      });
      if (item.restSec > 0) {
        flatSteps.push({
          type: 'rest',
          blockTitle: block.title,
          exerciseIndex: exerciseNumber,
          totalExercises: 15,
          duration: item.restSec
        });
      }
    });
  });

  for (let i = 0; i < flatSteps.length; i++) {
    if (flatSteps[i].type === 'rest') {
      const nextWork = flatSteps[i + 1];
      flatSteps[i].exercise = nextWork ? nextWork.exercise : flatSteps[i - 1].exercise;
      flatSteps[i].cue = nextWork ? nextWork.cue : '';
      flatSteps[i].nextExerciseIndex = nextWork ? nextWork.exerciseIndex : 15;
      flatSteps[i].nextBlockTitle = nextWork ? nextWork.blockTitle : flatSteps[i].blockTitle;
    }
  }

  return { blocks, flatSteps, totalSeconds: 900 };
}