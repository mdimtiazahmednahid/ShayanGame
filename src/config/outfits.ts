export type OutfitId =
  | 'polo'
  | 'blazer'
  | 'beanie'
  | 'beach'
  | 'panjabi'
  | 'hero'
  | 'spiky'
  | 'curly'
  | 'sidepart';

export interface Point {
  x: number; // 0..1 relative to trimmed character bounding box width
  y: number; // 0..1 relative to trimmed character bounding box height
}

export interface OutfitConfig {
  id: OutfitId;
  name: string;
  emoji: string;
  imageUrl: string;
  landmarks: {
    leftEye: Point;
    rightEye: Point;
    eyeRadiusX: number; // relative to trimmed width
    eyeRadiusY: number; // relative to trimmed height
    mouth: Point;
    mouthWidth: number; // relative to trimmed width
    mouthHeight: number; // relative to trimmed height
    skinSample: Point; // forehead/cheek point to sample exact skin tone
  };
}

export const OUTFITS: OutfitConfig[] = [
  {
    id: 'polo',
    name: 'Cool Polo',
    emoji: '👕',
    imageUrl: '/assets/shayan_polo.jpg',
    landmarks: {
      leftEye: { x: 0.415, y: 0.097 },
      rightEye: { x: 0.578, y: 0.097 },
      eyeRadiusX: 0.036,
      eyeRadiusY: 0.011,
      mouth: { x: 0.498, y: 0.146 },
      mouthWidth: 0.145,
      mouthHeight: 0.020,
      skinSample: { x: 0.498, y: 0.078 },
    },
  },
  {
    id: 'blazer',
    name: 'Class Party',
    emoji: '🧥',
    imageUrl: '/assets/shayan_blazer.jpg',
    landmarks: {
      leftEye: { x: 0.415, y: 0.100 },
      rightEye: { x: 0.562, y: 0.100 },
      eyeRadiusX: 0.036,
      eyeRadiusY: 0.011,
      mouth: { x: 0.490, y: 0.145 },
      mouthWidth: 0.135,
      mouthHeight: 0.018,
      skinSample: { x: 0.490, y: 0.080 },
    },
  },
  {
    id: 'sidepart',
    name: 'Side-Part Hoodie',
    emoji: '💛',
    imageUrl: '/assets/shayan_sidepart.jpg',
    landmarks: {
      leftEye: { x: 0.415, y: 0.097 },
      rightEye: { x: 0.578, y: 0.097 },
      eyeRadiusX: 0.036,
      eyeRadiusY: 0.011,
      mouth: { x: 0.498, y: 0.145 },
      mouthWidth: 0.142,
      mouthHeight: 0.019,
      skinSample: { x: 0.498, y: 0.075 },
    },
  },
  {
    id: 'spiky',
    name: 'Spiky Hair',
    emoji: '⚡',
    imageUrl: '/assets/shayan_spiky.jpg',
    landmarks: {
      leftEye: { x: 0.425, y: 0.114 },
      rightEye: { x: 0.585, y: 0.114 },
      eyeRadiusX: 0.036,
      eyeRadiusY: 0.011,
      mouth: { x: 0.505, y: 0.163 },
      mouthWidth: 0.142,
      mouthHeight: 0.019,
      skinSample: { x: 0.505, y: 0.092 },
    },
  },
  {
    id: 'curly',
    name: 'Curly Hair',
    emoji: '🌀',
    imageUrl: '/assets/shayan_curly.jpg',
    landmarks: {
      leftEye: { x: 0.432, y: 0.115 },
      rightEye: { x: 0.585, y: 0.115 },
      eyeRadiusX: 0.035,
      eyeRadiusY: 0.011,
      mouth: { x: 0.508, y: 0.163 },
      mouthWidth: 0.138,
      mouthHeight: 0.019,
      skinSample: { x: 0.508, y: 0.094 },
    },
  },
  {
    id: 'beanie',
    name: 'Cozy Beanie',
    emoji: '🧶',
    imageUrl: '/assets/shayan_beanie.jpg',
    landmarks: {
      leftEye: { x: 0.428, y: 0.120 },
      rightEye: { x: 0.592, y: 0.120 },
      eyeRadiusX: 0.036,
      eyeRadiusY: 0.011,
      mouth: { x: 0.510, y: 0.172 },
      mouthWidth: 0.140,
      mouthHeight: 0.019,
      skinSample: { x: 0.510, y: 0.100 },
    },
  },
  {
    id: 'beach',
    name: 'Beach Cool',
    emoji: '🌴',
    imageUrl: '/assets/shayan_beach.jpg',
    landmarks: {
      leftEye: { x: 0.415, y: 0.098 },
      rightEye: { x: 0.575, y: 0.098 },
      eyeRadiusX: 0.036,
      eyeRadiusY: 0.011,
      mouth: { x: 0.495, y: 0.146 },
      mouthWidth: 0.140,
      mouthHeight: 0.019,
      skinSample: { x: 0.495, y: 0.078 },
    },
  },
  {
    id: 'panjabi',
    name: 'Festive Panjabi',
    emoji: '🌙',
    imageUrl: '/assets/shayan_panjabi.jpg',
    landmarks: {
      leftEye: { x: 0.432, y: 0.102 },
      rightEye: { x: 0.588, y: 0.102 },
      eyeRadiusX: 0.036,
      eyeRadiusY: 0.011,
      mouth: { x: 0.510, y: 0.150 },
      mouthWidth: 0.140,
      mouthHeight: 0.019,
      skinSample: { x: 0.510, y: 0.082 },
    },
  },
  {
    id: 'hero',
    name: 'Super Shayan',
    emoji: '🦸',
    imageUrl: '/assets/shayan_hero.jpg',
    landmarks: {
      leftEye: { x: 0.470, y: 0.105 },
      rightEye: { x: 0.575, y: 0.105 },
      eyeRadiusX: 0.028,
      eyeRadiusY: 0.011,
      mouth: { x: 0.522, y: 0.153 },
      mouthWidth: 0.105,
      mouthHeight: 0.019,
      skinSample: { x: 0.522, y: 0.085 },
    },
  },
];
