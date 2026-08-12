const BUILDER_TITLES: Record<string, string> = {
  "frontend":    "Pixel Whisperer 🎨",
  "react":       "Component Architect 🧱",
  "vue":         "Vue Voyager ⚡",
  "backend":     "Backend Barbarian ⚔️",
  "full stack":  "Fullstack Sorcerer 🧙",
  "fullstack":   "Fullstack Sorcerer 🧙",
  "ai":          "Gradient Descender 📉",
  "ml":          "Loss Minimizer 🧮",
  "llm":         "Token Economist 🪙",
  "devops":      "Cloud Shepherd ☁️",
  "platform":    "Infra Overlord 🏗️",
  "ios":         "Swift Samurai 🗡️",
  "android":     "Kotlin Conjurer 🔮",
  "design":      "UX Visionary ✨",
  "product":     "Roadmap Oracle 🗺️",
  "data":        "Data Druid 🌲",
  "security":    "Bug Slayer 🐛",
  "blockchain":  "Chain Maximalist ⛓️",
  "web3":        "Degen Deployed 🎲",
  "founder":     "Ship or Die Captain 🚢",
  "growth":      "Retention Wizard 📈",
  "dx":          "Developer Whisperer 🎙️",
  "solidity":    "EVM Enchanter 🔮",
  "rust":        "Borrow Checker Slayer 🦀",
  "python":      "Bytecode Wrangler 🐍"
};

export function getBuilderTitle(role: string = ""): string {
  const lower = role.toLowerCase().trim();
  if (!lower) return "Builder Extraordinaire 🚀";

  for (const [key, title] of Object.entries(BUILDER_TITLES)) {
    if (lower.includes(key)) return title;
  }

  // Fallback based on words
  if (lower.includes("lead") || lower.includes("head") || lower.includes("cto")) {
    return "Tech Maestro 🎯";
  }

  return "Hacker Extraordinaire 🚀";
}
