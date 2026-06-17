import { z } from "zod";
import { defineTool } from "../utils/func-tool.js";

const YOUBIKE_API =
  "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json";

async function getYoubikeByDistrict({
  district,
  min_rent = 1,
  limit = 5,
}) {
  const res = await fetch(YOUBIKE_API);
  if (!res.ok) {
    return { error: `YouBike API 錯誤：HTTP ${res.status}` };
  }

  const data = await res.json();
  const normalized = district.trim();

  if (normalized === "台北市" || normalized === "台北") {
    return {
      error:
        "請使用台北市「行政區」名稱查詢（如大安區、信義區），不要只傳「台北市」。",
    };
  }

  const stations = data
    .filter((s) => s.act === "1")
    .filter((s) => s.sarea === normalized || String(s.sarea).includes(normalized))
    .filter((s) => Number(s.available_rent_bikes) >= min_rent)
    .map((s) => ({
      name: String(s.sna).replace(/^YouBike2\.0_/, ""),
      district: s.sarea,
      address: s.ar,
      available_rent: s.available_rent_bikes,
      available_return: s.available_return_bikes,
    }))
    .slice(0, limit);

  if (stations.length === 0) {
    return {
      error: `在「${normalized}」找不到可借 YouBike 的站點，請確認行政區名稱（例：信義區、大安區）。`,
    };
  }

  return {
    district: normalized,
    station_count: stations.length,
    stations,
  };
}

export const youbikeDistrictTool = defineTool({
  name: "get_youbike_by_district",
  description:
    "依台北市行政區名稱查詢 YouBike 2.0 可借車站點（使用開放資料，不需 API Key）。參數 district 請填如大安區、信義區，勿填台北市。",
  fn: getYoubikeByDistrict,
  parameters: z.object({
    district: z.string().describe("台北市行政區名稱，例如：信義區、大安區"),
    min_rent: z
      .number()
      .default(1)
      .describe("至少可借車數，預設 1"),
    limit: z.number().default(5).describe("最多回傳幾站，預設 5"),
  }),
});
