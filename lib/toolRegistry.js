import * as allTools from "../tools/index.js";
import { toOpenAITool } from "../utils/func-tool.js";

const toolList = Object.values(allTools);

export const tools = toolList.map(toOpenAITool);

export const AVAILABLE_TOOLS = Object.fromEntries(
  toolList.map((t) => [t.name, t.fn]),
);
