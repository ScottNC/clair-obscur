const BASE_URL = 'https://maxroll.gg/clair-obscur-expedition-33/guides/';

// Helper function to create full URL
const guideUrl = (slug: string): string => `${BASE_URL}${slug}`;

// ============================================
// CHARACTERS - Individual character skill guides
// ============================================
const CHARACTER_URLS = [
  {
    url: guideUrl('gustave-skills-guide'),
    type: 'character',
    name: 'Gustave',
    collection: 'characters'
  },
  {
    url: guideUrl('lune-skills-guide'),
    type: 'character',
    name: 'Lune',
    collection: 'characters'
  },
  {
    url: guideUrl('maelle-skills-guide'),
    type: 'character',
    name: 'Maelle',
    collection: 'characters'
  },
  {
    url: guideUrl('sciel-skills-guide'),
    type: 'character',
    name: 'Sciel',
    collection: 'characters'
  },
  {
    url: guideUrl('verso-skills-guide'),
    type: 'character',
    name: 'Verso',
    collection: 'characters'
  },
  {
    url: guideUrl('monoco-skills-guide'),
    type: 'character',
    name: 'Monoco',
    collection: 'characters'
  },
];

// ============================================
// PICTOS - Picto and Lumina related guides
// ============================================
const PICTO_URLS = [
  {
    url: guideUrl('best-pictos-guide'),
    type: 'picto',
    name: 'Best Pictos',
    collection: 'pictos'
  },
  {
    url: guideUrl('how-to-get-dead-energy-ii-and-critical-burn'),
    type: 'picto',
    name: 'Dead Energy II and Critical Burn',
    collection: 'pictos'
  },
  {
    url: guideUrl('hidden-gestral-arena-guide'),
    type: 'picto',
    name: 'Hidden Gestral Arena',
    collection: 'pictos'
  },
  {
    url: guideUrl('how-to-get-recovery'),
    type: 'picto',
    name: 'Recovery',
    collection: 'pictos'
  },
];

// ============================================
// RESOURCES - Game mechanics and reference guides
// ============================================
const RESOURCE_URLS = [
  {
    url: guideUrl('getting-started-in-clair-obscur-expedition-33-beginners-guide'),
    type: 'resource',
    name: "Beginner's Guide",
    collection: 'resources'
  },
  {
    url: guideUrl('combat-guide'),
    type: 'resource',
    name: 'Combat Guide',
    collection: 'resources'
  },
  {
    url: guideUrl('how-to-unlock-diving-and-esquies-other-abilities'),
    type: 'resource',
    name: "Esquie's Abilities",
    collection: 'resources'
  },
  {
    url: guideUrl('endless-tower-strategy-guide'),
    type: 'resource',
    name: 'Endless Tower Guide',
    collection: 'resources'
  },
  {
    url: guideUrl('enemy-weakness-resistance-guide'),
    type: 'resource',
    name: 'Enemy Weaknesses and Resistances',
    collection: 'resources'
  },
  {
    url: guideUrl('pictos-lumina-guide'),
    type: 'resource',
    name: 'Pictos and Lumina',
    collection: 'resources'
  },
  {
    url: guideUrl('expedition-33-zone-progression-guide'),
    type: 'resource',
    name: 'Optional Zone Progression',
    collection: 'resources'
  },
  {
    url: guideUrl('weapon-attributes-upgrades-guide'),
    type: 'resource',
    name: 'Weapons, Attributes and Upgrades',
    collection: 'resources'
  },
  {
    url: guideUrl('act-1-boss-parry-guide'),
    type: 'resource',
    name: 'Boss Parry Guide (Act 1)',
    collection: 'resources'
  },
  {
    url: guideUrl('act-2-boss-parry-guide'),
    type: 'resource',
    name: 'Boss Parry Guide (Act 2)',
    collection: 'resources'
  },
];

// ============================================
// BUILDS - Character builds and strategies
// ============================================
const BUILD_URLS = [
  {
    url: guideUrl('early-game-builds-for-expert-difficulty'),
    type: 'build',
    name: 'Early Game Expert Difficulty Builds',
    collection: 'builds'
  },
  {
    url: guideUrl('endgame-burn-stacking-build-expert-and-ng'),
    type: 'build',
    name: 'Endgame Burn Stacking',
    collection: 'builds'
  },
];

// ============================================
// COLLECTION CONFIG - All URLs grouped by collection
// ============================================
export const COLLECTION_CONFIG = [
  { name: 'characters', urls: CHARACTER_URLS },
  { name: 'pictos', urls: PICTO_URLS },
  { name: 'resources', urls: RESOURCE_URLS },
  { name: 'builds', urls: BUILD_URLS },
];
