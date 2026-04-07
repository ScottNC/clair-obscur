const MAXROLL_URL = 'https://maxroll.gg/clair-obscur-expedition-33/guides/';

// Helper function to create full URL
const maxroll = (slug: string): string => `${MAXROLL_URL}${slug}`;

// ============================================
// CHARACTERS - Individual character skill guides
// ============================================
const MAXROLL_CHARACTER_URLS = [
  {
    url: maxroll('gustave-skills-guide'),
    type: 'character',
    name: 'Gustave',
    collection: 'characters'
  },
  {
    url: maxroll('lune-skills-guide'),
    type: 'character',
    name: 'Lune',
    collection: 'characters'
  },
  {
    url: maxroll('maelle-skills-guide'),
    type: 'character',
    name: 'Maelle',
    collection: 'characters'
  },
  {
    url: maxroll('sciel-skills-guide'),
    type: 'character',
    name: 'Sciel',
    collection: 'characters'
  },
  {
    url: maxroll('verso-skills-guide'),
    type: 'character',
    name: 'Verso',
    collection: 'characters'
  },
  {
    url: maxroll('monoco-skills-guide'),
    type: 'character',
    name: 'Monoco',
    collection: 'characters'
  },
];

// ============================================
// PICTOS - Picto and Lumina related guides
// ============================================
const MAXROLL_PICTO_URLS = [
  {
    url: maxroll('best-pictos-guide'),
    type: 'picto',
    name: 'Best Pictos',
    collection: 'pictos'
  },
  {
    url: maxroll('how-to-get-dead-energy-ii-and-critical-burn'),
    type: 'picto',
    name: 'Dead Energy II and Critical Burn',
    collection: 'pictos'
  },
  {
    url: maxroll('hidden-gestral-arena-guide'),
    type: 'picto',
    name: 'Hidden Gestral Arena',
    collection: 'pictos'
  },
  {
    url: maxroll('how-to-get-recovery'),
    type: 'picto',
    name: 'Recovery',
    collection: 'pictos'
  },
];

// ============================================
// RESOURCES - Game mechanics and reference guides
// ============================================
const MAXROLL_RESOURCE_URLS = [
  {
    url: maxroll('getting-started-in-clair-obscur-expedition-33-beginners-guide'),
    type: 'resource',
    name: "Beginner's Guide",
    collection: 'resources'
  },
  {
    url: maxroll('combat-guide'),
    type: 'resource',
    name: 'Combat Guide',
    collection: 'resources'
  },
  {
    url: maxroll('how-to-unlock-diving-and-esquies-other-abilities'),
    type: 'resource',
    name: "Esquie's Abilities",
    collection: 'resources'
  },
  {
    url: maxroll('endless-tower-strategy-guide'),
    type: 'resource',
    name: 'Endless Tower Guide',
    collection: 'resources'
  },
  {
    url: maxroll('enemy-weakness-resistance-guide'),
    type: 'resource',
    name: 'Enemy Weaknesses and Resistances',
    collection: 'resources'
  },
  {
    url: maxroll('pictos-lumina-guide'),
    type: 'resource',
    name: 'Pictos and Lumina',
    collection: 'resources'
  },
  {
    url: maxroll('expedition-33-zone-progression-guide'),
    type: 'resource',
    name: 'Optional Zone Progression',
    collection: 'resources'
  },
  {
    url: maxroll('weapon-attributes-upgrades-guide'),
    type: 'resource',
    name: 'Weapons, Attributes and Upgrades',
    collection: 'resources'
  },
  {
    url: maxroll('act-1-boss-parry-guide'),
    type: 'resource',
    name: 'Boss Parry Guide (Act 1)',
    collection: 'resources'
  },
  {
    url: maxroll('act-2-boss-parry-guide'),
    type: 'resource',
    name: 'Boss Parry Guide (Act 2)',
    collection: 'resources'
  },
];

// ============================================
// BUILDS - Character builds and strategies
// ============================================
const MAXROLL_BUILD_URLS = [
  {
    url: maxroll('early-game-builds-for-expert-difficulty'),
    type: 'build',
    name: 'Early Game Expert Difficulty Builds',
    collection: 'builds'
  },
  {
    url: maxroll('endgame-burn-stacking-build-expert-and-ng'),
    type: 'build',
    name: 'Endgame Burn Stacking',
    collection: 'builds'
  },
];

const walkthroughSlugs = [
  'Walkthrough',
  'Prologue:_Lumiere',
  'Antoine\'s_Quiz_Questions_and_Answers',
  'Festival_Token_Locations',
  'Spring_Meadows',
  'Flying_Waters', 
  'Ancient_Sanctuary',
  'Gestral_Village',
  'Esquie\'s_Nest',
  'Stone_Wave_Cliffs',
  'Forgotten_Battlefield',
  'Monoco\'s_Station',
  'Old_Lumiere',
  'Visages',
  'Sirene',
  'The_Monolith',
  'Lumiere',
  'All_Endings_and_How_to_Get_Them'
];

const IGN_WALKTHROUGH_URLS = walkthroughSlugs.map(slug => ({
  url: `https://www.ign.com/wikis/clair-obscur-expedition-33/${slug}`,
  type: 'resource',
  name: slug.replaceAll('_', ' ') + ' Walkthrough',
  collection: 'resources'
}));

// ============================================
// COLLECTION CONFIG - All URLs grouped by collection
// ============================================
export const COLLECTION_CONFIG = [
  { name: 'maxroll-characters', urls: MAXROLL_CHARACTER_URLS },
  { name: 'maxroll-pictos', urls: MAXROLL_PICTO_URLS },
  { name: 'maxroll-resources', urls: MAXROLL_RESOURCE_URLS },
  { name: 'maxroll-builds', urls: MAXROLL_BUILD_URLS },
  { name: 'ign-walkthroughs', urls: IGN_WALKTHROUGH_URLS }
];
