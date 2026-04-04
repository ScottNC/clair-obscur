import dotenv from "dotenv";
import { getChromaClient } from "./utils/getChromaClient";

dotenv.config();

type Character = {
  id: string,
  content: string,
  metadata: any
}

const characters: Character[] = [
  {
    id: "character_gustave",
    content: "Gustave is a 32-year-old engineer with a mechanical arm. He leads Expedition 33. His combat style focuses on heavy physical attacks and engineering gadgets.",
    metadata: { type: "character", name: "Gustave", role: "protagonist", age: 32 }
  },
  {
    id: "character_maelle",
    content: "Maelle is Gustave's foster sister and a skilled arcanist. She can manipulate Stains - magical residues left by enemy attacks - to power her spells or debuff enemies.",
    metadata: { type: "character", name: "Maelle", role: "arcanist", relation: "Gustave's foster sister" }
  },
  {
    id: "character_lune",
    content: "Lune is a mysterious warrior who joins Expedition 33. She has amnesia and cannot remember her past before the Paintress's curse. She wields a unique blade that changes form based on equipped pictos.",
    metadata: { type: "character", name: "Lune", role: "warrior", trait: "amnesia" }
  },
  {
    id: "character_sciel",
    content: "Sciel is a young inventor and prodigy who creates gadgets for the expedition. Despite her age, her inventions are crucial for surviving the Paintress's cursed world.",
    metadata: { type: "character", name: "Sciel", role: "inventor", trait: "prodigy" }
  },
  {
    id: "character_verso",
    content: "Verso is the son of the Paintress (Aline). He has deep knowledge of the painted world's true nature. His mother created the world to preserve copies of him after his death.",
    metadata: { type: "character", name: "Verso", role: "guide", relation: "Paintress's son" }
  },
  {
    id: "character_monoco",
    content: "Monoco is a gestral who befriended Verso. He has the ability to replicate enemy abilities by eating their feet.",
    metadata: { type: "character", name: "Monoco", role: "gestral" }
  },
  {
    id: "character_renoir",
    content: "Renoir is a veteran warrior who has survived multiple expeditions. He provides tactical advice and serves as a mentor to younger expedition members.",
    metadata: { type: "character", name: "Renoir", role: "mentor", trait: "veteran" }
  },
  {
    id: "character_paintress",
    content: "The Paintress, whose real name is Aline, is the creator of the painted world. She is not a villain but a grieving mother trying to preserve a world containing copies of her deceased son Verso.",
    metadata: { type: "character", name: "Paintress", realName: "Aline", role: "antagonist? true nature: tragic mother" }
  }
];

async function populateCharacters() {
  const client = getChromaClient();
  try {
    let collection;
    try {
      collection = await client.getCollection({ name: "character-data" });
      console.log("Loaded collection: character-data");
    } catch {
      throw new Error("Error getting collection. Please make sure collection exists.")
    }

    console.log(`Adding ${characters.length} characters to database...`);
    
    await collection.add({
      ids: characters.map(c => c.id),
      documents: characters.map(c => c.content),
      metadatas: characters.map(c => c.metadata)
    });

    console.log("✅ Characters successfully added to Chroma!");
    
    const count = await collection.count();
    console.log(`📊 Total documents in collection: ${count}`);
    
    return collection;
    
  } catch (error) {
    console.error("❌ Error populating characters:", error);
    throw error;
  }
}

populateCharacters();