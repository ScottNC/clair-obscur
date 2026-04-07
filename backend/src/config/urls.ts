const MAXROLL_BASE = 'https://maxroll.gg/clair-obscur-expedition-33/guides/';
const IGN_BASE = 'https://www.ign.com/wikis/clair-obscur-expedition-33/';

const maxroll = (slug: string): string => `${MAXROLL_BASE}${slug}`;
const ign = (slug: string): string => `${IGN_BASE}${slug}`;

// Helper to create Maxroll URL objects (name derived from slug)
const maxrollGuide = (slug: string, type: string) => ({
  url: maxroll(slug),
  type,
  name: slug.replaceAll('-', ' ').replaceAll(/\b\w/g, l => l.toUpperCase()),
  collection: 'maxroll'
});

// Helper to create IGN URL objects (name derived from slug)
const ignGuide = (slug: string, type: string) => ({
  url: ign(slug),
  type,
  name: slug.replaceAll('_', ' '),
  collection: 'ign'
});

// ============================================
// MAXROLL SLUGS
// ============================================

const MAXROLL_CHARACTER_SLUGS = [
  'gustave-skills-guide',
  'lune-skills-guide',
  'maelle-skills-guide',
  'sciel-skills-guide',
  'verso-skills-guide',
  'monoco-skills-guide'
];

const MAXROLL_PICTO_SLUGS = [
  'best-pictos-guide',
  'how-to-get-dead-energy-ii-and-critical-burn',
  'hidden-gestral-arena-guide',
  'how-to-get-recovery'
];

const MAXROLL_RESOURCE_SLUGS = [
  'getting-started-in-clair-obscur-expedition-33-beginners-guide',
  'combat-guide',
  'how-to-unlock-diving-and-esquies-other-abilities',
  'endless-tower-strategy-guide',
  'enemy-weakness-resistance-guide',
  'pictos-lumina-guide',
  'expedition-33-zone-progression-guide',
  'weapon-attributes-upgrades-guide',
  'act-1-boss-parry-guide',
  'act-2-boss-parry-guide'
];

const MAXROLL_BUILD_SLUGS = [
  'early-game-builds-for-expert-difficulty',
  'endgame-burn-stacking-build-expert-and-ng'
];

// ============================================
// IGN SLUGS (by type)
// ============================================

// Walkthroughs
const IGN_WALKTHROUGH_ACT1_SLUGS = [
  'Walkthrough',
  'Prologue:_Lumiere',
  "Antoine's_Quiz_Questions_and_Answers",
  'Festival_Token_Locations',
  'Spring_Meadows',
  'Flying_Waters',
  'Ancient_Sanctuary',
  'Gestral_Village',
  "Esquie's_Nest",
  'Stone_Wave_Cliffs'
];

const IGN_WALKTHROUGH_ACT2_SLUGS = [
  'Forgotten_Battlefield',
  "Monoco's_Station",
  'Grandis_Fashionist_Answers',
  'Old_Lumiere',
  'Visages',
  'All_Correct_Mask_Answers_for_Visages',
  'Sirene',
  'The_Monolith',
  'Lumiere',
  'All_Endings_and_How_to_Get_Them'
];

// Side Quests
const IGN_SIDE_QUEST_PART1_SLUGS = [
  'Side_Areas',
  'The_Manor',
  'Hidden_Gestral_Arena',
  'Ancient_Gestral_City',
  'Chromatic_Abbest_(Abbest_Cave)',
  'Red_Woods',
  'Twilight_Quarry',
  'Yellow_Harvest'
];

const IGN_SIDE_QUEST_PART2_SLUGS = [
  'Lost_Woods',
  'Chromatic_Hexga_(Stone_Wave_Cliffs_Cave)',
  'Giant_Sapling_(Crushing_Cavern)',
  'Falling_Leaves',
  'Frozen_Hearts',
  'Coastal_Cave',
  'The_Carousel',
  'Blades_Graveyard'
];

const IGN_SIDE_QUEST_PART3_SLUGS = [
  'Boat_Graveyard',
  'White_Tree',
  'White_Sands',
  'Esoteric_Ruins_Maze_-_Portier_Quest',
  'The_Meadows',
  'Flying_Casino',
  'Sacred_River',
  'Chromatic_Glaise_(Sky_Island)'
];

const IGN_SIDE_QUEST_PART4_SLUGS = [
  'Chalier_Quest_-_Should_You_Kill_the_Chalier_(Floating_Cemetery)',
  'Sirene\'s_Dress',
  'The_Reacher',
  'Painting_Workshop',
  'Crimson_Forest',
  'The_Crows',
  'Blanche_Quest_-_Final_Nevron_Quest_(The_Fountain)',
  'Endless_Tower_Guide:_Location_and_Best_Build'
];

