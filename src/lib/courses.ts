export interface CourseLesson {
  title: string;
  duration: string;
  videoUrl?: string;
}

export interface CourseTask {
  title: string;
  description: string;
  dueInDays: number;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  instructorEmail?: string;
  instructorBio: string;
  price: number;
  hours: number;
  level: "Principiante" | "Intermedio" | "Avanzado";
  description: string;
  longDescription: string;
  image: string;
  icon?: string;
  tag?: string;
  rating?: number;
  students: number;
  schedule: string;
  flexible: boolean;
  language: string;
  requirements: string[];
  learnings: string[];
  lessons: CourseLesson[];
  tasks: CourseTask[];
  builtin?: boolean;
  featured?: boolean;
}

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;

export const BUILTIN_COURSES: Course[] = [
  {
    id: "c1", title: "Inglés para call centers", category: "Idiomas", instructor: "María Fernández",
    instructorBio: "10 años entrenando agentes bilingües en Tegucigalpa y SPS.",
    price: 350, hours: 16, level: "Intermedio",
    description: "Domina el inglés conversacional con enfoque en atención al cliente.",
    longDescription: "Programa intensivo enfocado en pronunciación neutra, manejo de objeciones y vocabulario técnico usado en call centers de Honduras.",
    image: img("photo-1503676260728-1c00da094a0b"),
    icon: "headset", tag: "Más popular", rating: 4.9, students: 1240,
    schedule: "Lun/Mié/Vie 6:00 PM – 8:00 PM", flexible: false, language: "Español + Inglés",
    requirements: ["Nivel A2 de inglés", "Computadora con audífonos"],
    learnings: ["Pronunciación clara", "Manejo de llamadas difíciles", "Vocabulario técnico de soporte"],
    lessons: [
      { title: "Bienvenida y evaluación inicial", duration: "12 min" },
      { title: "Fonética aplicada al call center", duration: "35 min" },
      { title: "Frases clave de apertura", duration: "28 min" },
      { title: "Escenarios de soporte técnico", duration: "42 min" },
      { title: "Manejo de clientes molestos", duration: "38 min" },
      { title: "Simulacro final grabado", duration: "50 min" },
    ],
    tasks: [
      { title: "Grabación de saludo profesional", description: "Sube un audio de 60 seg presentándote como agente.", dueInDays: 3 },
      { title: "Role-play escrito", description: "Redacta un diálogo resolviendo un reclamo de facturación.", dueInDays: 7 },
    ],
    builtin: true, featured: true,
  },
  {
    id: "c2", title: "Reparación de celulares", category: "Oficio técnico", instructor: "Carlos Reyes",
    instructorBio: "Técnico certificado con taller propio desde 2015.",
    price: 280, hours: 12, level: "Principiante",
    description: "Aprende a diagnosticar y reparar fallas comunes en smartphones.",
    longDescription: "Aprenderás a cambiar pantallas, baterías, puertos de carga y a diagnosticar fallas de software en Android e iPhone.",
    image: img("photo-1512428559087-560fa5ceab42"),
    icon: "tools", tag: "Oficio técnico", rating: 4.8, students: 860,
    schedule: "Horarios flexibles", flexible: true, language: "Español",
    requirements: ["Kit básico de destornilladores", "Un celular de práctica"],
    learnings: ["Cambio de pantalla", "Reemplazo de batería", "Diagnóstico por software"],
    lessons: [
      { title: "Herramientas del taller", duration: "18 min" },
      { title: "Anatomía de un smartphone", duration: "25 min" },
      { title: "Cambio de pantalla paso a paso", duration: "45 min" },
      { title: "Reemplazo de batería seguro", duration: "30 min" },
      { title: "Diagnóstico con software", duration: "22 min" },
    ],
    tasks: [
      { title: "Reporte de diagnóstico", description: "Diagnostica un equipo real y sube el informe.", dueInDays: 5 },
    ],
    builtin: true, featured: true,
  },
  {
    id: "c3", title: "Matemáticas para ingeniería", category: "Nivelación", instructor: "Laura Gómez",
    instructorBio: "Ing. civil y catedrática universitaria por 12 años.",
    price: 320, hours: 20, level: "Intermedio",
    description: "Refuerza tus bases matemáticas con ejercicios prácticos.",
    longDescription: "Curso de nivelación para estudiantes de ingeniería: álgebra, trigonometría y cálculo diferencial aplicado.",
    image: img("photo-1509228468518-180dd4864904"),
    icon: "chart", tag: "Nivelación", rating: 4.7, students: 540,
    schedule: "Mar/Jue 7:00 PM – 9:00 PM", flexible: false, language: "Español",
    requirements: ["Cuaderno y calculadora científica"],
    learnings: ["Álgebra sólida", "Trigonometría aplicada", "Introducción al cálculo"],
    lessons: [
      { title: "Repaso de álgebra", duration: "40 min" },
      { title: "Funciones y gráficas", duration: "38 min" },
      { title: "Trigonometría práctica", duration: "45 min" },
      { title: "Límites y continuidad", duration: "50 min" },
      { title: "Derivadas iniciales", duration: "42 min" },
    ],
    tasks: [
      { title: "Ejercicios de álgebra", description: "Resuelve 20 problemas del cuadernillo.", dueInDays: 4 },
      { title: "Proyecto final", description: "Modela un problema real con derivadas.", dueInDays: 14 },
    ],
    builtin: true, featured: true,
  },
  {
    id: "c4", title: "Diseño gráfico con Canva", category: "Diseño", instructor: "Diego Martínez",
    instructorBio: "Diseñador freelance para PyMEs hondureñas.",
    price: 220, hours: 10, level: "Principiante",
    description: "Crea piezas visuales profesionales sin experiencia previa.",
    longDescription: "Domina Canva para crear publicaciones, historias, presentaciones y branding básico para tu negocio.",
    image: img("photo-1626785774573-4b799315345d"),
    icon: "brush", rating: 4.8, students: 1520,
    schedule: "Horarios flexibles", flexible: true, language: "Español",
    requirements: ["Cuenta gratuita de Canva"],
    learnings: ["Composición visual", "Uso de tipografías", "Branding para redes"],
    lessons: [
      { title: "Tour por Canva", duration: "15 min" },
      { title: "Paleta de colores", duration: "20 min" },
      { title: "Tipografías que venden", duration: "25 min" },
      { title: "Plantillas para Instagram", duration: "30 min" },
      { title: "Kit de marca completo", duration: "35 min" },
    ],
    tasks: [
      { title: "Kit de marca", description: "Diseña logo, paleta y 3 publicaciones.", dueInDays: 7 },
    ],
    builtin: true, featured: true,
  },
  {
    id: "c5", title: "Introducción a Python", category: "Programación", instructor: "Ana Reyes",
    instructorBio: "Desarrolladora backend y mentora en bootcamps.",
    price: 400, hours: 18, level: "Principiante",
    description: "Domina los fundamentos de Python con proyectos reales.",
    longDescription: "Aprenderás sintaxis, estructuras de datos, funciones y construirás una pequeña API con Flask.",
    image: img("photo-1526379095098-d400fd0bf935"),
    icon: "code", rating: 4.9, students: 2100,
    schedule: "Horarios flexibles", flexible: true, language: "Español",
    requirements: ["Computadora con acceso a internet"],
    learnings: ["Sintaxis de Python", "POO básica", "Mini API con Flask"],
    lessons: [
      { title: "Instalación y primer script", duration: "20 min" },
      { title: "Variables y tipos", duration: "28 min" },
      { title: "Listas, tuplas y diccionarios", duration: "35 min" },
      { title: "Funciones y módulos", duration: "40 min" },
      { title: "Proyecto: API con Flask", duration: "60 min" },
    ],
    tasks: [
      { title: "Reto de listas", description: "Resuelve 10 ejercicios de manipulación.", dueInDays: 5 },
      { title: "Mini API", description: "Publica una API REST con 3 endpoints.", dueInDays: 12 },
    ],
    builtin: true, featured: true,
  },
  {
    id: "c6", title: "Excel avanzado y dashboards", category: "Productividad", instructor: "Roberto Castillo",
    instructorBio: "Analista de datos con 8 años en el sector financiero.",
    price: 260, hours: 12, level: "Avanzado",
    description: "Fórmulas, tablas dinámicas y visualización de datos.",
    longDescription: "Aprende fórmulas avanzadas, Power Query, tablas dinámicas y dashboards ejecutivos.",
    image: img("photo-1554224155-6726b3ff858f"),
    icon: "calculator", rating: 4.7, students: 980,
    schedule: "Sábados 9:00 AM – 12:00 PM", flexible: false, language: "Español",
    requirements: ["Excel 2019 o superior"],
    learnings: ["Fórmulas avanzadas", "Tablas dinámicas", "Dashboards interactivos"],
    lessons: [
      { title: "BUSCARV, INDICE y COINCIDIR", duration: "30 min" },
      { title: "Tablas dinámicas", duration: "40 min" },
      { title: "Power Query", duration: "45 min" },
      { title: "Dashboard ejecutivo", duration: "55 min" },
    ],
    tasks: [
      { title: "Dashboard de ventas", description: "Construye un dashboard con datos ficticios.", dueInDays: 7 },
    ],
    builtin: true, featured: true,
  },
  {
    id: "c7", title: "Marketing digital 360°", category: "Negocios", instructor: "Lucía Paredes",
    instructorBio: "Consultora de marketing para más de 40 marcas locales.",
    price: 480, hours: 22, level: "Intermedio",
    description: "Estrategias de redes, SEO y publicidad paga.",
    longDescription: "Programa completo: estrategia, contenido, SEO y campañas pagas en Meta y Google.",
    image: img("photo-1533750349088-cd871a92f312"),
    icon: "chart", rating: 4.6, students: 720,
    schedule: "Horarios flexibles", flexible: true, language: "Español",
    requirements: ["Cuentas en Meta Business y Google"],
    learnings: ["Estrategia digital", "SEO on-page", "Campañas Meta Ads"],
    lessons: [
      { title: "Estrategia y buyer persona", duration: "35 min" },
      { title: "Contenido que convierte", duration: "40 min" },
      { title: "SEO on-page", duration: "45 min" },
      { title: "Meta Ads paso a paso", duration: "55 min" },
      { title: "Métricas y reportes", duration: "38 min" },
    ],
    tasks: [
      { title: "Plan de contenido", description: "Diseña un plan mensual de contenido.", dueInDays: 7 },
      { title: "Campaña real", description: "Lanza una campaña con $5 de prueba.", dueInDays: 14 },
    ],
    builtin: true, featured: true,
  },
  {
    id: "c8", title: "Fotografía con celular", category: "Arte", instructor: "Diego Fuentes",
    instructorBio: "Fotógrafo profesional y creador de contenido.",
    price: 200, hours: 8, level: "Principiante",
    description: "Toma fotos profesionales usando solo tu smartphone.",
    longDescription: "Aprende composición, luz natural y edición móvil para crear contenido de alto impacto.",
    image: img("photo-1516035069371-29a1b244cc32"),
    icon: "brush", rating: 4.8, students: 1340,
    schedule: "Horarios flexibles", flexible: true, language: "Español",
    requirements: ["Un smartphone con cámara"],
    learnings: ["Regla de tercios", "Luz natural", "Edición con Snapseed"],
    lessons: [
      { title: "Composición básica", duration: "22 min" },
      { title: "Trabajo con luz natural", duration: "28 min" },
      { title: "Retratos con celular", duration: "30 min" },
      { title: "Edición con Snapseed", duration: "25 min" },
    ],
    tasks: [
      { title: "Serie fotográfica", description: "Publica 5 fotos con el mismo concepto.", dueInDays: 6 },
    ],
    builtin: true, featured: true,
  },
  {
    id: "c9", title: "Guitarra desde cero", category: "Música", instructor: "Sofía Ramírez",
    instructorBio: "Guitarrista y profesora particular por más de una década.",
    price: 240, hours: 14, level: "Principiante",
    description: "Aprende acordes y tus primeras canciones.",
    longDescription: "Curso pensado para principiantes absolutos: postura, acordes básicos y ritmos populares.",
    image: img("photo-1510915361894-db8b60106cb1"),
    icon: "brush", rating: 4.7, students: 640,
    schedule: "Mar/Jue 5:00 PM – 6:30 PM", flexible: false, language: "Español",
    requirements: ["Guitarra acústica"],
    learnings: ["Acordes mayores y menores", "Cambios fluidos", "3 canciones completas"],
    lessons: [
      { title: "Afinación y postura", duration: "15 min" },
      { title: "Primeros acordes", duration: "25 min" },
      { title: "Rasgueos básicos", duration: "30 min" },
      { title: "Tu primera canción", duration: "35 min" },
    ],
    tasks: [
      { title: "Video tocando", description: "Grábate tocando una canción del curso.", dueInDays: 10 },
    ],
    builtin: true, featured: true,
  },
  {
    id: "c10", title: "Finanzas personales", category: "Negocios", instructor: "Patricia Solís",
    instructorBio: "Coach financiera certificada, columnista económica.",
    price: 300, hours: 9, level: "Principiante",
    description: "Presupuesto, ahorro e inversión desde cero.",
    longDescription: "Toma el control de tu dinero: presupuesto 50/30/20, fondo de emergencia e introducción a inversiones.",
    image: img("photo-1554224154-26032ffc0d07"),
    icon: "chart", rating: 4.9, students: 1780,
    schedule: "Horarios flexibles", flexible: true, language: "Español",
    requirements: ["Ganas de organizar tus finanzas"],
    learnings: ["Presupuesto mensual", "Fondo de emergencia", "Bases de inversión"],
    lessons: [
      { title: "Diagnóstico financiero", duration: "20 min" },
      { title: "Presupuesto 50/30/20", duration: "25 min" },
      { title: "Elimina deudas", duration: "30 min" },
      { title: "Introducción a inversiones", duration: "35 min" },
    ],
    tasks: [
      { title: "Tu presupuesto real", description: "Construye tu presupuesto del próximo mes.", dueInDays: 4 },
    ],
    builtin: true, featured: true,
  },
];

// Alias for backwards compat with landing page
export const COURSES = BUILTIN_COURSES;

export const PRO_PRICE_LEMPIRAS = 250;

export function formatL(v: number): string {
  return `L. ${v.toLocaleString("es-HN", { maximumFractionDigits: 0 })}`;
}

export const DEFAULT_CATEGORIES = [
  "Idiomas", "Oficio técnico", "Nivelación", "Diseño", "Programación",
  "Productividad", "Negocios", "Arte", "Música", "Salud", "Cocina", "Otro",
];
