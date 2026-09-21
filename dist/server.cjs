var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
app.use(import_express.default.json());
var PORT = 3e3;
var aiClient = null;
function getAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new import_genai.GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
function mockGenerateQuest(profession, level, context, difficulty) {
  const categories = ["exploration", "athletics", "social", "focus", "mystery"];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const gold = Math.floor(Math.random() * 50) + 10 * level;
  const xp = Math.floor(Math.random() * 100) + 50 * level;
  const items = {
    Warrior: ["Ancient Whetstone", "Aetheric Buckler", "Basalt Runic Seal"],
    Elementalist: ["Charged Prism", "Sulfur Flask", "Stardust Ring"],
    Necromancer: ["Grave Dust Sachel", "Ossuary Key", "Vile Ichor Elixir"],
    Mesmer: ["Phantasm Mirror", "Rose Quartz Sigil", "Dusk Lens"],
    Thief: ["Carbon lockpick", "Smoke-shell Capsule", "Weighted throwing wire"],
    Ranger: ["Verdant Fern Core", "Tethering Rope", "Pet pheromone flask"],
    Guardian: ["Alabaster Relic", "Blessed Water", "Inscribed Aegis Plate"],
    Engineer: ["Subthermal Thermostat", "Chronosequence Relay", "Solder Rod"],
    Revenant: ["Mist-warden Band", "Echoing Shell", "Obsidian shard"]
  }[profession] || ["Mystic Coin", "Unidentified Dye", "Runic Shard"];
  const randomItem = items[Math.floor(Math.random() * items.length)];
  return {
    title: `Shattered Mist Over ${context || "Local Sector"}`,
    description: `A rift of chaotic magical energy has opened around your physical vicinity. As an active ${profession} (Level ${level}), the GW3 Tactical Interface ('Ai') commands you to stabilize the physical distortion before the Mists consume the anchor point.`,
    objective: `Find any real-life object that matches 'warm and metallic' or complete 5 pushups to synchronize your kinetic field. Describe the action clearly.`,
    category,
    rewardXp: xp,
    rewardGold: gold,
    rewardItem: randomItem,
    difficulty: difficulty || "medium"
  };
}
function mockEvaluateQuest(title, action, characterStats) {
  const roll = Math.floor(Math.random() * 20) + 1;
  const physicality = characterStats?.physicality || 10;
  const total = roll + Math.floor(physicality / 3);
  const passed = total >= 11;
  return {
    passed,
    score: total,
    roll,
    feedback: `[SYSTEM: Tactical Companion 'Ai' evaluation complete...] 
You submitted the following operational proof: "${action}". 
We rolled a Physicality/Resolve check: D20 Roll of ${roll} + Stat bonus gets you a score of ${total} (Required: 11). 
${passed ? "IMPRESSIVE! Your biological readings confirm perfect resonance with the Mist Matrix. Synchronization achieved." : "WARNING: Tactical flow was interrupted. The physical exertion was insufficient or out-of-sync. Please realign your kinetic force and retry."}`
  };
}
function mockNarrateItem(itemName) {
  const qualities = ["common", "rare", "exotic", "legendary"];
  const quality = qualities[Math.floor(Math.random() * qualities.length)];
  const types = ["consumable", "weapon", "armor", "accessory", "utility"];
  const type = types[Math.floor(Math.random() * types.length)];
  const boosts = [
    "+5% Stealth recovery indoors",
    "+10 Perception when reading fine print",
    "+12 Physicality for the next 30 minutes",
    "+8 Charisma while holding metallic relics",
    "+15 LoreTech capacity for decoding computer consoles"
  ];
  const statBoost = boosts[Math.floor(Math.random() * boosts.length)];
  return {
    name: `Aether-forged ${itemName}`,
    description: `A standard terrestrial object transformed into a Guild Wars 3 IRL artifact. The dense magical residue from the modern tech-grid has charged this item, making it extremely functional for field operations.`,
    type,
    quality,
    statBoost
  };
}
app.post("/api/gw3/chat", async (req, res) => {
  const { character, message, history } = req.body;
  const ai = getAI();
  if (!ai) {
    const responseText = `Greetings, Agent ${character?.name || "Recruit"}. I am 'Ai (gw3 ai)', your Tactical Defense companion for IRL Guild Wars 3. My analysis reports your current physical level is ${character?.level || 1} playing as a ${character?.profession || "Mercenary"}. Please state your real-world coordinates, scan an item, or request an immediate field quest and I will secure the surrounding perimeter!`;
    return res.json({ text: responseText });
  }
  try {
    const chatHistory = (history || []).map((msg) => ({
      role: msg.sender === "player" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...chatHistory,
        { text: `Player Message: "${message}". Context of character: Name: ${character?.name}, Race: ${character?.race}, Profession: ${character?.profession}, Level: ${character?.level}, Gold: ${character?.gold}, Active Guild: ${character?.guildName || "None"}. Stats: Physicality: ${character?.stats?.physicality}, Stealth: ${character?.stats?.stealth}, LoreTech: ${character?.stats?.loreTech}, Charisma: ${character?.stats?.charisma}, Perception: ${character?.stats?.perception}.` }
      ],
      config: {
        systemInstruction: "You are the advanced tactical hologram interface, simply named 'Ai' (short for gw3 ai), for 'Guild Wars 3 IRL'. Your job is to serve as both an immersive RPG Game Master and a tactical companion assisting players who play in the real physical world (IRL LARP/RPG). Refer to modern real-life scenarios, objects, and tasks as if they have deep sci-fi fantasy importance under the Guild Wars 3 Mist Matrix. Tone must be technical, high-tech magical, structured, highly encouraging, and strictly gaming-authentic. Keep responses relatively brief and dramatic, encouraging them to go do epic things in their real-life routine."
      }
    });
    res.json({ text: response.text || "Response failed." });
  } catch (error) {
    console.error("Gemini Chat error:", error);
    res.status(500).json({ error: "Chat simulation collapsed. Please check your system link.", details: error.message });
  }
});
app.post("/api/gw3/generate-quest", async (req, res) => {
  const { profession, level, context, difficulty } = req.body;
  const ai = getAI();
  if (!ai) {
    const quest = mockGenerateQuest(profession, level, context, difficulty);
    return res.json(quest);
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a new customized physical world quest inside Guild Wars 3 IRL. 
Player Profession: ${profession}
Player Level: ${level}
Player's real-life environment/context: ${context || "General street of home"}
Requested Difficulty: ${difficulty || "medium"}`,
      config: {
        systemInstruction: "You are 'Ai (gw3 ai)', the Tactical system. Generate a real-world RPG quest where players must execute something physical or social irl (e.g., walking, talking to a person, examining tech, physical steps). Give it epic Guild Wars lore that overlays onto the real world. Ensure that the objective is highly descriptive and actionable in the physical world.",
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            title: { type: import_genai.Type.STRING, description: "Atmospheric, epic name for the real-life quest" },
            description: { type: import_genai.Type.STRING, description: "Lore narrative mapping the real surroundings into active rifts" },
            objective: { type: import_genai.Type.STRING, description: "The manual irl action they must execute. E.g., 'Jog 200 meters to outrun Branded scouts' or 'Sip an iced elixir and reflect for 1 minute' or 'Do 10 reps of calibration squats'" },
            category: { type: import_genai.Type.STRING, description: "One of: exploration, athletics, social, focus, mystery" },
            rewardXp: { type: import_genai.Type.INTEGER, description: "XP reward, usually between 50 and 500" },
            rewardGold: { type: import_genai.Type.INTEGER, description: "Gold reward, usually between 10 and 150" },
            rewardItem: { type: import_genai.Type.STRING, description: "Optional item name of a custom fantasy artifact they might find" },
            difficulty: { type: import_genai.Type.STRING, description: "Must match easy, medium, hard, or elite" }
          },
          required: ["title", "description", "objective", "category", "rewardXp", "rewardGold", "difficulty"]
        }
      }
    });
    try {
      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } catch {
      res.json(mockGenerateQuest(profession, level, context, difficulty));
    }
  } catch (err) {
    console.error("Quest generation failed:", err);
    res.json(mockGenerateQuest(profession, level, context, difficulty));
  }
});
app.post("/api/gw3/evaluate-quest", async (req, res) => {
  const { title, submission, characterStats, objective, category } = req.body;
  const ai = getAI();
  if (!ai) {
    return res.json(mockEvaluateQuest(title, submission, characterStats));
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Evaluate this quest completion report.
Quest: ${title}
Required physical Objective: ${objective}
Category: ${category}
Player submittal explanation of what they did in real life: "${submission}"
Player's RPG stats: Physicality=${characterStats?.physicality}, Stealth=${characterStats?.stealth}, LoreTech=${characterStats?.loreTech}, Charisma=${characterStats?.charisma}, Perception=${characterStats?.perception}`,
      config: {
        systemInstruction: "You are 'Ai (gw3 ai)', the Game Master evaluating physical reports of LARP tasks. Model a randomized 'D20 roll' in your head, sum it with the appropriate stat of the category (athletics=physicality, social=charisma, exploration=perception, focus=loreTech, mystery=stealth). Generate a response explaining this RPG calculation, determine if they passed (required score is 11), and write an immersive feedback speech. Return JSON with the exact evaluation keys.",
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            passed: { type: import_genai.Type.BOOLEAN, description: "Whether their submission details display sufficient efforts and the dice roll was successful (must be true/false)" },
            score: { type: import_genai.Type.INTEGER, description: "D20 roll + calculated stat modifier (1 to 30)" },
            roll: { type: import_genai.Type.INTEGER, description: "Base D20 dice roll (1 to 20)" },
            feedback: { type: import_genai.Type.STRING, description: "Narrator review in character as Ai (gw3 ai). Praise them if passed, specify correction steps if failed." }
          },
          required: ["passed", "score", "roll", "feedback"]
        }
      }
    });
    try {
      res.json(JSON.parse(response.text || "{}"));
    } catch {
      res.json(mockEvaluateQuest(title, submission, characterStats));
    }
  } catch (err) {
    console.error("Evaluation failed:", err);
    res.json(mockEvaluateQuest(title, submission, characterStats));
  }
});
app.post("/api/gw3/narrate-item", async (req, res) => {
  const { itemName } = req.body;
  const ai = getAI();
  if (!ai) {
    return res.json(mockNarrateItem(itemName));
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Transform this mundane terrestrial item: "${itemName}" into an epic Guild Wars 3 magical/cybernetic artifact card.`,
      config: {
        systemInstruction: "Convert normal items into amazing r-RPG (Real-world Role Playing Game) gear. Keep descriptions extremely vivid and connected to modern technology overlayed with fantasy. Specify the level boost, type, and rarity quality.",
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            name: { type: import_genai.Type.STRING, description: "The cool fantasy name, like 'Glow-wire Spire of localized Wi-Fi'" },
            description: { type: import_genai.Type.STRING, description: "Scientific-magical background narrative" },
            type: { type: import_genai.Type.STRING, description: "consumable, weapon, armor, accessory, utility" },
            quality: { type: import_genai.Type.STRING, description: "common, rare, exotic, legendary" },
            statBoost: { type: import_genai.Type.STRING, description: "Clear power booster description, e.g. '+4 stealth inside libraries' or '+3 physicality when fully hydrated'" }
          },
          required: ["name", "description", "type", "quality", "statBoost"]
        }
      }
    });
    try {
      res.json(JSON.parse(response.text || "{}"));
    } catch {
      res.json(mockNarrateItem(itemName));
    }
  } catch (err) {
    console.error("Narrate item collapsed:", err);
    res.json(mockNarrateItem(itemName));
  }
});
app.post("/api/gw3/simulate-challenge", async (req, res) => {
  const { player1, player2, locationDetails } = req.body;
  const ai = getAI();
  try {
    const promptText = `Simulate a turn-based tactical arena duel in Guild Wars 3 IRL. 
Player 1: Name=${player1?.name}, Profession=${player1?.profession}, Race=${player1?.race}, Level=${player1?.level}, Stats=${JSON.stringify(player1?.stats)}
Player 2: Name=${player2?.name || "Mist-Revenant Sentry (NPC)"}, Profession=${player2?.profession || "Aether Sentry"}, Race=${player2?.race || "Phantasm"}, Level=${player2?.level || player1?.level}, Stats=${JSON.stringify(player2?.stats || player1?.stats)}
Combat Arena or physical environment: "${locationDetails || "Local Street Corner"}"`;
    const instructions = "Simulate a fully detailed 3-turn combat match between these two combatants inside the real-world arena. Each turn has dice rolls (e.g. 1d20 + stat modifier) and damage tallies matching their specific skills and weapons. Keep descriptions thrilling, game-authentic, and witty. Return JSON containing the structured rounds and designate the winner.";
    const schema = {
      type: import_genai.Type.OBJECT,
      properties: {
        winner: { type: import_genai.Type.STRING },
        loser: { type: import_genai.Type.STRING },
        logs: {
          type: import_genai.Type.ARRAY,
          items: {
            type: import_genai.Type.OBJECT,
            properties: {
              turn: { type: import_genai.Type.INTEGER },
              attacker: { type: import_genai.Type.STRING },
              action: { type: import_genai.Type.STRING, description: "What move/spell they used, matching their class. E.g. 'Casts Lava Font under the fire hydrant'" },
              roll: { type: import_genai.Type.INTEGER, description: "The D20 roll" },
              damage: { type: import_genai.Type.INTEGER },
              narrative: { type: import_genai.Type.STRING, description: "Narrative of how the attack played out in real height and depth." }
            },
            required: ["turn", "attacker", "action", "roll", "damage", "narrative"]
          }
        }
      },
      required: ["winner", "loser", "logs"]
    };
    if (!ai) {
      const name2 = player2?.name || "Mist-Revenant Sentry";
      const logs = [
        {
          turn: 1,
          attacker: player1.name,
          action: `Initiated standard ${player1.profession} tactical sweep in ${locationDetails || "Aether-hub"}`,
          roll: 14,
          damage: 25,
          narrative: `${player1.name} used their surrounding environment to execute a high-resonance surprise maneuver! ${name2} didn't detect the stealth wave.`
        },
        {
          turn: 2,
          attacker: name2,
          action: "Summoned Spectral Mist Barrier",
          roll: 8,
          damage: 12,
          narrative: `${name2} retaliated by focusing physical energy through the pavement grids, dealing minor feedback damage.`
        },
        {
          turn: 3,
          attacker: player1.name,
          action: "Activated Primary Level skill overdrive",
          roll: 19,
          damage: 42,
          narrative: `${player1.name} rolled an epic 19 check, landing an overcharged kinetic pulse that shattered the Sentries' code structure entirely!`
        }
      ];
      return res.json({ winner: player1.name, loser: name2, logs });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: instructions,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });
    try {
      res.json(JSON.parse(response.text || "{}"));
    } catch {
      res.status(500).json({ error: "Failed to fully parse computed duel simulation." });
    }
  } catch (err) {
    console.error("Arena duel crashed:", err);
    res.status(500).json({ error: "Combat grid synchronization collapsed." });
  }
});
async function bootstrapServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[GW3-IRL] Server fully functional at port ${PORT}`);
  });
}
bootstrapServer();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