const IGN_SIDE_QUEST_PART5_SLUGS = [
  'Endless_Night_Sanctuary',
  'The_Canvas',
  'Dark_Shores',
  'The_Chosen_Path',
  'Dark_Gestral_Arena',
  'Flying_Manor',
  'Sunless_Cliffs',
  'Renoir\'s_Drafts',
  'Verso\'s_Drafts_Walkthrough'
];

// Boss Fights
const IGN_BOSS_FIGHT_PART1_SLUGS = [
  'Eveque_Boss_Fight',
  'Goblu_Boss_Fight',
  'Ultimate_Sakapatate_Boss_Fight',
  'Lampmaster_Boss_Fight',
  'Dualliste_Boss_Fight',
  'Stalact_Boss_Fight'
];

const IGN_BOSS_FIGHT_PART2_SLUGS = [
  'Renoir_Boss_Fight',
  'Visage\'s_Boss_Fight',
  'Sirene_Boss_Fight',
  'Renoir_(Monolith)_Boss_Fight',
  'The_Paintress_Boss_Fight',
  'Renoir_(Act_3)_Boss_Fight'
];

// ============================================
// BUILD URLS FROM SLUGS
// ============================================

// Maxroll URLs
const MAXROLL_CHARACTER_URLS = MAXROLL_CHARACTER_SLUGS.map(slug => maxrollGuide(slug, 'character'));
const MAXROLL_PICTO_URLS = MAXROLL_PICTO_SLUGS.map(slug => maxrollGuide(slug, 'picto'));
const MAXROLL_RESOURCE_URLS = MAXROLL_RESOURCE_SLUGS.map(slug => maxrollGuide(slug, 'resource'));
const MAXROLL_BUILD_URLS = MAXROLL_BUILD_SLUGS.map(slug => maxrollGuide(slug, 'build'));

// IGN URLs
const IGN_WALKTHROUGH_ACT1_URLS = IGN_WALKTHROUGH_ACT1_SLUGS.map(slug => ignGuide(slug, 'walkthrough'));
const IGN_WALKTHROUGH_ACT2_URLS = IGN_WALKTHROUGH_ACT2_SLUGS.map(slug => ignGuide(slug, 'walkthrough'));
const IGN_SIDE_QUEST_PART1_URLS = IGN_SIDE_QUEST_PART1_SLUGS.map(slug => ignGuide(slug, 'side-quest'));
const IGN_SIDE_QUEST_PART2_URLS = IGN_SIDE_QUEST_PART2_SLUGS.map(slug => ignGuide(slug, 'side-quest'));
const IGN_SIDE_QUEST_PART3_URLS = IGN_SIDE_QUEST_PART3_SLUGS.map(slug => ignGuide(slug, 'side-quest'));
const IGN_SIDE_QUEST_PART4_URLS = IGN_SIDE_QUEST_PART4_SLUGS.map(slug => ignGuide(slug, 'side-quest'));
const IGN_SIDE_QUEST_PART5_URLS = IGN_SIDE_QUEST_PART5_SLUGS.map(slug => ignGuide(slug, 'side-quest'));
const IGN_BOSS_FIGHT_PART1_URLS = IGN_BOSS_FIGHT_PART1_SLUGS.map(slug => ignGuide(slug, 'boss'));
const IGN_BOSS_FIGHT_PART2_URLS = IGN_BOSS_FIGHT_PART2_SLUGS.map(slug => ignGuide(slug, 'boss'));

// ============================================
// COLLECTION CONFIG
// ============================================
export const COLLECTION_CONFIG = [
  // Maxroll
  { name: 'maxroll-characters', urls: MAXROLL_CHARACTER_URLS },
  { name: 'maxroll-pictos', urls: MAXROLL_PICTO_URLS },
  { name: 'maxroll-resources', urls: MAXROLL_RESOURCE_URLS },
  { name: 'maxroll-builds', urls: MAXROLL_BUILD_URLS },
  
  // IGN Walkthroughs
  { name: 'ign-walkthrough-act1', urls: IGN_WALKTHROUGH_ACT1_URLS },
  { name: 'ign-walkthrough-act2', urls: IGN_WALKTHROUGH_ACT2_URLS },
  
  // IGN Side Quests
  { name: 'ign-side-quests-part1', urls: IGN_SIDE_QUEST_PART1_URLS },
  { name: 'ign-side-quests-part2', urls: IGN_SIDE_QUEST_PART2_URLS },
  { name: 'ign-side-quests-part3', urls: IGN_SIDE_QUEST_PART3_URLS },
  { name: 'ign-side-quests-part4', urls: IGN_SIDE_QUEST_PART4_URLS },
  { name: 'ign-side-quests-part5', urls: IGN_SIDE_QUEST_PART5_URLS },
  
  // IGN Boss Fights
  { name: 'ign-boss-fights-part1', urls: IGN_BOSS_FIGHT_PART1_URLS },
  { name: 'ign-boss-fights-part2', urls: IGN_BOSS_FIGHT_PART2_URLS }
];
