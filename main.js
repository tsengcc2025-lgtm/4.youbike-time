import { input } from "@inquirer/prompts";
import { OPENAI_API_KEY } from "./config.js";
import { ChatManager } from "./lib/ChatManager.js";

if (!OPENAI_API_KEY) {
  console.error("請在 .env 設定 OPENAI_API_KEY");
  process.exit(1);
}

const chat = new ChatManager();

console.log("YouBike + 時間助手 — 輸入 exit 結束\n");
console.log("作業測試範例：");
console.log("  1. 現在幾點？");
console.log("  2. 信義區有 YouBike 可以借嗎？");
console.log("  3. 現在幾點？大安區還有 YouBike 可以借嗎？\n");

try {
  while (true) {
    const userQuestion = (await input({ message: "請輸入你的問題：" })).trim();

    if (userQuestion === "") continue;
    if (userQuestion.toLowerCase() === "exit") {
      console.log("再會~");
      break;
    }

    const reply = await chat.handleUserMessage(userQuestion);
    console.log(`\n${reply}\n`);
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會~");
  } else {
    throw err;
  }
}
