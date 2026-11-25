// Catálogo completo de ejercicios articulados (16 ejercicios base)
export const EXERCISES = {
  shoulder_thoracic: {
    id: 'shoulder_thoracic',
    name: 'Movilidad de Hombros y Rotación Torácica',
    category: 'movilidad',
    minPhase: 1,
    muscleLabel: 'Hombros y Espalda Alta',
    highlightZone: 'shoulders_upperback',
    cycleSec: 4.2,
    breath: { inhale: [0, 0.5], exhale: [0.5, 1] },
    goal: 'Despierta la articulación del hombro y abre el pecho tras horas de sueño o escritorio.',
    tips: [
      'Mantén los pies al ancho de tus caderas y rodillas ligeramente suaves.',
      'Eleva los brazos dibujando un arco amplio mientras inhalas profundo.',
      'Gira suavemente la parte alta del torso sin forzar la zona lumbar.'
    ],
    mistake: 'Encoger los hombros hacia las orejas o mover los brazos con demasiada prisa.',
    easier: 'Haz círculos más pequeños con los codos flexionados si sientes rigidez en hombros.'
  },
  march_hip_open: {
    id: 'march_hip_open',
    name: 'Marcha Activa y Apertura de Cadera',
    category: 'movilidad',
    minPhase: 1,
    muscleLabel: 'Cadera y Flexores',
    highlightZone: 'hips',
    cycleSec: 3.4,
    breath: { inhale: [0, 0.5], exhale: [0.5, 1] },
    goal: 'Sube suavemente la temperatura corporal y lubrica caderas y rodillas sin impacto.',
    tips: [
      'Eleva una rodilla de forma controlada hasta la altura de tu ombligo.',
      'Acompaña el movimiento con el brazo contrario manteniendo el abdomen firme.',
      'Apoya el pie con suavidad, evitando golpear el suelo.'
    ],
    mistake: 'Inclinar la espalda hacia atrás para intentar subir más la rodilla.',
    easier: 'Eleva las rodillas solo hasta media altura o apóyate ligeramente en una pared.'
  },
  cat_cow: {
    id: 'cat_cow',
    name: 'Gato-Vaca (Movilidad de Columna)',
    category: 'movilidad',
    minPhase: 1,
    muscleLabel: 'Columna y Espalda',
    highlightZone: 'spine',
    cycleSec: 4.8,
    breath: { inhale: [0, 0.5], exhale: [0.5, 1] },
    goal: 'Alterna flexión y extensión vertebral para devolver elasticidad a toda tu espalda.',
    tips: [
      'Coloca manos bajo los hombros y rodillas directamente bajo las caderas.',
      'Inhala bajando el abdomen y elevando pecho y mirada suavemente (Vaca).',
      'Exhala empujando el suelo, redondeando la espalda hacia el techo (Gato).'
    ],
    mistake: 'Forzar el cuello mirando demasiado arriba o doblar los codos al moverte.',
    easier: 'Coloca una toalla doblada bajo las rodillas o apoya los puños si molestan las muñecas.'
  },
  glute_bridge: {
    id: 'glute_bridge',
    name: 'Puente de Glúteos Controlado',
    category: 'fuerza',
    minPhase: 1,
    muscleLabel: 'Glúteos e Isquiotibiales',
    highlightZone: 'glutes',
    cycleSec: 4.0,
    breath: { inhale: [0.55, 1], exhale: [0, 0.55] },
    goal: 'Activa y fortalece los glúteos protegiendo la zona lumbar del sedentarismo.',
    tips: [
      'Acuéstate boca arriba con talones cerca de glúteos y pies paralelos.',
      'Exhala empujando con los talones para subir la cadera hasta alinear rodilla-hombro.',
      'Aprieta glúteos 1 segundo arriba y baja vértebra por vértebra con control.'
    ],
    mistake: 'Arquear en exceso la espalda baja subiendo la cadera demasiado alto.',
    easier: 'Sube solo a media altura y haz una pausa de 2 segundos abajo entre repeticiones.'
  },
  half_squat: {
    id: 'half_squat',
    name: 'Media Sentadilla Controlada',
    category: 'fuerza',
    minPhase: 1,
    muscleLabel: 'Cuádriceps y Glúteos',
    highlightZone: 'thighs_glutes',
    cycleSec: 3.8,
    breath: { inhale: [0, 0.5], exhale: [0.5, 1] },
    goal: 'Recupera la fuerza base de piernas y el patrón natural de sentarse sin sobrecargar rodillas.',
    tips: [
      'Pies al ancho de hombros, puntas ligeramente hacia afuera y pecho erguido.',
      'Lleva la cadera hacia atrás como buscando una silla mientras extiendes brazos al frente.',
      'Baja hasta la mitad del recorrido y sube empujando el suelo con todo el pie.'
    ],
    mistake: 'Dejar que las rodillas se junten hacia adentro o despegar los talones.',
    easier: 'Coloca una silla firme detrás, toca suavemente el asiento y vuelve a levantarte.'
  },
  controlled_squat: {
    id: 'controlled_squat',
    name: 'Sentadilla Completa Controlada',
    category: 'fuerza',
    minPhase: 2,
    muscleLabel: 'Cuádriceps y Glúteos',
    highlightZone: 'thighs_glutes',
    cycleSec: 4.2,
    breath: { inhale: [0, 0.55], exhale: [0.55, 1] },
    goal: 'Fortalece piernas, cadera y core con rango completo y tempo controlado.',
    tips: [
      'Inhala descendiendo en 2-3 segundos con la espalda neutra y mirada al frente.',
      'Baja hasta que tus muslos queden paralelos al suelo manteniendo talones pegados.',
      'Exhala subiendo con firmeza y activando los glúteos al terminar.'
    ],
    mistake: 'Redondear la espalda baja al llegar abajo o inclinarte demasiado hacia adelante.',
    easier: 'Reduce ligeramente la profundidad (media sentadilla) y enfócate en la postura.'
  },
  knee_pushup: {
    id: 'knee_pushup',
    name: 'Flexiones de Rodillas',
    category: 'fuerza',
    minPhase: 1,
    muscleLabel: 'Pecho, Hombros y Tríceps',
    highlightZone: 'chest_arms',
    cycleSec: 3.8,
    breath: { inhale: [0, 0.5], exhale: [0.5, 1] },
    goal: 'Construye fuerza real de empuje en tren superior y estabilidad del torso de forma accesible.',
    tips: [
      'Forma una línea recta desde tus rodillas hasta la cabeza, con el abdomen activo.',
      'Coloca las manos un poco más anchas que los hombros y dirige los codos a 45° hacia atrás.',
      'Baja el pecho de forma controlada y empuja el suelo exhalando.'
    ],
    mistake: 'Dejar la cadera muy atrás (en forma de mesa) o hundir la zona lumbar.',
    easier: 'Hazlas inclinadas apoyando las manos en una pared firme o en una mesa estable.'
  },
  full_pushup: {
    id: 'full_pushup',
    name: 'Flexiones Completas',
    category: 'fuerza',
    minPhase: 3,
    muscleLabel: 'Pecho, Tríceps y Core',
    highlightZone: 'chest_arms',
    cycleSec: 3.8,
    breath: { inhale: [0, 0.5], exhale: [0.5, 1] },
    goal: 'Fuerza integral de tren superior combinada con tensión completa de plancha.',
    tips: [
      'Mantén todo el cuerpo como una tabla firme desde talones hasta coronilla.',
      'Inhala bajando el pecho cerca del suelo con codos en diagonal (no en T).',
      'Exhala empujando fuerte el suelo sin perder la alineación de la cadera.'
    ],
    mistake: 'Bajar primero la cadera o la cabeza en lugar de mover todo el torso en bloque.',
    easier: 'Baja lento en versión completa y apoya las rodillas para subir (flexión mixta).'
  },
  bird_dog: {
    id: 'bird_dog',
    name: 'Bird-Dog (Estabilidad Cruzada)',
    category: 'core',
    minPhase: 1,
    muscleLabel: 'Core y Espalda Media',
    highlightZone: 'core_spine',
    cycleSec: 5.2,
    breath: { inhale: [0.4, 0.55], exhale: [0, 0.4] },
    goal: 'Entrena la estabilidad profunda de la columna y el equilibrio neuromuscular sin dolor lumbar.',
    tips: [
      'Desde cuatro apoyos, alarga el brazo derecho y la pierna izquierda al mismo tiempo.',
      'Imagina que sostienes un vaso de agua sobre la espalda baja sin derramarlo.',
      'Vuelve despacio al centro y alterna con el lado contrario.'
    ],
    mistake: 'Subir la pierna demasiado alto arqueando la cintura o girar la cadera.',
    easier: 'Extiende solo una pierna a la vez manteniendo ambas manos firmes en el suelo.'
  },
  plank_short: {
    id: 'plank_short',
    name: 'Plancha de Antebrazos (Estabilidad)',
    category: 'core',
    minPhase: 1,
    muscleLabel: 'Abdomen y Core Profundo',
    highlightZone: 'core',
    cycleSec: 4.0,
    breath: { inhale: [0, 0.5], exhale: [0.5, 1] },
    goal: 'Fortalece la faja abdominal y los estabilizadores de hombros con respiración fluida.',
    tips: [
      'Apoya codos justo debajo de los hombros y empuja suavemente el suelo.',
      'Aprieta glúteos y abdomen para mantener una línea recta sin hundir la cadera.',
      'Respira de manera constante y tranquila; nunca aguantes el aire.'
    ],
    mistake: 'Dejar caer la cadera hacia la colchoneta o elevar demasiado los glúteos.',
    easier: 'Apoya las rodillas manteniendo el torso recto y el abdomen firme, o descansa 5s cada 15s.'
  },
  plank_shoulder_tap: {
    id: 'plank_shoulder_tap',
    name: 'Plancha con Toque de Hombros',
    category: 'core',
    minPhase: 3,
    muscleLabel: 'Core Antirrotación y Hombros',
    highlightZone: 'core_shoulders',
    cycleSec: 4.0,
    breath: { inhale: [0.45, 0.6], exhale: [0, 0.45] },
    goal: 'Desafía la estabilidad del core evitando que la cadera se balancee al quitar un apoyo.',
    tips: [
      'Desde plancha alta sobre manos, separa ligeramente los pies para mayor base.',
      'Levanta una mano despacio para tocar el hombro opuesto y vuelve con control.',
      'Mantén la cadera completamente quieta mirando hacia el suelo.'
    ],
    mistake: 'Balancear la cadera de lado a lado con cada toque o acelerar demasiado.',
    easier: 'Realiza los toques de hombro con las rodillas apoyadas en el suelo.'
  },
  gentle_lunge: {
    id: 'gentle_lunge',
    name: 'Zancada Controlada',
    category: 'fuerza',
    minPhase: 2,
    muscleLabel: 'Piernas, Glúteos y Equilibrio',
    highlightZone: 'thighs_glutes',
    cycleSec: 4.4,
    breath: { inhale: [0, 0.5], exhale: [0.5, 1] },
    goal: 'Mejora la fuerza unilateral de piernas, estabilidad de tobillo y movilidad de cadera.',
    tips: [
      'Da un paso largo hacia adelante manteniendo el torso erguido y mirada fija.',
      'Desciende verticalmente acercando la rodilla trasera suavemente hacia el suelo.',
      'Empuja con el pie delantero para regresar de pie y alterna de pierna.'
    ],
    mistake: 'Dar un paso demasiado corto que levante el talón delantero o tambalearse.',
    easier: 'Haz zancada estática sin cambiar de pie en cada repetición y apoya una mano en una silla.'
  },
  superman: {
    id: 'superman',
    name: 'Superman Dorsal (Cadena Posterior)',
    category: 'core',
    minPhase: 2,
    muscleLabel: 'Espalda Baja y Glúteos',
    highlightZone: 'back_glutes',
    cycleSec: 4.4,
    breath: { inhale: [0.55, 1], exhale: [0, 0.55] },
    goal: 'Fortalece toda la cadena posterior para contrarrestar la postura encorvada.',
    tips: [
      'Túmbate boca abajo con brazos al frente y mirada hacia la colchoneta (cuello largo).',
      'Exhala elevando suavemente pecho, brazos y piernas unos centímetros del suelo.',
      'Sostén 1 segundo sintiendo la espalda y glúteos, y baja despacio.'
    ],
    mistake: 'Mirar hacia adelante tensando el cuello o dar tirones bruscos.',
    easier: 'Eleva solo el pecho y los brazos manteniendo los pies descansando en el suelo.'
  },
  downdog_cobra: {
    id: 'downdog_cobra',
    name: 'Perro Boca Abajo a Cobra',
    category: 'flexibilidad',
    minPhase: 2,
    muscleLabel: 'Cadena Posterior y Pecho',
    highlightZone: 'full_stretch',
    cycleSec: 6.4,
    breath: { inhale: [0.45, 0.85], exhale: [0, 0.45] },
    goal: 'Flujo completo que estira pantorrillas, isquiotibiales y hombros, y abre el abdomen y pecho.',
    tips: [
      'Desde manos y pies, empuja caderas arriba y atrás formando una V invertida.',
      'Fluye suavemente hacia adelante bajando la pelvis y abriendo el pecho en Cobra.',
      'Mantén los hombros lejos de las orejas en ambas posturas.'
    ],
    mistake: 'Forzar los talones al suelo doblando la espalda o colapsar los hombros en Cobra.',
    easier: 'Flexiona las rodillas en Perro Boca Abajo y haz una "Baby Cobra" apoyando antebrazos.'
  },
  child_pose: {
    id: 'child_pose',
    name: 'Postura del Niño (Descarga Lumbar)',
    category: 'flexibilidad',
    minPhase: 1,
    muscleLabel: 'Espalda Baja y Hombros',
    highlightZone: 'spine',
    cycleSec: 5.5,
    breath: { inhale: [0, 0.45], exhale: [0.45, 1] },
    goal: 'Relaja profundamente la zona lumbar, estira dorsales y calma el sistema nervioso.',
    tips: [
      'Arrodíllate, lleva los glúteos hacia los talones y estira los brazos lejos al frente.',
      'Deja descansar la frente hacia la colchoneta y suelta la tensión del cuello.',
      'Inhala expandiendo las costillas hacia la espalda y exhala soltando peso.'
    ],
    mistake: 'Mantener los hombros tensos o forzar los glúteos si las rodillas tiran.',
    easier: 'Coloca un cojín entre glúteos y talones o apoya la frente sobre tus antebrazos.'
  },
  hip_hamstring_stretch: {
    id: 'hip_hamstring_stretch',
    name: 'Estiramiento de Cadera e Isquiotibiales',
    category: 'flexibilidad',
    minPhase: 1,
    muscleLabel: 'Flexores de Cadera e Isquiotibiales',
    highlightZone: 'hips_hamstrings',
    cycleSec: 6.0,
    breath: { inhale: [0, 0.45], exhale: [0.45, 1] },
    goal: 'Libera el acortamiento de caderas y la parte posterior de los muslos típico de estar sentado.',
    tips: [
      'En media rodilla (una rodilla en el suelo, el otro pie adelante), empuja la cadera al frente.',
      'Luego desplaza la cadera hacia atrás extendiendo la pierna delantera con la punta hacia arriba.',
      'Mantén la espalda larga y alterna lados a la mitad del tiempo.'
    ],
    mistake: 'Encorvar la espalda tratando de tocar el pie con las manos.',
    easier: 'Apoya las manos en tu muslo o en dos libros altos para mantener el torso cómodo.'
  }
};

export const EXERCISE_LIST = Object.values(EXERCISES);