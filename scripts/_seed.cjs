const fs = require('fs');
const items = [
  {
    id: "aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa",
    status: "pending",
    created_at: "2026-10-28",
    confidence: 0.6,
    source: { type: "bilibili", url: "https://github.com/acme/industrial-ui", upstream: "40238601", video: "BV1A" },
    upstream_name: "UP-A",
    video_title: "工业风控制台 UI 复刻",
    name: "工业控制台",
    candidate: { name: "工业控制台", project_tags: ["industrial", "technical"], frontend_prompt: "零圆角 + 1px 描边。" },
    color_direction: { temperature: "cool", saturation: "muted", contrast: "high", semantic_hint: "冷灰高对比，接近工业控制台" },
    reasoning: "README 里明确写了零圆角与 1px 描边",
    notes: "",
    raw_response: '{"name":"工业控制台","color_direction":{"temperature":"cool"}}'
  },
  {
    id: "bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb",
    status: "pending",
    created_at: "2026-10-28",
    confidence: 0.3,
    source: { type: "bilibili", url: "", upstream: "35328143", video: "BV1B" },
    upstream_name: "UP-B",
    video_title: "聊聊最近的设计趋势",
    name: "聊聊最近的设计趋势",
    candidate: { name: "聊聊最近的设计趋势" },
    color_direction: null,
    reasoning: "",
    notes: "无 GitHub 链接",
    raw_response: ""
  }
];
fs.writeFileSync('data/pending.json', JSON.stringify(items, null, 2) + '\n', 'utf8');
console.log('seeded', fs.readFileSync('data/pending.json').subarray(0, 3));
