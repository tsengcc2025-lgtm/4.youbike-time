import { client, DEFAULT_MODEL } from "./openai.js";
import { tools, AVAILABLE_TOOLS } from "./toolRegistry.js";
import { spinner } from "../utils/spinner.js";

const SYSTEM_PROMPT = `你是台北生活小助手，請用繁體中文回答。
你可以使用以下工具：
- get_current_time：回答現在台灣時間
- get_youbike_by_district：依「行政區」查 YouBike 可借站點（例如信義區、大安區；不要只用「台北市」查詢）

使用者同時問時間與 YouBike 時，請依需要呼叫一個或多個工具，再整合成清楚回答。`;

export class ChatManager {
  constructor() {
    this.messages = [{ role: "developer", content: SYSTEM_PROMPT }];
  }

  async handleUserMessage(userText) {
    this.messages.push({ role: "user", content: userText });

    while (true) {
      const spin = spinner("思考中...").start();

      const response = await client.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: this.messages,
        tools,
        tool_choice: "auto",
      });

      spin.stop();

      const message = response.choices[0].message;
      this.messages.push(message);

      if (!message.tool_calls?.length) {
        return message.content ?? "";
      }

      for (const toolCall of message.tool_calls) {
        const fnName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        console.log(`\n[呼叫 tool] ${fnName}(${JSON.stringify(args)})`);

        const fn = AVAILABLE_TOOLS[fnName];
        const result = fn ? await fn(args) : { error: `未知工具：${fnName}` };

        this.messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
    }
  }
}
