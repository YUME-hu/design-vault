window.__ModuleLoader__.load({
	id: "design-vault-plugin",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		// src/shared/constants.ts
		/** Package name; must equal package.json `name` (the client bundle id). */
		const NAME = "design-vault-plugin";
		/** Locale namespace owned by this plugin. */
		const NS = "design-vault-plugin";
		// src/shared/palettes.generated.ts
		/** Curated palettes, in the order they appear in the vault file. */
		const PALETTES = [
			{
				id: "washed-soft-gray",
				name: "长期洗涤 · 柔和高级灰",
				category: "washed",
				colors: [
					"#9C9CA4",
					"#778590",
					"#77839E",
					"#3F4D67"
				]
			},
			{
				id: "washed-morandi-green",
				name: "长期洗涤 · 莫兰迪绿",
				category: "washed",
				colors: [
					"#D8DCD6",
					"#90A89F",
					"#4A5752",
					"#2B312D"
				]
			},
			{
				id: "washed-klein-blue",
				name: "长期洗涤 · 克莱因蓝",
				category: "washed",
				colors: [
					"#002FA7",
					"#1A1A1A",
					"#F5F5F5"
				]
			},
			{
				id: "swiss-international",
				name: "瑞士国际 · Swiss",
				category: "classic",
				colors: [
					"#FF0000",
					"#FFFFFF",
					"#000000",
					"#4A4A4A",
					"#E5E5E5"
				]
			},
			{
				id: "brutalist-mono",
				name: "粗野黑白 · Brutalist",
				category: "classic",
				colors: [
					"#FFFFFF",
					"#111111",
					"#FF3B00",
					"#DADADA"
				]
			},
			{
				id: "bauhaus-primary",
				name: "包豪斯 · Bauhaus",
				category: "classic",
				colors: [
					"#E63946",
					"#1D3557",
					"#F1FAEE",
					"#FFB703"
				]
			},
			{
				id: "morandi-quiet",
				name: "莫兰迪 · 静物",
				category: "classic",
				colors: [
					"#B8B2A7",
					"#7F8C8D",
					"#A3B1A1",
					"#5C5346"
				]
			},
			{
				id: "cream-warmth",
				name: "奶油暖阳 · Cream",
				category: "classic",
				colors: [
					"#FDF6EC",
					"#E8DCCB",
					"#C8A97E",
					"#3D3A34"
				]
			},
			{
				id: "neon-night",
				name: "深夜霓虹 · Neon",
				category: "modern",
				colors: [
					"#0B0F1A",
					"#1B2233",
					"#4D6BFE",
					"#00E5FF"
				]
			},
			{
				id: "paper-editorial",
				name: "纸质杂志 · Paper",
				category: "classic",
				colors: [
					"#FBFBF9",
					"#E7E3DA",
					"#B9B2A4",
					"#1F1D1A"
				]
			},
			{
				id: "silicon-valley-tech",
				name: "硅谷极简科技（Silicon Valley Tech）",
				category: "modern",
				colors: [
					"#F7F8FA",
					"#D5DBE3",
					"#12161C",
					"#0A84FF"
				]
			},
			{
				id: "nagai-surf-beach",
				name: "永井博·冲浪海滩",
				category: "nagai",
				colors: [
					"#0267AD",
					"#F1D1DA",
					"#2AB4E1"
				]
			},
			{
				id: "nagai-palm-villa",
				name: "永井博·棕榈别墅",
				category: "nagai",
				colors: [
					"#005A3C",
					"#F6AEA7",
					"#00599A"
				]
			},
			{
				id: "nagai-pink-pool",
				name: "永井博·粉色泳池",
				category: "nagai",
				colors: [
					"#F68B7E",
					"#1F4D34",
					"#A7969C"
				]
			},
			{
				id: "nagai-golden-road",
				name: "永井博·金色公路",
				category: "nagai",
				colors: [
					"#FCDE63",
					"#806048",
					"#1E4E31"
				]
			},
			{
				id: "pop-flat-illustration",
				name: "波普扁平插画",
				category: "pop",
				colors: [
					"#001340",
					"#006AD0",
					"#F96700",
					"#FECC51",
					"#F92301"
				]
			},
			{
				id: "jewel-poseidon",
				name: "珠宝·波塞冬",
				category: "jewel",
				colors: [
					"#1F2228",
					"#374EA3",
					"#F3F3F3"
				]
			},
			{
				id: "jewel-spectrolite",
				name: "珠宝·光谱石",
				category: "jewel",
				colors: [
					"#838FDA",
					"#59A2E6",
					"#DDDDDF"
				]
			},
			{
				id: "jewel-rainbow-bridge",
				name: "珠宝·彩虹桥",
				category: "jewel",
				colors: [
					"#70CEC6",
					"#E9B762",
					"#F3F3F3"
				]
			},
			{
				id: "jewel-star-movement",
				name: "珠宝·星动项链",
				category: "jewel",
				colors: [
					"#D48851",
					"#FFC5A2",
					"#F3F3F3"
				]
			},
			{
				id: "jewel-dragon-slayer",
				name: "珠宝·屠龙手链",
				category: "jewel",
				colors: [
					"#515930",
					"#6A1300",
					"#EAE8E9"
				]
			},
			{
				id: "jewel-macaron",
				name: "珠宝·珍宝珠",
				category: "jewel",
				colors: [
					"#ECD1BB",
					"#CADAE8",
					"#F5C6CE"
				]
			},
			{
				id: "jewel-horus",
				name: "珠宝·荷鲁斯",
				category: "jewel",
				colors: [
					"#917247",
					"#CCB192",
					"#F3F3F3"
				]
			},
			{
				id: "jewel-atlantis",
				name: "珠宝·亚特兰蒂斯",
				category: "jewel",
				colors: [
					"#C0ACBA",
					"#8F98C6",
					"#F3F3F3"
				]
			},
			{
				id: "brand-coca-cola",
				name: "品牌·可口可乐",
				category: "brand",
				colors: [
					"#E50012",
					"#FFFFFF",
					"#111111"
				]
			},
			{
				id: "brand-mcdonalds",
				name: "品牌·麦当劳",
				category: "brand",
				colors: [
					"#F5B500",
					"#C62721",
					"#FFFFFF"
				]
			},
			{
				id: "brand-starbucks",
				name: "品牌·星巴克",
				category: "brand",
				colors: [
					"#007042",
					"#F3F3F3",
					"#111111"
				]
			},
			{
				id: "brand-facebook",
				name: "品牌·Facebook",
				category: "brand",
				colors: [
					"#39579F",
					"#F5F5F5",
					"#1C1E21"
				]
			},
			{
				id: "brand-hermes",
				name: "品牌·爱马仕",
				category: "brand",
				colors: [
					"#EC6C00",
					"#FFFFFF",
					"#333333"
				]
			},
			{
				id: "brand-tiffany",
				name: "品牌·蒂芙尼",
				category: "brand",
				colors: [
					"#81D8D0",
					"#FFFFFF",
					"#1A1A1A"
				]
			},
			{
				id: "brand-nissin",
				name: "品牌·统一老坛",
				category: "brand",
				colors: [
					"#6B1583",
					"#F5F5F5",
					"#FFFFFF"
				]
			}
		];
		// src/shared/visual-bank.ts
		/** Seven palette archetypes, roles already resolved to opaque HEX. */
		const BANK_PALETTES = [
			{
				id: "p-01",
				name: "Deep Void",
				mood: [
					"premium",
					"cinematic",
					"focused"
				],
				background: "#080808",
				surface: "#111111",
				border: "#1C1C1C",
				title: "#F0F0F0",
				content: "#888888",
				accent: "#FFFFFF",
				usage: "AI research, premium SaaS, editorial presentations",
				avoid: "Avoid for consumer brands, children's products, anything requiring warmth"
			},
			{
				id: "p-02",
				name: "Warm Cream",
				mood: [
					"approachable",
					"editorial",
					"human"
				],
				background: "#F7F2ED",
				surface: "#FFFFFF",
				border: "#E3DFDA",
				title: "#1A1A18",
				content: "#666666",
				accent: "#000000",
				usage: "Blogs, editorial sites, personal portfolios, coaching services",
				avoid: "Tech products, developer tools, anything signaling precision or speed"
			},
			{
				id: "p-03",
				name: "Warm Beige (Smithery tone)",
				mood: [
					"warm",
					"technical",
					"approachable"
				],
				background: "#E7E5DF",
				surface: "#F5F5F5",
				border: "#D4D2CC",
				title: "#242424",
				content: "#666666",
				accent: "#FF5500",
				usage: "AI tools, developer platforms, community products that want approachability",
				avoid: "Copy the orange directly — it's Smithery-specific. Pick a new accent."
			},
			{
				id: "p-04",
				name: "Cool Near-White",
				mood: [
					"clean",
					"systematic",
					"technical"
				],
				background: "#F5F5F5",
				surface: "#FFFFFF",
				border: "#E5E5E5",
				title: "#000000",
				content: "#666666",
				accent: "#000000",
				usage: "Design tools, portfolios, agencies with Swiss/minimal sensibility",
				avoid: "Contexts needing emotional warmth or brand differentiation from competitors"
			},
			{
				id: "p-05",
				name: "Warm Gray",
				mood: [
					"refined",
					"quiet",
					"human"
				],
				background: "#EDEDED",
				surface: "#F7F7F7",
				border: "#DADADA",
				title: "#000000",
				content: "#8F8F8F",
				accent: "#000000",
				usage: "Interaction design portfolios, minimal personal sites, subtle brand presences",
				avoid: "High-density or data-rich contexts — breathing room is mandatory"
			},
			{
				id: "p-06",
				name: "Soft Green / Organic",
				mood: [
					"natural",
					"healthy",
					"premium-consumer"
				],
				background: "#E8EFE4",
				surface: "#F5F9F3",
				border: "#D5DCD2",
				title: "#1A2416",
				content: "#5A6B52",
				accent: "#2D5A1B",
				usage: "Health, food, sustainability, wellness, premium packaged goods",
				avoid: "Tech contexts, financial services"
			},
			{
				id: "p-07",
				name: "Bold Black + Signal Accent",
				mood: [
					"bold",
					"high-contrast",
					"experimental"
				],
				background: "#000000",
				surface: "#0D0D0D",
				border: "#1F1F1F",
				title: "#FFFEF4",
				content: "#909090",
				accent: "#FF0000",
				usage: "Creative agencies, award sites, experimental portfolios, bold studios",
				avoid: "Any signal accent must be used sparingly — one per page max. Don't pair two signal colors."
			}
		];
		// src/shared/vibes.generated.ts
		/** One entry per style in the vault, keyed by a normalised name. */
		const VIBES = [
			{
				id: "nasa-punk-工业控制台",
				name: "NASA-Punk 工业控制台",
				palette: {
					primary: "#D63A2C",
					bg: "#ECE5D6",
					surface: "#FFFFFF",
					text: "#191919",
					muted: "#4C5A68",
					info: "#21467A",
					warning: "#D45814",
					sand: "#DBA972"
				}
			},
			{
				id: "novelai-prompt-studio",
				name: "NovelAI Prompt Studio",
				palette: {
					primary: "#607598",
					bg: "#F3F5F9",
					surface: "#FCFDFF",
					text: "#23272C",
					muted: "#4F5661"
				}
			},
			{
				id: "瑞士风格",
				name: "瑞士风格",
				palette: {
					primary: "#4974BA",
					bg: "#FAFCFF",
					surface: "#FCFDFF",
					text: "#0E1217",
					muted: "#414853",
					danger: "#C92F33",
					success: "#33854A"
				}
			},
			{
				id: "中性极简网页设计",
				name: "中性极简网页设计",
				palette: {
					primary: "#607598",
					bg: "#F3F5F9",
					surface: "#FCFDFF",
					text: "#23272C",
					muted: "#4F5661"
				}
			},
			{
				id: "monochrome-data-editorial",
				name: "Monochrome Data Editorial",
				palette: {
					primary: "#906B52",
					bg: "#FFFBF8",
					surface: "#FFFDFC",
					text: "#16100D",
					muted: "#51453E",
					danger: "#C92F33",
					success: "#33854A"
				}
			},
			{
				id: "灰度条纹遮罩与信息感排版",
				name: "灰度条纹遮罩与信息感排版",
				palette: {
					primary: "#607598",
					bg: "#FAFCFF",
					surface: "#FCFDFF",
					text: "#0E1217",
					muted: "#414853",
					danger: "#C92F33",
					success: "#33854A"
				}
			},
			{
				id: "superopc-互动-shader-卡片",
				name: "SuperOPC 互动 shader 卡片",
				palette: {
					primary: "#4974BA",
					bg: "#F3F5F9",
					surface: "#FCFDFF",
					text: "#23272C",
					muted: "#4F5661"
				}
			},
			{
				id: "极简奢华-webgl-工作室官网",
				name: "极简奢华 WebGL 工作室官网",
				palette: {
					primary: "#906B52",
					bg: "#FFFBF8",
					surface: "#FFFDFC",
					text: "#16100D",
					muted: "#51453E",
					danger: "#C92F33",
					success: "#33854A"
				}
			},
			{
				id: "instagram-品牌感字体展示",
				name: "Instagram 品牌感字体展示",
				palette: {
					primary: "#2D6FDC",
					bg: "#FAFCFF",
					surface: "#FCFDFF",
					text: "#0E1217",
					muted: "#414853",
					danger: "#C92F33",
					success: "#33854A"
				}
			},
			{
				id: "ibm-carbon-white-主题",
				name: "IBM Carbon（White 主题）",
				palette: {
					primary: "#0F62FE",
					bg: "#FFFFFF",
					surface: "#F4F4F4",
					text: "#161616",
					muted: "#525252",
					warning: "#F1C21B",
					danger: "#DA1E28",
					success: "#24A148"
				}
			},
			{
				id: "stripe-elements-默认主题",
				name: "Stripe Elements（默认主题）",
				palette: {
					primary: "#0570DE",
					bg: "#FFFFFF",
					surface: "#FFFFFF",
					text: "#30313D",
					muted: "#E0E6EB",
					danger: "#DF1B41"
				}
			},
			{
				id: "material-3-基线-baseline-light",
				name: "Material 3 基线（Baseline Light）",
				palette: {
					primary: "#6750A4",
					bg: "#FEF7FF",
					surface: "#FFFFFF",
					text: "#1D1B20",
					muted: "#49454F",
					info: "#625B71",
					danger: "#B3261E"
				}
			},
			{
				id: "github-primer-light",
				name: "GitHub Primer（Light）",
				palette: {
					primary: "#0969DA",
					bg: "#FFFFFF",
					surface: "#F6F8FA",
					text: "#1F2328",
					muted: "#59636E",
					warning: "#9A6700",
					danger: "#CF222E",
					success: "#1A7F37"
				}
			},
			{
				id: "marathon-like-deepseek-harness-skin",
				name: "marathon-like deepseek harness skin",
				palette: {
					primary: "#2D6FDC",
					bg: "#FAFCFF",
					surface: "#FCFDFF",
					text: "#0E1217",
					muted: "#414853",
					danger: "#C92F33",
					success: "#33854A"
				}
			},
			{
				id: "终末地风格",
				name: "终末地风格",
				palette: {
					primary: "#607598",
					bg: "#FAFCFF",
					surface: "#FCFDFF",
					text: "#0E1217",
					muted: "#414853",
					danger: "#C92F33",
					success: "#33854A"
				}
			}
		];
		// src/client/clipboard.ts
		/**
		* Clipboard helper for the browser half: async clipboard first, `execCommand`
		* as the fallback for older browsers and non-secure contexts. Everything runs
		* locally; no service is involved.
		*
		* Ported from the original vault's `lib/clipboard.ts`.
		*
		* @module design-vault-plugin/client/clipboard
		*/
		/**
		* Copy `text` to the clipboard.
		*
		* @param text - the exact string to place on the clipboard.
		* @returns whether the copy succeeded.
		*/
		async function copyText(text) {
			try {
				if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
					await navigator.clipboard.writeText(text);
					return true;
				}
			} catch {}
			try {
				const textarea = document.createElement("textarea");
				textarea.value = text;
				textarea.setAttribute("readonly", "");
				textarea.style.position = "fixed";
				textarea.style.top = "-1000px";
				textarea.style.opacity = "0";
				document.body.appendChild(textarea);
				textarea.select();
				const ok = document.execCommand("copy");
				document.body.removeChild(textarea);
				return ok;
			} catch {
				return false;
			}
		}
		// src/client/palette-categories.ts
		/** Display order of the known groups. */
		const CATEGORY_ORDER = [
			"washed",
			"nagai",
			"pop",
			"jewel",
			"brand",
			"classic",
			"modern"
		];
		const CATEGORY_LABELS = {
			washed: "长期洗涤",
			nagai: "永井博 · City Pop",
			pop: "波普插画",
			jewel: "珠宝情绪",
			brand: "品牌标准色",
			classic: "经典范式",
			modern: "当代科技"
		};
		/** Label used for presets whose category is empty or unknown. */
		const UNCATEGORISED_LABEL = "未分类";
		/**
		* Bucket presets into ordered groups, dropping empty ones.
		*
		* @param presets - the generated snapshot, in vault order.
		*/
		function groupPalettes(presets) {
			const buckets = /* @__PURE__ */ new Map();
			for (const preset of presets) {
				const key = preset.category === "" ? "uncategorised" : preset.category;
				const bucket = buckets.get(key) ?? [];
				bucket.push(preset);
				buckets.set(key, bucket);
			}
			const known = new Set(CATEGORY_ORDER);
			const groups = [];
			for (const category of CATEGORY_ORDER) {
				const items = buckets.get(category);
				if (items && items.length > 0) groups.push({
					category,
					label: CATEGORY_LABELS[category] ?? category,
					items
				});
			}
			for (const [category, items] of buckets) {
				if (known.has(category)) continue;
				const label = category === "uncategorised" ? UNCATEGORISED_LABEL : CATEGORY_LABELS[category] ?? category;
				groups.push({
					category,
					label,
					items
				});
			}
			return groups;
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rgb/parseNumber.js
		const parseNumber = (color, len) => {
			if (typeof color !== "number") return;
			if (len === 3) return {
				mode: "rgb",
				r: (color >> 8 & 15 | color >> 4 & 240) / 255,
				g: (color >> 4 & 15 | color & 240) / 255,
				b: (color & 15 | color << 4 & 240) / 255
			};
			if (len === 4) return {
				mode: "rgb",
				r: (color >> 12 & 15 | color >> 8 & 240) / 255,
				g: (color >> 8 & 15 | color >> 4 & 240) / 255,
				b: (color >> 4 & 15 | color & 240) / 255,
				alpha: (color & 15 | color << 4 & 240) / 255
			};
			if (len === 6) return {
				mode: "rgb",
				r: (color >> 16 & 255) / 255,
				g: (color >> 8 & 255) / 255,
				b: (color & 255) / 255
			};
			if (len === 8) return {
				mode: "rgb",
				r: (color >> 24 & 255) / 255,
				g: (color >> 16 & 255) / 255,
				b: (color >> 8 & 255) / 255,
				alpha: (color & 255) / 255
			};
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/colors/named.js
		const named = {
			aliceblue: 15792383,
			antiquewhite: 16444375,
			aqua: 65535,
			aquamarine: 8388564,
			azure: 15794175,
			beige: 16119260,
			bisque: 16770244,
			black: 0,
			blanchedalmond: 16772045,
			blue: 255,
			blueviolet: 9055202,
			brown: 10824234,
			burlywood: 14596231,
			cadetblue: 6266528,
			chartreuse: 8388352,
			chocolate: 13789470,
			coral: 16744272,
			cornflowerblue: 6591981,
			cornsilk: 16775388,
			crimson: 14423100,
			cyan: 65535,
			darkblue: 139,
			darkcyan: 35723,
			darkgoldenrod: 12092939,
			darkgray: 11119017,
			darkgreen: 25600,
			darkgrey: 11119017,
			darkkhaki: 12433259,
			darkmagenta: 9109643,
			darkolivegreen: 5597999,
			darkorange: 16747520,
			darkorchid: 10040012,
			darkred: 9109504,
			darksalmon: 15308410,
			darkseagreen: 9419919,
			darkslateblue: 4734347,
			darkslategray: 3100495,
			darkslategrey: 3100495,
			darkturquoise: 52945,
			darkviolet: 9699539,
			deeppink: 16716947,
			deepskyblue: 49151,
			dimgray: 6908265,
			dimgrey: 6908265,
			dodgerblue: 2003199,
			firebrick: 11674146,
			floralwhite: 16775920,
			forestgreen: 2263842,
			fuchsia: 16711935,
			gainsboro: 14474460,
			ghostwhite: 16316671,
			gold: 16766720,
			goldenrod: 14329120,
			gray: 8421504,
			green: 32768,
			greenyellow: 11403055,
			grey: 8421504,
			honeydew: 15794160,
			hotpink: 16738740,
			indianred: 13458524,
			indigo: 4915330,
			ivory: 16777200,
			khaki: 15787660,
			lavender: 15132410,
			lavenderblush: 16773365,
			lawngreen: 8190976,
			lemonchiffon: 16775885,
			lightblue: 11393254,
			lightcoral: 15761536,
			lightcyan: 14745599,
			lightgoldenrodyellow: 16448210,
			lightgray: 13882323,
			lightgreen: 9498256,
			lightgrey: 13882323,
			lightpink: 16758465,
			lightsalmon: 16752762,
			lightseagreen: 2142890,
			lightskyblue: 8900346,
			lightslategray: 7833753,
			lightslategrey: 7833753,
			lightsteelblue: 11584734,
			lightyellow: 16777184,
			lime: 65280,
			limegreen: 3329330,
			linen: 16445670,
			magenta: 16711935,
			maroon: 8388608,
			mediumaquamarine: 6737322,
			mediumblue: 205,
			mediumorchid: 12211667,
			mediumpurple: 9662683,
			mediumseagreen: 3978097,
			mediumslateblue: 8087790,
			mediumspringgreen: 64154,
			mediumturquoise: 4772300,
			mediumvioletred: 13047173,
			midnightblue: 1644912,
			mintcream: 16121850,
			mistyrose: 16770273,
			moccasin: 16770229,
			navajowhite: 16768685,
			navy: 128,
			oldlace: 16643558,
			olive: 8421376,
			olivedrab: 7048739,
			orange: 16753920,
			orangered: 16729344,
			orchid: 14315734,
			palegoldenrod: 15657130,
			palegreen: 10025880,
			paleturquoise: 11529966,
			palevioletred: 14381203,
			papayawhip: 16773077,
			peachpuff: 16767673,
			peru: 13468991,
			pink: 16761035,
			plum: 14524637,
			powderblue: 11591910,
			purple: 8388736,
			rebeccapurple: 6697881,
			red: 16711680,
			rosybrown: 12357519,
			royalblue: 4286945,
			saddlebrown: 9127187,
			salmon: 16416882,
			sandybrown: 16032864,
			seagreen: 3050327,
			seashell: 16774638,
			sienna: 10506797,
			silver: 12632256,
			skyblue: 8900331,
			slateblue: 6970061,
			slategray: 7372944,
			slategrey: 7372944,
			snow: 16775930,
			springgreen: 65407,
			steelblue: 4620980,
			tan: 13808780,
			teal: 32896,
			thistle: 14204888,
			tomato: 16737095,
			turquoise: 4251856,
			violet: 15631086,
			wheat: 16113331,
			white: 16777215,
			whitesmoke: 16119285,
			yellow: 16776960,
			yellowgreen: 10145074
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rgb/parseNamed.js
		const parseNamed = (color) => {
			return parseNumber(named[color.toLowerCase()], 6);
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rgb/parseHex.js
		const hex = /^#?([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})$/i;
		const parseHex = (color) => {
			let match;
			return (match = color.match(hex)) ? parseNumber(parseInt(match[1], 16), match[1].length) : void 0;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/util/regex.js
		const num$1 = "([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)";
		const per = `${num$1}%`;
		const num_per = `(?:${num$1}%|${num$1})`;
		const num_per_none = `(?:${num$1}%|${num$1}|none)`;
		const hue$1 = `(?:${num$1}(deg|grad|rad|turn)|${num$1})`;
		const c = `\\s*,\\s*`;
		new RegExp("^" + num_per_none + "$");
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rgb/parseRgbLegacy.js
		const rgb_num_old = new RegExp(`^rgba?\\(\\s*${num$1}${c}${num$1}${c}${num$1}\\s*(?:,\\s*${num_per}\\s*)?\\)$`);
		const rgb_per_old = new RegExp(`^rgba?\\(\\s*${per}${c}${per}${c}${per}\\s*(?:,\\s*${num_per}\\s*)?\\)$`);
		const parseRgbLegacy = (color) => {
			let res = { mode: "rgb" };
			let match;
			if (match = color.match(rgb_num_old)) {
				if (match[1] !== void 0) res.r = match[1] / 255;
				if (match[2] !== void 0) res.g = match[2] / 255;
				if (match[3] !== void 0) res.b = match[3] / 255;
			} else if (match = color.match(rgb_per_old)) {
				if (match[1] !== void 0) res.r = match[1] / 100;
				if (match[2] !== void 0) res.g = match[2] / 100;
				if (match[3] !== void 0) res.b = match[3] / 100;
			} else return;
			if (match[4] !== void 0) res.alpha = Math.max(0, Math.min(1, match[4] / 100));
			else if (match[5] !== void 0) res.alpha = Math.max(0, Math.min(1, +match[5]));
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/_prepare.js
		const prepare = (color, mode) => color === void 0 ? void 0 : typeof color !== "object" ? parse(color) : color.mode !== void 0 ? color : mode ? {
			...color,
			mode
		} : void 0;
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/converter.js
		const converter = (target_mode = "rgb") => (color) => (color = prepare(color, target_mode)) !== void 0 ? color.mode === target_mode ? color : converters[color.mode][target_mode] ? converters[color.mode][target_mode](color) : target_mode === "rgb" ? converters[color.mode].rgb(color) : converters.rgb[target_mode](converters[color.mode].rgb(color)) : void 0;
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/modes.js
		const converters = {};
		const modes = {};
		const parsers = [];
		const colorProfiles = {};
		const identity = (v) => v;
		const useMode = (definition) => {
			converters[definition.mode] = {
				...converters[definition.mode],
				...definition.toMode
			};
			Object.keys(definition.fromMode || {}).forEach((k) => {
				if (!converters[k]) converters[k] = {};
				converters[k][definition.mode] = definition.fromMode[k];
			});
			if (!definition.ranges) definition.ranges = {};
			if (!definition.difference) definition.difference = {};
			definition.channels.forEach((channel) => {
				if (definition.ranges[channel] === void 0) definition.ranges[channel] = [0, 1];
				if (!definition.interpolate[channel]) throw new Error(`Missing interpolator for: ${channel}`);
				if (typeof definition.interpolate[channel] === "function") definition.interpolate[channel] = { use: definition.interpolate[channel] };
				if (!definition.interpolate[channel].fixup) definition.interpolate[channel].fixup = identity;
			});
			modes[definition.mode] = definition;
			(definition.parse || []).forEach((parser) => {
				useParser(parser, definition.mode);
			});
			return converter(definition.mode);
		};
		const getMode = (mode) => modes[mode];
		const useParser = (parser, mode) => {
			if (typeof parser === "string") {
				if (!mode) throw new Error(`'mode' required when 'parser' is a string`);
				colorProfiles[parser] = mode;
			} else if (typeof parser === "function") {
				if (parsers.indexOf(parser) < 0) parsers.push(parser);
			}
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/parse.js
		const IdentStartCodePoint = /[^\x00-\x7F]|[a-zA-Z_]/;
		const IdentCodePoint = /[^\x00-\x7F]|[-\w]/;
		const Tok = {
			Function: "function",
			Ident: "ident",
			Number: "number",
			Percentage: "percentage",
			ParenClose: ")",
			None: "none",
			Hue: "hue",
			Alpha: "alpha"
		};
		let _i = 0;
		function is_num(chars) {
			let ch = chars[_i];
			let ch1 = chars[_i + 1];
			if (ch === "-" || ch === "+") return /\d/.test(ch1) || ch1 === "." && /\d/.test(chars[_i + 2]);
			if (ch === ".") return /\d/.test(ch1);
			return /\d/.test(ch);
		}
		function is_ident(chars) {
			if (_i >= chars.length) return false;
			let ch = chars[_i];
			if (IdentStartCodePoint.test(ch)) return true;
			if (ch === "-") {
				if (chars.length - _i < 2) return false;
				let ch1 = chars[_i + 1];
				if (ch1 === "-" || IdentStartCodePoint.test(ch1)) return true;
				return false;
			}
			return false;
		}
		const huenits = {
			deg: 1,
			rad: 180 / Math.PI,
			grad: 9 / 10,
			turn: 360
		};
		function num(chars) {
			let value = "";
			if (chars[_i] === "-" || chars[_i] === "+") value += chars[_i++];
			value += digits(chars);
			if (chars[_i] === "." && /\d/.test(chars[_i + 1])) value += chars[_i++] + digits(chars);
			if (chars[_i] === "e" || chars[_i] === "E") {
				if ((chars[_i + 1] === "-" || chars[_i + 1] === "+") && /\d/.test(chars[_i + 2])) value += chars[_i++] + chars[_i++] + digits(chars);
				else if (/\d/.test(chars[_i + 1])) value += chars[_i++] + digits(chars);
			}
			if (is_ident(chars)) {
				let id = ident(chars);
				if (id === "deg" || id === "rad" || id === "turn" || id === "grad") return {
					type: Tok.Hue,
					value: value * huenits[id]
				};
				return;
			}
			if (chars[_i] === "%") {
				_i++;
				return {
					type: Tok.Percentage,
					value: +value
				};
			}
			return {
				type: Tok.Number,
				value: +value
			};
		}
		function digits(chars) {
			let v = "";
			while (/\d/.test(chars[_i])) v += chars[_i++];
			return v;
		}
		function ident(chars) {
			let v = "";
			while (_i < chars.length && IdentCodePoint.test(chars[_i])) v += chars[_i++];
			return v;
		}
		function identlike(chars) {
			let v = ident(chars);
			if (chars[_i] === "(") {
				_i++;
				return {
					type: Tok.Function,
					value: v
				};
			}
			if (v === "none") return {
				type: Tok.None,
				value: void 0
			};
			return {
				type: Tok.Ident,
				value: v
			};
		}
		function tokenize(str = "") {
			let chars = str.trim();
			let tokens = [];
			let ch;
			_i = 0;
			while (_i < chars.length) {
				ch = chars[_i++];
				if (ch === "\n" || ch === "	" || ch === " ") {
					while (_i < chars.length && (chars[_i] === "\n" || chars[_i] === "	" || chars[_i] === " ")) _i++;
					continue;
				}
				if (ch === ",") return;
				if (ch === ")") {
					tokens.push({ type: Tok.ParenClose });
					continue;
				}
				if (ch === "+") {
					_i--;
					if (is_num(chars)) {
						tokens.push(num(chars));
						continue;
					}
					return;
				}
				if (ch === "-") {
					_i--;
					if (is_num(chars)) {
						tokens.push(num(chars));
						continue;
					}
					if (is_ident(chars)) {
						tokens.push({
							type: Tok.Ident,
							value: ident(chars)
						});
						continue;
					}
					return;
				}
				if (ch === ".") {
					_i--;
					if (is_num(chars)) {
						tokens.push(num(chars));
						continue;
					}
					return;
				}
				if (ch === "/") {
					while (_i < chars.length && (chars[_i] === "\n" || chars[_i] === "	" || chars[_i] === " ")) _i++;
					let alpha;
					if (is_num(chars)) {
						alpha = num(chars);
						if (alpha.type !== Tok.Hue) {
							tokens.push({
								type: Tok.Alpha,
								value: alpha
							});
							continue;
						}
					}
					if (is_ident(chars)) {
						if (ident(chars) === "none") {
							tokens.push({
								type: Tok.Alpha,
								value: {
									type: Tok.None,
									value: void 0
								}
							});
							continue;
						}
					}
					return;
				}
				if (/\d/.test(ch)) {
					_i--;
					tokens.push(num(chars));
					continue;
				}
				if (IdentStartCodePoint.test(ch)) {
					_i--;
					tokens.push(identlike(chars));
					continue;
				}
				return;
			}
			return tokens;
		}
		function parseColorSyntax(tokens) {
			tokens._i = 0;
			let token = tokens[tokens._i++];
			if (!token || token.type !== Tok.Function || token.value !== "color") return;
			token = tokens[tokens._i++];
			if (token.type !== Tok.Ident) return;
			const mode = colorProfiles[token.value];
			if (!mode) return;
			const res = { mode };
			const coords = consumeCoords(tokens, false);
			if (!coords) return;
			const channels = getMode(mode).channels;
			for (let ii = 0, c, ch; ii < channels.length; ii++) {
				c = coords[ii];
				ch = channels[ii];
				if (c.type !== Tok.None) {
					res[ch] = c.type === Tok.Number ? c.value : c.value / 100;
					if (ch === "alpha") res[ch] = Math.max(0, Math.min(1, res[ch]));
				}
			}
			return res;
		}
		function consumeCoords(tokens, includeHue) {
			const coords = [];
			let token;
			while (tokens._i < tokens.length) {
				token = tokens[tokens._i++];
				if (token.type === Tok.None || token.type === Tok.Number || token.type === Tok.Alpha || token.type === Tok.Percentage || includeHue && token.type === Tok.Hue) {
					coords.push(token);
					continue;
				}
				if (token.type === Tok.ParenClose) {
					if (tokens._i < tokens.length) return;
					continue;
				}
				return;
			}
			if (coords.length < 3 || coords.length > 4) return;
			if (coords.length === 4) {
				if (coords[3].type !== Tok.Alpha) return;
				coords[3] = coords[3].value;
			}
			if (coords.length === 3) coords.push({
				type: Tok.None,
				value: void 0
			});
			return coords.every((c) => c.type !== Tok.Alpha) ? coords : void 0;
		}
		function parseModernSyntax(tokens, includeHue) {
			tokens._i = 0;
			let token = tokens[tokens._i++];
			if (!token || token.type !== Tok.Function) return;
			let coords = consumeCoords(tokens, includeHue);
			if (!coords) return;
			coords.unshift(token.value);
			return coords;
		}
		const parse = (color) => {
			if (typeof color !== "string") return;
			const tokens = tokenize(color);
			const parsed = tokens ? parseModernSyntax(tokens, true) : void 0;
			let result = void 0;
			let i = 0;
			let len = parsers.length;
			while (i < len) if ((result = parsers[i++](color, parsed)) !== void 0) return result;
			return tokens ? parseColorSyntax(tokens) : void 0;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rgb/parseRgb.js
		function parseRgb(color, parsed) {
			if (!parsed || parsed[0] !== "rgb" && parsed[0] !== "rgba") return;
			const res = { mode: "rgb" };
			const [, r, g, b, alpha] = parsed;
			if (r.type === Tok.Hue || g.type === Tok.Hue || b.type === Tok.Hue) return;
			if (r.type !== Tok.None) res.r = r.type === Tok.Number ? r.value / 255 : r.value / 100;
			if (g.type !== Tok.None) res.g = g.type === Tok.Number ? g.value / 255 : g.value / 100;
			if (b.type !== Tok.None) res.b = b.type === Tok.Number ? b.value / 255 : b.value / 100;
			if (alpha.type !== Tok.None) res.alpha = Math.min(1, Math.max(0, alpha.type === Tok.Number ? alpha.value : alpha.value / 100));
			return res;
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rgb/parseTransparent.js
		const parseTransparent = (c) => c === "transparent" ? {
			mode: "rgb",
			r: 0,
			g: 0,
			b: 0,
			alpha: 0
		} : void 0;
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/interpolate/lerp.js
		const lerp = (a, b, t) => a + t * (b - a);
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/interpolate/piecewise.js
		const get_classes = (arr) => {
			let classes = [];
			for (let i = 0; i < arr.length - 1; i++) {
				let a = arr[i];
				let b = arr[i + 1];
				if (a === void 0 && b === void 0) classes.push(void 0);
				else if (a !== void 0 && b !== void 0) classes.push([a, b]);
				else classes.push(a !== void 0 ? [a, a] : [b, b]);
			}
			return classes;
		};
		const interpolatorPiecewise = (interpolator) => (arr) => {
			let classes = get_classes(arr);
			return (t) => {
				let cls = t * classes.length;
				let idx = t >= 1 ? classes.length - 1 : Math.max(Math.floor(cls), 0);
				let pair = classes[idx];
				return pair === void 0 ? void 0 : interpolator(pair[0], pair[1], cls - idx);
			};
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/interpolate/linear.js
		const interpolatorLinear = interpolatorPiecewise(lerp);
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/fixup/alpha.js
		const fixupAlpha = (arr) => {
			let some_defined = false;
			let res = arr.map((v) => {
				if (v !== void 0) {
					some_defined = true;
					return v;
				}
				return 1;
			});
			return some_defined ? res : arr;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rgb/definition.js
		const definition$27 = {
			mode: "rgb",
			channels: [
				"r",
				"g",
				"b",
				"alpha"
			],
			parse: [
				parseRgb,
				parseHex,
				parseRgbLegacy,
				parseNamed,
				parseTransparent,
				"srgb"
			],
			serialize: "srgb",
			interpolate: {
				r: interpolatorLinear,
				g: interpolatorLinear,
				b: interpolatorLinear,
				alpha: {
					use: interpolatorLinear,
					fixup: fixupAlpha
				}
			},
			gamut: true,
			white: {
				r: 1,
				g: 1,
				b: 1
			},
			black: {
				r: 0,
				g: 0,
				b: 0
			}
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/a98/convertA98ToXyz65.js
		const linearize$2 = (v = 0) => Math.pow(Math.abs(v), 563 / 256) * Math.sign(v);
		const convertA98ToXyz65 = (a98) => {
			let r = linearize$2(a98.r);
			let g = linearize$2(a98.g);
			let b = linearize$2(a98.b);
			let res = {
				mode: "xyz65",
				x: .5766690429101305 * r + .1855582379065463 * g + .1882286462349947 * b,
				y: .297344975250536 * r + .6273635662554661 * g + .0752914584939979 * b,
				z: .0270313613864123 * r + .0706888525358272 * g + .9913375368376386 * b
			};
			if (a98.alpha !== void 0) res.alpha = a98.alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/a98/convertXyz65ToA98.js
		const gamma$2 = (v) => Math.pow(Math.abs(v), 256 / 563) * Math.sign(v);
		const convertXyz65ToA98 = ({ x, y, z, alpha }) => {
			if (x === void 0) x = 0;
			if (y === void 0) y = 0;
			if (z === void 0) z = 0;
			let res = {
				mode: "a98",
				r: gamma$2(x * 2.0415879038107465 - y * .5650069742788597 - .3447313507783297 * z),
				g: gamma$2(x * -.9692436362808798 + y * 1.8759675015077206 + .0415550574071756 * z),
				b: gamma$2(x * .0134442806320312 - y * .1183623922310184 + 1.0151749943912058 * z)
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lrgb/convertRgbToLrgb.js
		const fn$3 = (c = 0) => {
			const abs = Math.abs(c);
			if (abs <= .04045) return c / 12.92;
			return (Math.sign(c) || 1) * Math.pow((abs + .055) / 1.055, 2.4);
		};
		const convertRgbToLrgb = ({ r, g, b, alpha }) => {
			let res = {
				mode: "lrgb",
				r: fn$3(r),
				g: fn$3(g),
				b: fn$3(b)
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz65/convertRgbToXyz65.js
		const convertRgbToXyz65 = (rgb) => {
			let { r, g, b, alpha } = convertRgbToLrgb(rgb);
			let res = {
				mode: "xyz65",
				x: .4123907992659593 * r + .357584339383878 * g + .1804807884018343 * b,
				y: .2126390058715102 * r + .715168678767756 * g + .0721923153607337 * b,
				z: .0193308187155918 * r + .119194779794626 * g + .9505321522496607 * b
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lrgb/convertLrgbToRgb.js
		const fn$2 = (c = 0) => {
			const abs = Math.abs(c);
			if (abs > .0031308) return (Math.sign(c) || 1) * (1.055 * Math.pow(abs, 1 / 2.4) - .055);
			return c * 12.92;
		};
		const convertLrgbToRgb = ({ r, g, b, alpha }, mode = "rgb") => {
			let res = {
				mode,
				r: fn$2(r),
				g: fn$2(g),
				b: fn$2(b)
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz65/convertXyz65ToRgb.js
		const convertXyz65ToRgb = ({ x, y, z, alpha }) => {
			if (x === void 0) x = 0;
			if (y === void 0) y = 0;
			if (z === void 0) z = 0;
			let res = convertLrgbToRgb({
				r: x * 3.2409699419045226 - y * 1.537383177570094 - .4986107602930034 * z,
				g: x * -.9692436362808796 + y * 1.8759675015077204 + .0415550574071756 * z,
				b: x * .0556300796969936 - y * .2039769588889765 + 1.0569715142428784 * z
			});
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/a98/definition.js
		const definition$26 = {
			...definition$27,
			mode: "a98",
			parse: ["a98-rgb"],
			serialize: "a98-rgb",
			fromMode: {
				rgb: (color) => convertXyz65ToA98(convertRgbToXyz65(color)),
				xyz65: convertXyz65ToA98
			},
			toMode: {
				rgb: (color) => convertXyz65ToRgb(convertA98ToXyz65(color)),
				xyz65: convertA98ToXyz65
			}
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/util/normalizeHue.js
		const normalizeHue = (hue) => (hue = hue % 360) < 0 ? hue + 360 : hue;
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/fixup/hue.js
		const hue = (hues, fn) => {
			return hues.map((hue, idx, arr) => {
				if (hue === void 0) return hue;
				let normalized = normalizeHue(hue);
				if (idx === 0 || hues[idx - 1] === void 0) return normalized;
				return fn(normalized - normalizeHue(arr[idx - 1]));
			}).reduce((acc, curr) => {
				if (!acc.length || curr === void 0 || acc[acc.length - 1] === void 0) {
					acc.push(curr);
					return acc;
				}
				acc.push(curr + acc[acc.length - 1]);
				return acc;
			}, []);
		};
		const fixupHueShorter = (arr) => hue(arr, (d) => Math.abs(d) <= 180 ? d : d - 360 * Math.sign(d));
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/cubehelix/constants.js
		const M = [
			-.14861,
			1.78277,
			-.29227,
			-.90649,
			1.97294,
			0
		];
		const degToRad = Math.PI / 180;
		const radToDeg = 180 / Math.PI;
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/cubehelix/convertRgbToCubehelix.js
		let DE = M[3] * M[4];
		let BE = M[1] * M[4];
		let BCAD = M[1] * M[2] - M[0] * M[3];
		const convertRgbToCubehelix = ({ r, g, b, alpha }) => {
			if (r === void 0) r = 0;
			if (g === void 0) g = 0;
			if (b === void 0) b = 0;
			let l = (BCAD * b + r * DE - g * BE) / (BCAD + DE - BE);
			let x = b - l;
			let y = (M[4] * (g - l) - M[2] * x) / M[3];
			let res = {
				mode: "cubehelix",
				l,
				s: l === 0 || l === 1 ? void 0 : Math.sqrt(x * x + y * y) / (M[4] * l * (1 - l))
			};
			if (res.s) res.h = Math.atan2(y, x) * radToDeg - 120;
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/cubehelix/convertCubehelixToRgb.js
		const convertCubehelixToRgb = ({ h, s, l, alpha }) => {
			let res = { mode: "rgb" };
			h = (h === void 0 ? 0 : h + 120) * degToRad;
			if (l === void 0) l = 0;
			let amp = s === void 0 ? 0 : s * l * (1 - l);
			let cosh = Math.cos(h);
			let sinh = Math.sin(h);
			res.r = l + amp * (M[0] * cosh + M[1] * sinh);
			res.g = l + amp * (M[2] * cosh + M[3] * sinh);
			res.b = l + amp * (M[4] * cosh + M[5] * sinh);
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/difference.js
		const differenceHueSaturation = (std, smp) => {
			if (std.h === void 0 || smp.h === void 0 || !std.s || !smp.s) return 0;
			let std_h = normalizeHue(std.h);
			let smp_h = normalizeHue(smp.h);
			let dH = Math.sin((smp_h - std_h + 360) / 2 * Math.PI / 180);
			return 2 * Math.sqrt(std.s * smp.s) * dH;
		};
		const differenceHueNaive = (std, smp) => {
			if (std.h === void 0 || smp.h === void 0) return 0;
			let std_h = normalizeHue(std.h);
			let smp_h = normalizeHue(smp.h);
			if (Math.abs(smp_h - std_h) > 180) return std_h - (smp_h - 360 * Math.sign(smp_h - std_h));
			return smp_h - std_h;
		};
		const differenceHueChroma = (std, smp) => {
			if (std.h === void 0 || smp.h === void 0 || !std.c || !smp.c) return 0;
			let std_h = normalizeHue(std.h);
			let smp_h = normalizeHue(smp.h);
			let dH = Math.sin((smp_h - std_h + 360) / 2 * Math.PI / 180);
			return 2 * Math.sqrt(std.c * smp.c) * dH;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/average.js
		const averageAngle = (val) => {
			let sum = val.reduce((sum, val) => {
				if (val !== void 0) {
					let rad = val * Math.PI / 180;
					sum.sin += Math.sin(rad);
					sum.cos += Math.cos(rad);
				}
				return sum;
			}, {
				sin: 0,
				cos: 0
			});
			let angle = Math.atan2(sum.sin, sum.cos) * 180 / Math.PI;
			return angle < 0 ? 360 + angle : angle;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/cubehelix/definition.js
		const definition$25 = {
			mode: "cubehelix",
			channels: [
				"h",
				"s",
				"l",
				"alpha"
			],
			parse: ["--cubehelix"],
			serialize: "--cubehelix",
			ranges: {
				h: [0, 360],
				s: [0, 4.614],
				l: [0, 1]
			},
			fromMode: { rgb: convertRgbToCubehelix },
			toMode: { rgb: convertCubehelixToRgb },
			interpolate: {
				h: {
					use: interpolatorLinear,
					fixup: fixupHueShorter
				},
				s: interpolatorLinear,
				l: interpolatorLinear,
				alpha: {
					use: interpolatorLinear,
					fixup: fixupAlpha
				}
			},
			difference: { h: differenceHueSaturation },
			average: { h: averageAngle }
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lch/convertLabToLch.js
		const convertLabToLch = ({ l, a, b, alpha }, mode = "lch") => {
			if (a === void 0) a = 0;
			if (b === void 0) b = 0;
			let c = Math.sqrt(a * a + b * b);
			let res = {
				mode,
				l,
				c
			};
			if (c) res.h = normalizeHue(Math.atan2(b, a) * 180 / Math.PI);
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lch/convertLchToLab.js
		const convertLchToLab = ({ l, c, h, alpha }, mode = "lab") => {
			if (h === void 0) h = 0;
			let res = {
				mode,
				l,
				a: c ? c * Math.cos(h / 180 * Math.PI) : 0,
				b: c ? c * Math.sin(h / 180 * Math.PI) : 0
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz65/constants.js
		const k$2 = Math.pow(29, 3) / Math.pow(3, 3);
		const e$2 = Math.pow(6, 3) / Math.pow(29, 3);
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/constants.js
		const D50 = {
			X: .3457 / .3585,
			Y: 1,
			Z: .2958 / .3585
		};
		const D65 = {
			X: .3127 / .329,
			Y: 1,
			Z: .3583 / .329
		};
		Math.pow(29, 3) / Math.pow(3, 3);
		Math.pow(6, 3) / Math.pow(29, 3);
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab65/convertLab65ToXyz65.js
		let fn$1 = (v) => Math.pow(v, 3) > e$2 ? Math.pow(v, 3) : (116 * v - 16) / k$2;
		const convertLab65ToXyz65 = ({ l, a, b, alpha }) => {
			if (l === void 0) l = 0;
			if (a === void 0) a = 0;
			if (b === void 0) b = 0;
			let fy = (l + 16) / 116;
			let fx = a / 500 + fy;
			let fz = fy - b / 200;
			let res = {
				mode: "xyz65",
				x: fn$1(fx) * D65.X,
				y: fn$1(fy) * D65.Y,
				z: fn$1(fz) * D65.Z
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab65/convertLab65ToRgb.js
		const convertLab65ToRgb = (lab) => convertXyz65ToRgb(convertLab65ToXyz65(lab));
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab65/convertXyz65ToLab65.js
		const f$1 = (value) => value > e$2 ? Math.cbrt(value) : (k$2 * value + 16) / 116;
		const convertXyz65ToLab65 = ({ x, y, z, alpha }) => {
			if (x === void 0) x = 0;
			if (y === void 0) y = 0;
			if (z === void 0) z = 0;
			let f0 = f$1(x / D65.X);
			let f1 = f$1(y / D65.Y);
			let f2 = f$1(z / D65.Z);
			let res = {
				mode: "lab65",
				l: 116 * f1 - 16,
				a: 500 * (f0 - f1),
				b: 200 * (f1 - f2)
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab65/convertRgbToLab65.js
		const convertRgbToLab65 = (rgb) => {
			let res = convertXyz65ToLab65(convertRgbToXyz65(rgb));
			if (rgb.r === rgb.b && rgb.b === rgb.g) res.a = res.b = 0;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/dlch/constants.js
		const θ = 26 / 180 * Math.PI;
		const cosθ = Math.cos(θ);
		const sinθ = Math.sin(θ);
		const factor = 100 / Math.log(139 / 100);
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/dlch/convertDlchToLab65.js
		const convertDlchToLab65 = ({ l, c, h, alpha }) => {
			if (l === void 0) l = 0;
			if (c === void 0) c = 0;
			if (h === void 0) h = 0;
			let res = {
				mode: "lab65",
				l: (Math.exp(l * 1 / factor) - 1) / .0039
			};
			let G = (Math.exp(.0435 * c * 1 * 1) - 1) / .075;
			let e = G * Math.cos(h / 180 * Math.PI - θ);
			let f = G * Math.sin(h / 180 * Math.PI - θ);
			res.a = e * cosθ - f / .83 * sinθ;
			res.b = e * sinθ + f / .83 * cosθ;
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/dlch/convertLab65ToDlch.js
		const convertLab65ToDlch = ({ l, a, b, alpha }) => {
			if (l === void 0) l = 0;
			if (a === void 0) a = 0;
			if (b === void 0) b = 0;
			let e = a * cosθ + b * sinθ;
			let f = .83 * (b * cosθ - a * sinθ);
			let G = Math.sqrt(e * e + f * f);
			let res = {
				mode: "dlch",
				l: factor / 1 * Math.log(1 + .0039 * l),
				c: Math.log(1 + .075 * G) / .0435
			};
			if (res.c) res.h = normalizeHue((Math.atan2(f, e) + θ) / Math.PI * 180);
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/dlab/definition.js
		const convertDlabToLab65 = (c) => convertDlchToLab65(convertLabToLch(c, "dlch"));
		const convertLab65ToDlab = (c) => convertLchToLab(convertLab65ToDlch(c), "dlab");
		const definition$24 = {
			mode: "dlab",
			parse: ["--din99o-lab"],
			serialize: "--din99o-lab",
			toMode: {
				lab65: convertDlabToLab65,
				rgb: (c) => convertLab65ToRgb(convertDlabToLab65(c))
			},
			fromMode: {
				lab65: convertLab65ToDlab,
				rgb: (c) => convertLab65ToDlab(convertRgbToLab65(c))
			},
			channels: [
				"l",
				"a",
				"b",
				"alpha"
			],
			ranges: {
				l: [0, 100],
				a: [-40.09, 45.501],
				b: [-40.469, 44.344]
			},
			interpolate: {
				l: interpolatorLinear,
				a: interpolatorLinear,
				b: interpolatorLinear,
				alpha: {
					use: interpolatorLinear,
					fixup: fixupAlpha
				}
			}
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/dlch/definition.js
		const definition$23 = {
			mode: "dlch",
			parse: ["--din99o-lch"],
			serialize: "--din99o-lch",
			toMode: {
				lab65: convertDlchToLab65,
				dlab: (c) => convertLchToLab(c, "dlab"),
				rgb: (c) => convertLab65ToRgb(convertDlchToLab65(c))
			},
			fromMode: {
				lab65: convertLab65ToDlch,
				dlab: (c) => convertLabToLch(c, "dlch"),
				rgb: (c) => convertLab65ToDlch(convertRgbToLab65(c))
			},
			channels: [
				"l",
				"c",
				"h",
				"alpha"
			],
			ranges: {
				l: [0, 100],
				c: [0, 51.484],
				h: [0, 360]
			},
			interpolate: {
				l: interpolatorLinear,
				c: interpolatorLinear,
				h: {
					use: interpolatorLinear,
					fixup: fixupHueShorter
				},
				alpha: {
					use: interpolatorLinear,
					fixup: fixupAlpha
				}
			},
			difference: { h: differenceHueChroma },
			average: { h: averageAngle }
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsi/convertHsiToRgb.js
		function convertHsiToRgb({ h, s, i, alpha }) {
			h = normalizeHue(h !== void 0 ? h : 0);
			if (s === void 0) s = 0;
			if (i === void 0) i = 0;
			let f = Math.abs(h / 60 % 2 - 1);
			let res;
			switch (Math.floor(h / 60)) {
				case 0:
					res = {
						r: i * (1 + s * (3 / (2 - f) - 1)),
						g: i * (1 + s * (3 * (1 - f) / (2 - f) - 1)),
						b: i * (1 - s)
					};
					break;
				case 1:
					res = {
						r: i * (1 + s * (3 * (1 - f) / (2 - f) - 1)),
						g: i * (1 + s * (3 / (2 - f) - 1)),
						b: i * (1 - s)
					};
					break;
				case 2:
					res = {
						r: i * (1 - s),
						g: i * (1 + s * (3 / (2 - f) - 1)),
						b: i * (1 + s * (3 * (1 - f) / (2 - f) - 1))
					};
					break;
				case 3:
					res = {
						r: i * (1 - s),
						g: i * (1 + s * (3 * (1 - f) / (2 - f) - 1)),
						b: i * (1 + s * (3 / (2 - f) - 1))
					};
					break;
				case 4:
					res = {
						r: i * (1 + s * (3 * (1 - f) / (2 - f) - 1)),
						g: i * (1 - s),
						b: i * (1 + s * (3 / (2 - f) - 1))
					};
					break;
				case 5:
					res = {
						r: i * (1 + s * (3 / (2 - f) - 1)),
						g: i * (1 - s),
						b: i * (1 + s * (3 * (1 - f) / (2 - f) - 1))
					};
					break;
				default: res = {
					r: i * (1 - s),
					g: i * (1 - s),
					b: i * (1 - s)
				};
			}
			res.mode = "rgb";
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsi/convertRgbToHsi.js
		function convertRgbToHsi({ r, g, b, alpha }) {
			if (r === void 0) r = 0;
			if (g === void 0) g = 0;
			if (b === void 0) b = 0;
			let M = Math.max(r, g, b), m = Math.min(r, g, b);
			let res = {
				mode: "hsi",
				s: r + g + b === 0 ? 0 : 1 - 3 * m / (r + g + b),
				i: (r + g + b) / 3
			};
			if (M - m !== 0) res.h = (M === r ? (g - b) / (M - m) + (g < b) * 6 : M === g ? (b - r) / (M - m) + 2 : (r - g) / (M - m) + 4) * 60;
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsi/definition.js
		const definition$22 = {
			mode: "hsi",
			toMode: { rgb: convertHsiToRgb },
			parse: ["--hsi"],
			serialize: "--hsi",
			fromMode: { rgb: convertRgbToHsi },
			channels: [
				"h",
				"s",
				"i",
				"alpha"
			],
			ranges: { h: [0, 360] },
			gamut: "rgb",
			interpolate: {
				h: {
					use: interpolatorLinear,
					fixup: fixupHueShorter
				},
				s: interpolatorLinear,
				i: interpolatorLinear,
				alpha: {
					use: interpolatorLinear,
					fixup: fixupAlpha
				}
			},
			difference: { h: differenceHueSaturation },
			average: { h: averageAngle }
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsl/convertHslToRgb.js
		function convertHslToRgb({ h, s, l, alpha }) {
			h = normalizeHue(h !== void 0 ? h : 0);
			if (s === void 0) s = 0;
			if (l === void 0) l = 0;
			let m1 = l + s * (l < .5 ? l : 1 - l);
			let m2 = m1 - (m1 - l) * 2 * Math.abs(h / 60 % 2 - 1);
			let res;
			switch (Math.floor(h / 60)) {
				case 0:
					res = {
						r: m1,
						g: m2,
						b: 2 * l - m1
					};
					break;
				case 1:
					res = {
						r: m2,
						g: m1,
						b: 2 * l - m1
					};
					break;
				case 2:
					res = {
						r: 2 * l - m1,
						g: m1,
						b: m2
					};
					break;
				case 3:
					res = {
						r: 2 * l - m1,
						g: m2,
						b: m1
					};
					break;
				case 4:
					res = {
						r: m2,
						g: 2 * l - m1,
						b: m1
					};
					break;
				case 5:
					res = {
						r: m1,
						g: 2 * l - m1,
						b: m2
					};
					break;
				default: res = {
					r: 2 * l - m1,
					g: 2 * l - m1,
					b: 2 * l - m1
				};
			}
			res.mode = "rgb";
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsl/convertRgbToHsl.js
		function convertRgbToHsl({ r, g, b, alpha }) {
			if (r === void 0) r = 0;
			if (g === void 0) g = 0;
			if (b === void 0) b = 0;
			let M = Math.max(r, g, b), m = Math.min(r, g, b);
			let res = {
				mode: "hsl",
				s: M === m ? 0 : (M - m) / (1 - Math.abs(M + m - 1)),
				l: .5 * (M + m)
			};
			if (M - m !== 0) res.h = (M === r ? (g - b) / (M - m) + (g < b) * 6 : M === g ? (b - r) / (M - m) + 2 : (r - g) / (M - m) + 4) * 60;
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/util/hue.js
		const hueToDeg = (val, unit) => {
			switch (unit) {
				case "deg": return +val;
				case "rad": return val / Math.PI * 180;
				case "grad": return val / 10 * 9;
				case "turn": return val * 360;
			}
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsl/parseHslLegacy.js
		const hsl_old = new RegExp(`^hsla?\\(\\s*${hue$1}${c}${per}${c}${per}\\s*(?:,\\s*${num_per}\\s*)?\\)$`);
		const parseHslLegacy = (color) => {
			let match = color.match(hsl_old);
			if (!match) return;
			let res = { mode: "hsl" };
			if (match[3] !== void 0) res.h = +match[3];
			else if (match[1] !== void 0 && match[2] !== void 0) res.h = hueToDeg(match[1], match[2]);
			if (match[4] !== void 0) res.s = Math.min(Math.max(0, match[4] / 100), 1);
			if (match[5] !== void 0) res.l = Math.min(Math.max(0, match[5] / 100), 1);
			if (match[6] !== void 0) res.alpha = Math.max(0, Math.min(1, match[6] / 100));
			else if (match[7] !== void 0) res.alpha = Math.max(0, Math.min(1, +match[7]));
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsl/parseHsl.js
		function parseHsl(color, parsed) {
			if (!parsed || parsed[0] !== "hsl" && parsed[0] !== "hsla") return;
			const res = { mode: "hsl" };
			const [, h, s, l, alpha] = parsed;
			if (h.type !== Tok.None) {
				if (h.type === Tok.Percentage) return;
				res.h = h.value;
			}
			if (s.type !== Tok.None) {
				if (s.type === Tok.Hue) return;
				res.s = s.value / 100;
			}
			if (l.type !== Tok.None) {
				if (l.type === Tok.Hue) return;
				res.l = l.value / 100;
			}
			if (alpha.type !== Tok.None) res.alpha = Math.min(1, Math.max(0, alpha.type === Tok.Number ? alpha.value : alpha.value / 100));
			return res;
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsl/definition.js
		const definition$21 = {
			mode: "hsl",
			toMode: { rgb: convertHslToRgb },
			fromMode: { rgb: convertRgbToHsl },
			channels: [
				"h",
				"s",
				"l",
				"alpha"
			],
			ranges: { h: [0, 360] },
			gamut: "rgb",
			parse: [parseHsl, parseHslLegacy],
			serialize: (c) => `hsl(${c.h !== void 0 ? c.h : "none"} ${c.s !== void 0 ? c.s * 100 + "%" : "none"} ${c.l !== void 0 ? c.l * 100 + "%" : "none"}${c.alpha < 1 ? ` / ${c.alpha}` : ""})`,
			interpolate: {
				h: {
					use: interpolatorLinear,
					fixup: fixupHueShorter
				},
				s: interpolatorLinear,
				l: interpolatorLinear,
				alpha: {
					use: interpolatorLinear,
					fixup: fixupAlpha
				}
			},
			difference: { h: differenceHueSaturation },
			average: { h: averageAngle }
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsv/convertHsvToRgb.js
		function convertHsvToRgb({ h, s, v, alpha }) {
			h = normalizeHue(h !== void 0 ? h : 0);
			if (s === void 0) s = 0;
			if (v === void 0) v = 0;
			let f = Math.abs(h / 60 % 2 - 1);
			let res;
			switch (Math.floor(h / 60)) {
				case 0:
					res = {
						r: v,
						g: v * (1 - s * f),
						b: v * (1 - s)
					};
					break;
				case 1:
					res = {
						r: v * (1 - s * f),
						g: v,
						b: v * (1 - s)
					};
					break;
				case 2:
					res = {
						r: v * (1 - s),
						g: v,
						b: v * (1 - s * f)
					};
					break;
				case 3:
					res = {
						r: v * (1 - s),
						g: v * (1 - s * f),
						b: v
					};
					break;
				case 4:
					res = {
						r: v * (1 - s * f),
						g: v * (1 - s),
						b: v
					};
					break;
				case 5:
					res = {
						r: v,
						g: v * (1 - s),
						b: v * (1 - s * f)
					};
					break;
				default: res = {
					r: v * (1 - s),
					g: v * (1 - s),
					b: v * (1 - s)
				};
			}
			res.mode = "rgb";
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsv/convertRgbToHsv.js
		function convertRgbToHsv({ r, g, b, alpha }) {
			if (r === void 0) r = 0;
			if (g === void 0) g = 0;
			if (b === void 0) b = 0;
			let M = Math.max(r, g, b), m = Math.min(r, g, b);
			let res = {
				mode: "hsv",
				s: M === 0 ? 0 : 1 - m / M,
				v: M
			};
			if (M - m !== 0) res.h = (M === r ? (g - b) / (M - m) + (g < b) * 6 : M === g ? (b - r) / (M - m) + 2 : (r - g) / (M - m) + 4) * 60;
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsv/definition.js
		const definition$20 = {
			mode: "hsv",
			toMode: { rgb: convertHsvToRgb },
			parse: ["--hsv"],
			serialize: "--hsv",
			fromMode: { rgb: convertRgbToHsv },
			channels: [
				"h",
				"s",
				"v",
				"alpha"
			],
			ranges: { h: [0, 360] },
			gamut: "rgb",
			interpolate: {
				h: {
					use: interpolatorLinear,
					fixup: fixupHueShorter
				},
				s: interpolatorLinear,
				v: interpolatorLinear,
				alpha: {
					use: interpolatorLinear,
					fixup: fixupAlpha
				}
			},
			difference: { h: differenceHueSaturation },
			average: { h: averageAngle }
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hwb/convertHwbToRgb.js
		function convertHwbToRgb({ h, w, b, alpha }) {
			if (w === void 0) w = 0;
			if (b === void 0) b = 0;
			if (w + b > 1) {
				let s = w + b;
				w /= s;
				b /= s;
			}
			return convertHsvToRgb({
				h,
				s: b === 1 ? 1 : 1 - w / (1 - b),
				v: 1 - b,
				alpha
			});
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hwb/convertRgbToHwb.js
		function convertRgbToHwb(rgba) {
			let hsv = convertRgbToHsv(rgba);
			if (hsv === void 0) return void 0;
			let s = hsv.s !== void 0 ? hsv.s : 0;
			let v = hsv.v !== void 0 ? hsv.v : 0;
			let res = {
				mode: "hwb",
				w: (1 - s) * v,
				b: 1 - v
			};
			if (hsv.h !== void 0) res.h = hsv.h;
			if (hsv.alpha !== void 0) res.alpha = hsv.alpha;
			return res;
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hwb/parseHwb.js
		function ParseHwb(color, parsed) {
			if (!parsed || parsed[0] !== "hwb") return;
			const res = { mode: "hwb" };
			const [, h, w, b, alpha] = parsed;
			if (h.type !== Tok.None) {
				if (h.type === Tok.Percentage) return;
				res.h = h.value;
			}
			if (w.type !== Tok.None) {
				if (w.type === Tok.Hue) return;
				res.w = w.value / 100;
			}
			if (b.type !== Tok.None) {
				if (b.type === Tok.Hue) return;
				res.b = b.value / 100;
			}
			if (alpha.type !== Tok.None) res.alpha = Math.min(1, Math.max(0, alpha.type === Tok.Number ? alpha.value : alpha.value / 100));
			return res;
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hwb/definition.js
		const definition$19 = {
			mode: "hwb",
			toMode: { rgb: convertHwbToRgb },
			fromMode: { rgb: convertRgbToHwb },
			channels: [
				"h",
				"w",
				"b",
				"alpha"
			],
			ranges: { h: [0, 360] },
			gamut: "rgb",
			parse: [ParseHwb],
			serialize: (c) => `hwb(${c.h !== void 0 ? c.h : "none"} ${c.w !== void 0 ? c.w * 100 + "%" : "none"} ${c.b !== void 0 ? c.b * 100 + "%" : "none"}${c.alpha < 1 ? ` / ${c.alpha}` : ""})`,
			interpolate: {
				h: {
					use: interpolatorLinear,
					fixup: fixupHueShorter
				},
				w: interpolatorLinear,
				b: interpolatorLinear,
				alpha: {
					use: interpolatorLinear,
					fixup: fixupAlpha
				}
			},
			difference: { h: differenceHueNaive },
			average: { h: averageAngle }
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hdr/transfer.js
		const M1 = .1593017578125;
		const M2 = 78.84375;
		const C1 = .8359375;
		const C2 = 18.8515625;
		const C3 = 18.6875;
		function transferPqDecode(v) {
			if (v < 0) return 0;
			const c = Math.pow(v, 1 / M2);
			return 1e4 * Math.pow(Math.max(0, c - C1) / (C2 - C3 * c), 1 / M1);
		}
		function transferPqEncode(v) {
			if (v < 0) return 0;
			const c = Math.pow(v / 1e4, M1);
			return Math.pow((C1 + C2 * c) / (1 + C3 * c), M2);
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/itp/convertItpToXyz65.js
		const toRel = (c) => Math.max(c / 203, 0);
		const convertItpToXyz65 = ({ i, t, p, alpha }) => {
			if (i === void 0) i = 0;
			if (t === void 0) t = 0;
			if (p === void 0) p = 0;
			const l = transferPqDecode(i + .008609037037932761 * t + .11102962500302593 * p);
			const m = transferPqDecode(i - .00860903703793275 * t - .11102962500302599 * p);
			const s = transferPqDecode(i + .5600313357106791 * t - .32062717498731885 * p);
			const res = {
				mode: "xyz65",
				x: toRel(2.070152218389422 * l - 1.3263473389671556 * m + .2066510476294051 * s),
				y: toRel(.3647385209748074 * l + .680566024947227 * m - .0453045459220346 * s),
				z: toRel(-.049747207535812 * l - .0492609666966138 * m + 1.1880659249923042 * s)
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/itp/convertXyz65ToItp.js
		const toAbs = (c = 0) => Math.max(c * 203, 0);
		const convertXyz65ToItp = ({ x, y, z, alpha }) => {
			const absX = toAbs(x);
			const absY = toAbs(y);
			const absZ = toAbs(z);
			const l = transferPqEncode(.3592832590121217 * absX + .6976051147779502 * absY - .0358915932320289 * absZ);
			const m = transferPqEncode(-.1920808463704995 * absX + 1.1004767970374323 * absY + .0753748658519118 * absZ);
			const s = transferPqEncode(.0070797844607477 * absX + .0748396662186366 * absY + .8433265453898765 * absZ);
			const res = {
				mode: "itp",
				i: .5 * l + .5 * m,
				t: 1.61376953125 * l - 3.323486328125 * m + 1.709716796875 * s,
				p: 4.378173828125 * l - 4.24560546875 * m - .132568359375 * s
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/itp/definition.js
		const definition$18 = {
			mode: "itp",
			channels: [
				"i",
				"t",
				"p",
				"alpha"
			],
			parse: ["--ictcp"],
			serialize: "--ictcp",
			toMode: {
				xyz65: convertItpToXyz65,
				rgb: (color) => convertXyz65ToRgb(convertItpToXyz65(color))
			},
			fromMode: {
				xyz65: convertXyz65ToItp,
				rgb: (color) => convertXyz65ToItp(convertRgbToXyz65(color))
			},
			ranges: {
				i: [0, .581],
				t: [-.369, .272],
				p: [-.164, .331]
			},
			interpolate: {
				i: interpolatorLinear,
				t: interpolatorLinear,
				p: interpolatorLinear,
				alpha: {
					use: interpolatorLinear,
					fixup: fixupAlpha
				}
			}
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/jab/convertXyz65ToJab.js
		const p$1 = 134.03437499999998;
		const d0$1 = 16295499532821565e-27;
		const jabPqEncode = (v) => {
			if (v < 0) return 0;
			let vn = Math.pow(v / 1e4, M1);
			return Math.pow((C1 + C2 * vn) / (1 + C3 * vn), p$1);
		};
		const abs = (v = 0) => Math.max(v * 203, 0);
		const convertXyz65ToJab = ({ x, y, z, alpha }) => {
			x = abs(x);
			y = abs(y);
			z = abs(z);
			let xp = 1.15 * x - .15 * z;
			let yp = .66 * y + .34 * x;
			let l = jabPqEncode(.41478972 * xp + .579999 * yp + .014648 * z);
			let m = jabPqEncode(-.20151 * xp + 1.120649 * yp + .0531008 * z);
			let s = jabPqEncode(-.0166008 * xp + .2648 * yp + .6684799 * z);
			let i = (l + m) / 2;
			let res = {
				mode: "jab",
				j: .44 * i / (1 - .56 * i) - d0$1,
				a: 3.524 * l - 4.066708 * m + .542708 * s,
				b: .199076 * l + 1.096799 * m - 1.295875 * s
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/jab/convertJabToXyz65.js
		const p = 134.03437499999998;
		const d0 = 16295499532821565e-27;
		const jabPqDecode = (v) => {
			if (v < 0) return 0;
			let vp = Math.pow(v, 1 / p);
			return 1e4 * Math.pow((C1 - vp) / (C3 * vp - C2), 1 / M1);
		};
		const rel = (v) => v / 203;
		const convertJabToXyz65 = ({ j, a, b, alpha }) => {
			if (j === void 0) j = 0;
			if (a === void 0) a = 0;
			if (b === void 0) b = 0;
			let i = (j + d0) / (.44 + .56 * (j + d0));
			let l = jabPqDecode(i + .13860504 * a + .058047316 * b);
			let m = jabPqDecode(i - .13860504 * a - .058047316 * b);
			let s = jabPqDecode(i - .096019242 * a - .8118919 * b);
			let res = {
				mode: "xyz65",
				x: rel(1.661373024652174 * l - .914523081304348 * m + .23136208173913045 * s),
				y: rel(-.3250758611844533 * l + 1.571847026732543 * m - .21825383453227928 * s),
				z: rel(-.090982811 * l - .31272829 * m + 1.5227666 * s)
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/jab/convertRgbToJab.js
		const convertRgbToJab = (rgb) => {
			let res = convertXyz65ToJab(convertRgbToXyz65(rgb));
			if (rgb.r === rgb.b && rgb.b === rgb.g) res.a = res.b = 0;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/jab/convertJabToRgb.js
		const convertJabToRgb = (color) => convertXyz65ToRgb(convertJabToXyz65(color));
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/jab/definition.js
		const definition$17 = {
			mode: "jab",
			channels: [
				"j",
				"a",
				"b",
				"alpha"
			],
			parse: ["--jzazbz"],
			serialize: "--jzazbz",
			fromMode: {
				rgb: convertRgbToJab,
				xyz65: convertXyz65ToJab
			},
			toMode: {
				rgb: convertJabToRgb,
				xyz65: convertJabToXyz65
			},
			ranges: {
				j: [0, .222],
				a: [-.109, .129],
				b: [-.185, .134]
			},
			interpolate: {
				j: interpolatorLinear,
				a: interpolatorLinear,
				b: interpolatorLinear,
				alpha: {
					use: interpolatorLinear,
					fixup: fixupAlpha
				}
			}
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/jch/convertJabToJch.js
		const convertJabToJch = ({ j, a, b, alpha }) => {
			if (a === void 0) a = 0;
			if (b === void 0) b = 0;
			let c = Math.sqrt(a * a + b * b);
			let res = {
				mode: "jch",
				j,
				c
			};
			if (c) res.h = normalizeHue(Math.atan2(b, a) * 180 / Math.PI);
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/jch/convertJchToJab.js
		const convertJchToJab = ({ j, c, h, alpha }) => {
			if (h === void 0) h = 0;
			let res = {
				mode: "jab",
				j,
				a: c ? c * Math.cos(h / 180 * Math.PI) : 0,
				b: c ? c * Math.sin(h / 180 * Math.PI) : 0
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/jch/definition.js
		const definition$16 = {
			mode: "jch",
			parse: ["--jzczhz"],
			serialize: "--jzczhz",
			toMode: {
				jab: convertJchToJab,
				rgb: (c) => convertJabToRgb(convertJchToJab(c))
			},
			fromMode: {
				rgb: (c) => convertJabToJch(convertRgbToJab(c)),
				jab: convertJabToJch
			},
			channels: [
				"j",
				"c",
				"h",
				"alpha"
			],
			ranges: {
				j: [0, .221],
				c: [0, .19],
				h: [0, 360]
			},
			interpolate: {
				h: {
					use: interpolatorLinear,
					fixup: fixupHueShorter
				},
				c: interpolatorLinear,
				j: interpolatorLinear,
				alpha: {
					use: interpolatorLinear,
					fixup: fixupAlpha
				}
			},
			difference: { h: differenceHueChroma },
			average: { h: averageAngle }
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz50/constants.js
		const k = Math.pow(29, 3) / Math.pow(3, 3);
		const e = Math.pow(6, 3) / Math.pow(29, 3);
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab/convertLabToXyz50.js
		let fn = (v) => Math.pow(v, 3) > e ? Math.pow(v, 3) : (116 * v - 16) / k;
		const convertLabToXyz50 = ({ l, a, b, alpha }) => {
			if (l === void 0) l = 0;
			if (a === void 0) a = 0;
			if (b === void 0) b = 0;
			let fy = (l + 16) / 116;
			let fx = a / 500 + fy;
			let fz = fy - b / 200;
			let res = {
				mode: "xyz50",
				x: fn(fx) * D50.X,
				y: fn(fy) * D50.Y,
				z: fn(fz) * D50.Z
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz50/convertXyz50ToRgb.js
		const convertXyz50ToRgb = ({ x, y, z, alpha }) => {
			if (x === void 0) x = 0;
			if (y === void 0) y = 0;
			if (z === void 0) z = 0;
			let res = convertLrgbToRgb({
				r: x * 3.1341359569958707 - y * 1.6173863321612538 - .4906619460083532 * z,
				g: x * -.978795502912089 + y * 1.916254567259524 + .03344273116131949 * z,
				b: x * .07195537988411677 - y * .2289768264158322 + 1.405386058324125 * z
			});
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab/convertLabToRgb.js
		const convertLabToRgb = (lab) => convertXyz50ToRgb(convertLabToXyz50(lab));
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz50/convertRgbToXyz50.js
		const convertRgbToXyz50 = (rgb) => {
			let { r, g, b, alpha } = convertRgbToLrgb(rgb);
			let res = {
				mode: "xyz50",
				x: .436065742824811 * r + .3851514688337912 * g + .14307845442264197 * b,
				y: .22249319175623702 * r + .7168870538238823 * g + .06061979053616537 * b,
				z: .013923904500943465 * r + .09708128566574634 * g + .7140993584005155 * b
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab/convertXyz50ToLab.js
		const f = (value) => value > e ? Math.cbrt(value) : (k * value + 16) / 116;
		const convertXyz50ToLab = ({ x, y, z, alpha }) => {
			if (x === void 0) x = 0;
			if (y === void 0) y = 0;
			if (z === void 0) z = 0;
			let f0 = f(x / D50.X);
			let f1 = f(y / D50.Y);
			let f2 = f(z / D50.Z);
			let res = {
				mode: "lab",
				l: 116 * f1 - 16,
				a: 500 * (f0 - f1),
				b: 200 * (f1 - f2)
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab/convertRgbToLab.js
		const convertRgbToLab = (rgb) => {
			let res = convertXyz50ToLab(convertRgbToXyz50(rgb));
			if (rgb.r === rgb.b && rgb.b === rgb.g) res.a = res.b = 0;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab/parseLab.js
		function parseLab(color, parsed) {
			if (!parsed || parsed[0] !== "lab") return;
			const res = { mode: "lab" };
			const [, l, a, b, alpha] = parsed;
			if (l.type === Tok.Hue || a.type === Tok.Hue || b.type === Tok.Hue) return;
			if (l.type !== Tok.None) res.l = Math.min(Math.max(0, l.value), 100);
			if (a.type !== Tok.None) res.a = a.type === Tok.Number ? a.value : a.value * 125 / 100;
			if (b.type !== Tok.None) res.b = b.type === Tok.Number ? b.value : b.value * 125 / 100;
			if (alpha.type !== Tok.None) res.alpha = Math.min(1, Math.max(0, alpha.type === Tok.Number ? alpha.value : alpha.value / 100));
			return res;
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab/definition.js
		const definition$15 = {
			mode: "lab",
			toMode: {
				xyz50: convertLabToXyz50,
				rgb: convertLabToRgb
			},
			fromMode: {
				xyz50: convertXyz50ToLab,
				rgb: convertRgbToLab
			},
			channels: [
				"l",
				"a",
				"b",
				"alpha"
			],
			ranges: {
				l: [0, 100],
				a: [-125, 125],
				b: [-125, 125]
			},
			parse: [parseLab],
			serialize: (c) => `lab(${c.l !== void 0 ? c.l : "none"} ${c.a !== void 0 ? c.a : "none"} ${c.b !== void 0 ? c.b : "none"}${c.alpha < 1 ? ` / ${c.alpha}` : ""})`,
			interpolate: {
				l: interpolatorLinear,
				a: interpolatorLinear,
				b: interpolatorLinear,
				alpha: {
					use: interpolatorLinear,
					fixup: fixupAlpha
				}
			}
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab65/definition.js
		const definition$14 = {
			...definition$15,
			mode: "lab65",
			parse: ["--lab-d65"],
			serialize: "--lab-d65",
			toMode: {
				xyz65: convertLab65ToXyz65,
				rgb: convertLab65ToRgb
			},
			fromMode: {
				xyz65: convertXyz65ToLab65,
				rgb: convertRgbToLab65
			},
			ranges: {
				l: [0, 100],
				a: [-125, 125],
				b: [-125, 125]
			}
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lch/parseLch.js
		function parseLch(color, parsed) {
			if (!parsed || parsed[0] !== "lch") return;
			const res = { mode: "lch" };
			const [, l, c, h, alpha] = parsed;
			if (l.type !== Tok.None) {
				if (l.type === Tok.Hue) return;
				res.l = Math.min(Math.max(0, l.value), 100);
			}
			if (c.type !== Tok.None) res.c = Math.max(0, c.type === Tok.Number ? c.value : c.value * 150 / 100);
			if (h.type !== Tok.None) {
				if (h.type === Tok.Percentage) return;
				res.h = h.value;
			}
			if (alpha.type !== Tok.None) res.alpha = Math.min(1, Math.max(0, alpha.type === Tok.Number ? alpha.value : alpha.value / 100));
			return res;
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lch/definition.js
		const definition$13 = {
			mode: "lch",
			toMode: {
				lab: convertLchToLab,
				rgb: (c) => convertLabToRgb(convertLchToLab(c))
			},
			fromMode: {
				rgb: (c) => convertLabToLch(convertRgbToLab(c)),
				lab: convertLabToLch
			},
			channels: [
				"l",
				"c",
				"h",
				"alpha"
			],
			ranges: {
				l: [0, 100],
				c: [0, 150],
				h: [0, 360]
			},
			parse: [parseLch],
			serialize: (c) => `lch(${c.l !== void 0 ? c.l : "none"} ${c.c !== void 0 ? c.c : "none"} ${c.h !== void 0 ? c.h : "none"}${c.alpha < 1 ? ` / ${c.alpha}` : ""})`,
			interpolate: {
				h: {
					use: interpolatorLinear,
					fixup: fixupHueShorter
				},
				c: interpolatorLinear,
				l: interpolatorLinear,
				alpha: {
					use: interpolatorLinear,
					fixup: fixupAlpha
				}
			},
			difference: { h: differenceHueChroma },
			average: { h: averageAngle }
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lch65/definition.js
		const definition$12 = {
			...definition$13,
			mode: "lch65",
			parse: ["--lch-d65"],
			serialize: "--lch-d65",
			toMode: {
				lab65: (c) => convertLchToLab(c, "lab65"),
				rgb: (c) => convertLab65ToRgb(convertLchToLab(c, "lab65"))
			},
			fromMode: {
				rgb: (c) => convertLabToLch(convertRgbToLab65(c), "lch65"),
				lab65: (c) => convertLabToLch(c, "lch65")
			},
			ranges: {
				l: [0, 100],
				c: [0, 150],
				h: [0, 360]
			}
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lchuv/convertLuvToLchuv.js
		const convertLuvToLchuv = ({ l, u, v, alpha }) => {
			if (u === void 0) u = 0;
			if (v === void 0) v = 0;
			let c = Math.sqrt(u * u + v * v);
			let res = {
				mode: "lchuv",
				l,
				c
			};
			if (c) res.h = normalizeHue(Math.atan2(v, u) * 180 / Math.PI);
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lchuv/convertLchuvToLuv.js
		const convertLchuvToLuv = ({ l, c, h, alpha }) => {
			if (h === void 0) h = 0;
			let res = {
				mode: "luv",
				l,
				u: c ? c * Math.cos(h / 180 * Math.PI) : 0,
				v: c ? c * Math.sin(h / 180 * Math.PI) : 0
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/luv/convertXyz50ToLuv.js
		const u_fn$1 = (x, y, z) => 4 * x / (x + 15 * y + 3 * z);
		const v_fn$1 = (x, y, z) => 9 * y / (x + 15 * y + 3 * z);
		const un$1 = u_fn$1(D50.X, D50.Y, D50.Z);
		const vn$1 = v_fn$1(D50.X, D50.Y, D50.Z);
		const l_fn = (value) => value <= e ? k * value : 116 * Math.cbrt(value) - 16;
		const convertXyz50ToLuv = ({ x, y, z, alpha }) => {
			if (x === void 0) x = 0;
			if (y === void 0) y = 0;
			if (z === void 0) z = 0;
			let l = l_fn(y / D50.Y);
			let u = u_fn$1(x, y, z);
			let v = v_fn$1(x, y, z);
			if (!isFinite(u) || !isFinite(v)) l = u = v = 0;
			else {
				u = 13 * l * (u - un$1);
				v = 13 * l * (v - vn$1);
			}
			let res = {
				mode: "luv",
				l,
				u,
				v
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/luv/convertLuvToXyz50.js
		const u_fn = (x, y, z) => 4 * x / (x + 15 * y + 3 * z);
		const v_fn = (x, y, z) => 9 * y / (x + 15 * y + 3 * z);
		const un = u_fn(D50.X, D50.Y, D50.Z);
		const vn = v_fn(D50.X, D50.Y, D50.Z);
		const convertLuvToXyz50 = ({ l, u, v, alpha }) => {
			if (l === void 0) l = 0;
			if (l === 0) return {
				mode: "xyz50",
				x: 0,
				y: 0,
				z: 0
			};
			if (u === void 0) u = 0;
			if (v === void 0) v = 0;
			let up = u / (13 * l) + un;
			let vp = v / (13 * l) + vn;
			let y = D50.Y * (l <= 8 ? l / k : Math.pow((l + 16) / 116, 3));
			let res = {
				mode: "xyz50",
				x: y * (9 * up) / (4 * vp),
				y,
				z: y * (12 - 3 * up - 20 * vp) / (4 * vp)
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lchuv/definition.js
		const convertRgbToLchuv = (rgb) => convertLuvToLchuv(convertXyz50ToLuv(convertRgbToXyz50(rgb)));
		const convertLchuvToRgb = (lchuv) => convertXyz50ToRgb(convertLuvToXyz50(convertLchuvToLuv(lchuv)));
		const definition$11 = {
			mode: "lchuv",
			toMode: {
				luv: convertLchuvToLuv,
				rgb: convertLchuvToRgb
			},
			fromMode: {
				rgb: convertRgbToLchuv,
				luv: convertLuvToLchuv
			},
			channels: [
				"l",
				"c",
				"h",
				"alpha"
			],
			parse: ["--lchuv"],
			serialize: "--lchuv",
			ranges: {
				l: [0, 100],
				c: [0, 176.956],
				h: [0, 360]
			},
			interpolate: {
				h: {
					use: interpolatorLinear,
					fixup: fixupHueShorter
				},
				c: interpolatorLinear,
				l: interpolatorLinear,
				alpha: {
					use: interpolatorLinear,
					fixup: fixupAlpha
				}
			},
			difference: { h: differenceHueChroma },
			average: { h: averageAngle }
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lrgb/definition.js
		const definition$10 = {
			...definition$27,
			mode: "lrgb",
			toMode: { rgb: convertLrgbToRgb },
			fromMode: { rgb: convertRgbToLrgb },
			parse: ["srgb-linear"],
			serialize: "srgb-linear"
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/luv/definition.js
		const definition$9 = {
			mode: "luv",
			toMode: {
				xyz50: convertLuvToXyz50,
				rgb: (luv) => convertXyz50ToRgb(convertLuvToXyz50(luv))
			},
			fromMode: {
				xyz50: convertXyz50ToLuv,
				rgb: (rgb) => convertXyz50ToLuv(convertRgbToXyz50(rgb))
			},
			channels: [
				"l",
				"u",
				"v",
				"alpha"
			],
			parse: ["--luv"],
			serialize: "--luv",
			ranges: {
				l: [0, 100],
				u: [-84.936, 175.042],
				v: [-125.882, 87.243]
			},
			interpolate: {
				l: interpolatorLinear,
				u: interpolatorLinear,
				v: interpolatorLinear,
				alpha: {
					use: interpolatorLinear,
					fixup: fixupAlpha
				}
			}
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/oklab/convertLrgbToOklab.js
		const convertLrgbToOklab = ({ r, g, b, alpha }) => {
			if (r === void 0) r = 0;
			if (g === void 0) g = 0;
			if (b === void 0) b = 0;
			let L = Math.cbrt(.412221469470763 * r + .5363325372617348 * g + .0514459932675022 * b);
			let M = Math.cbrt(.2119034958178252 * r + .6806995506452344 * g + .1073969535369406 * b);
			let S = Math.cbrt(.0883024591900564 * r + .2817188391361215 * g + .6299787016738222 * b);
			let res = {
				mode: "oklab",
				l: .210454268309314 * L + .7936177747023054 * M - .0040720430116193 * S,
				a: 1.9779985324311684 * L - 2.42859224204858 * M + .450593709617411 * S,
				b: .0259040424655478 * L + .7827717124575296 * M - .8086757549230774 * S
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/oklab/convertRgbToOklab.js
		const convertRgbToOklab = (rgb) => {
			let res = convertLrgbToOklab(convertRgbToLrgb(rgb));
			if (rgb.r === rgb.b && rgb.b === rgb.g) res.a = res.b = 0;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/oklab/convertOklabToLrgb.js
		const convertOklabToLrgb = ({ l, a, b, alpha }) => {
			if (l === void 0) l = 0;
			if (a === void 0) a = 0;
			if (b === void 0) b = 0;
			let L = Math.pow(l + .3963377773761749 * a + .2158037573099136 * b, 3);
			let M = Math.pow(l - .1055613458156586 * a - .0638541728258133 * b, 3);
			let S = Math.pow(l - .0894841775298119 * a - 1.2914855480194092 * b, 3);
			let res = {
				mode: "lrgb",
				r: 4.076741636075957 * L - 3.3077115392580616 * M + .2309699031821044 * S,
				g: -1.2684379732850317 * L + 2.6097573492876887 * M - .3413193760026573 * S,
				b: -.0041960761386756 * L - .7034186179359362 * M + 1.7076146940746117 * S
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/oklab/convertOklabToRgb.js
		const convertOklabToRgb = (c) => convertLrgbToRgb(convertOklabToLrgb(c));
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/okhsl/helpers.js
		function toe(x) {
			const k_1 = .206;
			const k_2 = .03;
			const k_3 = 1.206 / 1.03;
			return .5 * (k_3 * x - k_1 + Math.sqrt((k_3 * x - k_1) * (k_3 * x - k_1) + 4 * k_2 * k_3 * x));
		}
		function toe_inv(x) {
			return (x * x + .206 * x) / (1.206 / 1.03 * (x + .03));
		}
		function compute_max_saturation(a, b) {
			let k0, k1, k2, k3, k4, wl, wm, ws;
			if (-1.88170328 * a - .80936493 * b > 1) {
				k0 = 1.19086277;
				k1 = 1.76576728;
				k2 = .59662641;
				k3 = .75515197;
				k4 = .56771245;
				wl = 4.0767416621;
				wm = -3.3077115913;
				ws = .2309699292;
			} else if (1.81444104 * a - 1.19445276 * b > 1) {
				k0 = .73956515;
				k1 = -.45954404;
				k2 = .08285427;
				k3 = .1254107;
				k4 = .14503204;
				wl = -1.2684380046;
				wm = 2.6097574011;
				ws = -.3413193965;
			} else {
				k0 = 1.35733652;
				k1 = -.00915799;
				k2 = -1.1513021;
				k3 = -.50559606;
				k4 = .00692167;
				wl = -.0041960863;
				wm = -.7034186147;
				ws = 1.707614701;
			}
			let S = k0 + k1 * a + k2 * b + k3 * a * a + k4 * a * b;
			let k_l = .3963377774 * a + .2158037573 * b;
			let k_m = -.1055613458 * a - .0638541728 * b;
			let k_s = -.0894841775 * a - 1.291485548 * b;
			{
				let l_ = 1 + S * k_l;
				let m_ = 1 + S * k_m;
				let s_ = 1 + S * k_s;
				let l = l_ * l_ * l_;
				let m = m_ * m_ * m_;
				let s = s_ * s_ * s_;
				let l_dS = 3 * k_l * l_ * l_;
				let m_dS = 3 * k_m * m_ * m_;
				let s_dS = 3 * k_s * s_ * s_;
				let l_dS2 = 6 * k_l * k_l * l_;
				let m_dS2 = 6 * k_m * k_m * m_;
				let s_dS2 = 6 * k_s * k_s * s_;
				let f = wl * l + wm * m + ws * s;
				let f1 = wl * l_dS + wm * m_dS + ws * s_dS;
				let f2 = wl * l_dS2 + wm * m_dS2 + ws * s_dS2;
				S = S - f * f1 / (f1 * f1 - .5 * f * f2);
			}
			return S;
		}
		function find_cusp(a, b) {
			let S_cusp = compute_max_saturation(a, b);
			let rgb = convertOklabToLrgb({
				l: 1,
				a: S_cusp * a,
				b: S_cusp * b
			});
			let L_cusp = Math.cbrt(1 / Math.max(rgb.r, rgb.g, rgb.b));
			return [L_cusp, L_cusp * S_cusp];
		}
		function find_gamut_intersection(a, b, L1, C1, L0, cusp = null) {
			if (!cusp) cusp = find_cusp(a, b);
			let t;
			if ((L1 - L0) * cusp[1] - (cusp[0] - L0) * C1 <= 0) t = cusp[1] * L0 / (C1 * cusp[0] + cusp[1] * (L0 - L1));
			else {
				t = cusp[1] * (L0 - 1) / (C1 * (cusp[0] - 1) + cusp[1] * (L0 - L1));
				{
					let dL = L1 - L0;
					let dC = C1;
					let k_l = .3963377774 * a + .2158037573 * b;
					let k_m = -.1055613458 * a - .0638541728 * b;
					let k_s = -.0894841775 * a - 1.291485548 * b;
					let l_dt = dL + dC * k_l;
					let m_dt = dL + dC * k_m;
					let s_dt = dL + dC * k_s;
					{
						let L = L0 * (1 - t) + t * L1;
						let C = t * C1;
						let l_ = L + C * k_l;
						let m_ = L + C * k_m;
						let s_ = L + C * k_s;
						let l = l_ * l_ * l_;
						let m = m_ * m_ * m_;
						let s = s_ * s_ * s_;
						let ldt = 3 * l_dt * l_ * l_;
						let mdt = 3 * m_dt * m_ * m_;
						let sdt = 3 * s_dt * s_ * s_;
						let ldt2 = 6 * l_dt * l_dt * l_;
						let mdt2 = 6 * m_dt * m_dt * m_;
						let sdt2 = 6 * s_dt * s_dt * s_;
						let r = 4.0767416621 * l - 3.3077115913 * m + .2309699292 * s - 1;
						let r1 = 4.0767416621 * ldt - 3.3077115913 * mdt + .2309699292 * sdt;
						let r2 = 4.0767416621 * ldt2 - 3.3077115913 * mdt2 + .2309699292 * sdt2;
						let u_r = r1 / (r1 * r1 - .5 * r * r2);
						let t_r = -r * u_r;
						let g = -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s - 1;
						let g1 = -1.2684380046 * ldt + 2.6097574011 * mdt - .3413193965 * sdt;
						let g2 = -1.2684380046 * ldt2 + 2.6097574011 * mdt2 - .3413193965 * sdt2;
						let u_g = g1 / (g1 * g1 - .5 * g * g2);
						let t_g = -g * u_g;
						let b = -.0041960863 * l - .7034186147 * m + 1.707614701 * s - 1;
						let b1 = -.0041960863 * ldt - .7034186147 * mdt + 1.707614701 * sdt;
						let b2 = -.0041960863 * ldt2 - .7034186147 * mdt2 + 1.707614701 * sdt2;
						let u_b = b1 / (b1 * b1 - .5 * b * b2);
						let t_b = -b * u_b;
						t_r = u_r >= 0 ? t_r : 1e6;
						t_g = u_g >= 0 ? t_g : 1e6;
						t_b = u_b >= 0 ? t_b : 1e6;
						t += Math.min(t_r, Math.min(t_g, t_b));
					}
				}
			}
			return t;
		}
		function get_ST_max(a_, b_, cusp = null) {
			if (!cusp) cusp = find_cusp(a_, b_);
			let L = cusp[0];
			let C = cusp[1];
			return [C / L, C / (1 - L)];
		}
		function get_Cs(L, a_, b_) {
			let cusp = find_cusp(a_, b_);
			let C_max = find_gamut_intersection(a_, b_, L, 1, L, cusp);
			let ST_max = get_ST_max(a_, b_, cusp);
			let S_mid = .11516993 + 1 / (7.4477897 + 4.1590124 * b_ + a_ * (-2.19557347 + 1.75198401 * b_ + a_ * (-2.13704948 - 10.02301043 * b_ + a_ * (-4.24894561 + 5.38770819 * b_ + 4.69891013 * a_))));
			let T_mid = .11239642 + 1 / (1.6132032 - .68124379 * b_ + a_ * (.40370612 + .90148123 * b_ + a_ * (-.27087943 + .6122399 * b_ + a_ * (.00299215 - .45399568 * b_ - .14661872 * a_))));
			let k = C_max / Math.min(L * ST_max[0], (1 - L) * ST_max[1]);
			let C_a = L * S_mid;
			let C_b = (1 - L) * T_mid;
			let C_mid = .9 * k * Math.sqrt(Math.sqrt(1 / (1 / (C_a * C_a * C_a * C_a) + 1 / (C_b * C_b * C_b * C_b))));
			C_a = L * .4;
			C_b = (1 - L) * .8;
			return [
				Math.sqrt(1 / (1 / (C_a * C_a) + 1 / (C_b * C_b))),
				C_mid,
				C_max
			];
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/okhsl/convertOklabToOkhsl.js
		function convertOklabToOkhsl(lab) {
			const l = lab.l !== void 0 ? lab.l : 0;
			const a = lab.a !== void 0 ? lab.a : 0;
			const b = lab.b !== void 0 ? lab.b : 0;
			const ret = {
				mode: "okhsl",
				l: toe(l)
			};
			if (lab.alpha !== void 0) ret.alpha = lab.alpha;
			let c = Math.sqrt(a * a + b * b);
			if (!c) {
				ret.s = 0;
				return ret;
			}
			let [C_0, C_mid, C_max] = get_Cs(l, a / c, b / c);
			let s;
			if (c < C_mid) {
				let k_0 = 0;
				let k_1 = .8 * C_0;
				let k_2 = 1 - k_1 / C_mid;
				s = (c - k_0) / (k_1 + k_2 * (c - k_0)) * .8;
			} else {
				let k_0 = C_mid;
				let k_1 = .2 * C_mid * C_mid * 1.25 * 1.25 / C_0;
				let k_2 = 1 - k_1 / (C_max - C_mid);
				s = .8 + .2 * ((c - k_0) / (k_1 + k_2 * (c - k_0)));
			}
			if (s) {
				ret.s = s;
				ret.h = normalizeHue(Math.atan2(b, a) * 180 / Math.PI);
			}
			return ret;
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/okhsl/convertOkhslToOklab.js
		function convertOkhslToOklab(hsl) {
			let h = hsl.h !== void 0 ? hsl.h : 0;
			let s = hsl.s !== void 0 ? hsl.s : 0;
			let l = hsl.l !== void 0 ? hsl.l : 0;
			const ret = {
				mode: "oklab",
				l: toe_inv(l)
			};
			if (hsl.alpha !== void 0) ret.alpha = hsl.alpha;
			if (!s || l === 1) {
				ret.a = ret.b = 0;
				return ret;
			}
			let a_ = Math.cos(h / 180 * Math.PI);
			let b_ = Math.sin(h / 180 * Math.PI);
			let [C_0, C_mid, C_max] = get_Cs(ret.l, a_, b_);
			let t, k_0, k_1, k_2;
			if (s < .8) {
				t = 1.25 * s;
				k_0 = 0;
				k_1 = .8 * C_0;
				k_2 = 1 - k_1 / C_mid;
			} else {
				t = 5 * (s - .8);
				k_0 = C_mid;
				k_1 = .2 * C_mid * C_mid * 1.25 * 1.25 / C_0;
				k_2 = 1 - k_1 / (C_max - C_mid);
			}
			let C = k_0 + t * k_1 / (1 - k_2 * t);
			ret.a = C * a_;
			ret.b = C * b_;
			return ret;
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/okhsl/modeOkhsl.js
		const modeOkhsl = {
			...definition$21,
			mode: "okhsl",
			channels: [
				"h",
				"s",
				"l",
				"alpha"
			],
			parse: ["--okhsl"],
			serialize: "--okhsl",
			fromMode: {
				oklab: convertOklabToOkhsl,
				rgb: (c) => convertOklabToOkhsl(convertRgbToOklab(c))
			},
			toMode: {
				oklab: convertOkhslToOklab,
				rgb: (c) => convertOklabToRgb(convertOkhslToOklab(c))
			}
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/okhsv/convertOklabToOkhsv.js
		function convertOklabToOkhsv(lab) {
			let l = lab.l !== void 0 ? lab.l : 0;
			let a = lab.a !== void 0 ? lab.a : 0;
			let b = lab.b !== void 0 ? lab.b : 0;
			let c = Math.sqrt(a * a + b * b);
			let a_ = c ? a / c : 1;
			let b_ = c ? b / c : 1;
			let [S_max, T] = get_ST_max(a_, b_);
			let S_0 = .5;
			let k = 1 - S_0 / S_max;
			let t = T / (c + l * T);
			let L_v = t * l;
			let C_v = t * c;
			let L_vt = toe_inv(L_v);
			let C_vt = C_v * L_vt / L_v;
			let rgb_scale = convertOklabToLrgb({
				l: L_vt,
				a: a_ * C_vt,
				b: b_ * C_vt
			});
			let scale_L = Math.cbrt(1 / Math.max(rgb_scale.r, rgb_scale.g, rgb_scale.b, 0));
			l = l / scale_L;
			c = c / scale_L * toe(l) / l;
			l = toe(l);
			const ret = {
				mode: "okhsv",
				s: c ? (S_0 + T) * C_v / (T * S_0 + T * k * C_v) : 0,
				v: l ? l / L_v : 0
			};
			if (ret.s) ret.h = normalizeHue(Math.atan2(b, a) * 180 / Math.PI);
			if (lab.alpha !== void 0) ret.alpha = lab.alpha;
			return ret;
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/okhsv/convertOkhsvToOklab.js
		function convertOkhsvToOklab(hsv) {
			const ret = { mode: "oklab" };
			if (hsv.alpha !== void 0) ret.alpha = hsv.alpha;
			const h = hsv.h !== void 0 ? hsv.h : 0;
			const s = hsv.s !== void 0 ? hsv.s : 0;
			const v = hsv.v !== void 0 ? hsv.v : 0;
			const a_ = Math.cos(h / 180 * Math.PI);
			const b_ = Math.sin(h / 180 * Math.PI);
			const [S_max, T] = get_ST_max(a_, b_);
			const S_0 = .5;
			const k = 1 - S_0 / S_max;
			const L_v = 1 - s * S_0 / (S_0 + T - T * k * s);
			const C_v = s * T * S_0 / (S_0 + T - T * k * s);
			const L_vt = toe_inv(L_v);
			const C_vt = C_v * L_vt / L_v;
			const rgb_scale = convertOklabToLrgb({
				l: L_vt,
				a: a_ * C_vt,
				b: b_ * C_vt
			});
			const scale_L = Math.cbrt(1 / Math.max(rgb_scale.r, rgb_scale.g, rgb_scale.b, 0));
			const L_new = toe_inv(v * L_v);
			const C = C_v * L_new / L_v;
			ret.l = L_new * scale_L;
			ret.a = C * a_ * scale_L;
			ret.b = C * b_ * scale_L;
			return ret;
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/okhsv/modeOkhsv.js
		const modeOkhsv = {
			...definition$20,
			mode: "okhsv",
			channels: [
				"h",
				"s",
				"v",
				"alpha"
			],
			parse: ["--okhsv"],
			serialize: "--okhsv",
			fromMode: {
				oklab: convertOklabToOkhsv,
				rgb: (c) => convertOklabToOkhsv(convertRgbToOklab(c))
			},
			toMode: {
				oklab: convertOkhsvToOklab,
				rgb: (c) => convertOklabToRgb(convertOkhsvToOklab(c))
			}
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/oklab/parseOklab.js
		function parseOklab(color, parsed) {
			if (!parsed || parsed[0] !== "oklab") return;
			const res = { mode: "oklab" };
			const [, l, a, b, alpha] = parsed;
			if (l.type === Tok.Hue || a.type === Tok.Hue || b.type === Tok.Hue) return;
			if (l.type !== Tok.None) res.l = Math.min(Math.max(0, l.type === Tok.Number ? l.value : l.value / 100), 1);
			if (a.type !== Tok.None) res.a = a.type === Tok.Number ? a.value : a.value * .4 / 100;
			if (b.type !== Tok.None) res.b = b.type === Tok.Number ? b.value : b.value * .4 / 100;
			if (alpha.type !== Tok.None) res.alpha = Math.min(1, Math.max(0, alpha.type === Tok.Number ? alpha.value : alpha.value / 100));
			return res;
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/oklab/definition.js
		const definition$8 = {
			...definition$15,
			mode: "oklab",
			toMode: {
				lrgb: convertOklabToLrgb,
				rgb: convertOklabToRgb
			},
			fromMode: {
				lrgb: convertLrgbToOklab,
				rgb: convertRgbToOklab
			},
			ranges: {
				l: [0, 1],
				a: [-.4, .4],
				b: [-.4, .4]
			},
			parse: [parseOklab],
			serialize: (c) => `oklab(${c.l !== void 0 ? c.l : "none"} ${c.a !== void 0 ? c.a : "none"} ${c.b !== void 0 ? c.b : "none"}${c.alpha < 1 ? ` / ${c.alpha}` : ""})`
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/oklch/parseOklch.js
		function parseOklch(color, parsed) {
			if (!parsed || parsed[0] !== "oklch") return;
			const res = { mode: "oklch" };
			const [, l, c, h, alpha] = parsed;
			if (l.type !== Tok.None) {
				if (l.type === Tok.Hue) return;
				res.l = Math.min(Math.max(0, l.type === Tok.Number ? l.value : l.value / 100), 1);
			}
			if (c.type !== Tok.None) res.c = Math.max(0, c.type === Tok.Number ? c.value : c.value * .4 / 100);
			if (h.type !== Tok.None) {
				if (h.type === Tok.Percentage) return;
				res.h = h.value;
			}
			if (alpha.type !== Tok.None) res.alpha = Math.min(1, Math.max(0, alpha.type === Tok.Number ? alpha.value : alpha.value / 100));
			return res;
		}
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/oklch/definition.js
		const definition$7 = {
			...definition$13,
			mode: "oklch",
			toMode: {
				oklab: (c) => convertLchToLab(c, "oklab"),
				rgb: (c) => convertOklabToRgb(convertLchToLab(c, "oklab"))
			},
			fromMode: {
				rgb: (c) => convertLabToLch(convertRgbToOklab(c), "oklch"),
				oklab: (c) => convertLabToLch(c, "oklch")
			},
			parse: [parseOklch],
			serialize: (c) => `oklch(${c.l !== void 0 ? c.l : "none"} ${c.c !== void 0 ? c.c : "none"} ${c.h !== void 0 ? c.h : "none"}${c.alpha < 1 ? ` / ${c.alpha}` : ""})`,
			ranges: {
				l: [0, 1],
				c: [0, .4],
				h: [0, 360]
			}
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/p3/convertP3ToXyz65.js
		const convertP3ToXyz65 = (rgb) => {
			let { r, g, b, alpha } = convertRgbToLrgb(rgb);
			let res = {
				mode: "xyz65",
				x: .486570948648216 * r + .265667693169093 * g + .1982172852343625 * b,
				y: .2289745640697487 * r + .6917385218365062 * g + .079286914093745 * b,
				z: 0 * r + .0451133818589026 * g + 1.043944368900976 * b
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/p3/convertXyz65ToP3.js
		const convertXyz65ToP3 = ({ x, y, z, alpha }) => {
			if (x === void 0) x = 0;
			if (y === void 0) y = 0;
			if (z === void 0) z = 0;
			let res = convertLrgbToRgb({
				r: x * 2.4934969119414263 - y * .9313836179191242 - .402710784450717 * z,
				g: x * -.8294889695615749 + y * 1.7626640603183465 + .0236246858419436 * z,
				b: x * .0358458302437845 - y * .0761723892680418 + .9568845240076871 * z
			}, "p3");
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/p3/definition.js
		const definition$6 = {
			...definition$27,
			mode: "p3",
			parse: ["display-p3"],
			serialize: "display-p3",
			fromMode: {
				rgb: (color) => convertXyz65ToP3(convertRgbToXyz65(color)),
				xyz65: convertXyz65ToP3
			},
			toMode: {
				rgb: (color) => convertXyz65ToRgb(convertP3ToXyz65(color)),
				xyz65: convertP3ToXyz65
			}
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/prophoto/convertXyz50ToProphoto.js
		const gamma$1 = (v) => {
			let abs = Math.abs(v);
			if (abs >= 1 / 512) return Math.sign(v) * Math.pow(abs, 1 / 1.8);
			return 16 * v;
		};
		const convertXyz50ToProphoto = ({ x, y, z, alpha }) => {
			if (x === void 0) x = 0;
			if (y === void 0) y = 0;
			if (z === void 0) z = 0;
			let res = {
				mode: "prophoto",
				r: gamma$1(x * 1.3457868816471585 - y * .2555720873797946 - .0511018649755453 * z),
				g: gamma$1(x * -.5446307051249019 + y * 1.5082477428451466 + .0205274474364214 * z),
				b: gamma$1(x * 0 + y * 0 + 1.2119675456389452 * z)
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/prophoto/convertProphotoToXyz50.js
		const linearize$1 = (v = 0) => {
			let abs = Math.abs(v);
			if (abs >= 16 / 512) return Math.sign(v) * Math.pow(abs, 1.8);
			return v / 16;
		};
		const convertProphotoToXyz50 = (prophoto) => {
			let r = linearize$1(prophoto.r);
			let g = linearize$1(prophoto.g);
			let b = linearize$1(prophoto.b);
			let res = {
				mode: "xyz50",
				x: .7977666449006423 * r + .1351812974005331 * g + .0313477341283922 * b,
				y: .2880748288194013 * r + .7118352342418731 * g + 899369387256e-16 * b,
				z: 0 * r + 0 * g + .8251046025104602 * b
			};
			if (prophoto.alpha !== void 0) res.alpha = prophoto.alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/prophoto/definition.js
		const definition$5 = {
			...definition$27,
			mode: "prophoto",
			parse: ["prophoto-rgb"],
			serialize: "prophoto-rgb",
			fromMode: {
				xyz50: convertXyz50ToProphoto,
				rgb: (color) => convertXyz50ToProphoto(convertRgbToXyz50(color))
			},
			toMode: {
				xyz50: convertProphotoToXyz50,
				rgb: (color) => convertXyz50ToRgb(convertProphotoToXyz50(color))
			}
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rec2020/convertXyz65ToRec2020.js
		const α$1 = 1.09929682680944;
		const β$1 = .018053968510807;
		const gamma = (v) => {
			const abs = Math.abs(v);
			if (abs > β$1) return (Math.sign(v) || 1) * (α$1 * Math.pow(abs, .45) - .09929682680944008);
			return 4.5 * v;
		};
		const convertXyz65ToRec2020 = ({ x, y, z, alpha }) => {
			if (x === void 0) x = 0;
			if (y === void 0) y = 0;
			if (z === void 0) z = 0;
			let res = {
				mode: "rec2020",
				r: gamma(x * 1.7166511879712683 - y * .3556707837763925 - .2533662813736599 * z),
				g: gamma(x * -.6666843518324893 + y * 1.6164812366349395 + .0157685458139111 * z),
				b: gamma(x * .0176398574453108 - y * .0427706132578085 + .9421031212354739 * z)
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rec2020/convertRec2020ToXyz65.js
		const α = 1.09929682680944;
		const β = .018053968510807;
		const linearize = (v = 0) => {
			let abs = Math.abs(v);
			if (abs < β * 4.5) return v / 4.5;
			return (Math.sign(v) || 1) * Math.pow((abs + α - 1) / α, 1 / .45);
		};
		const convertRec2020ToXyz65 = (rec2020) => {
			let r = linearize(rec2020.r);
			let g = linearize(rec2020.g);
			let b = linearize(rec2020.b);
			let res = {
				mode: "xyz65",
				x: .6369580483012911 * r + .1446169035862083 * g + .1688809751641721 * b,
				y: .262700212011267 * r + .6779980715188708 * g + .059301716469862 * b,
				z: 0 * r + .0280726930490874 * g + 1.0609850577107909 * b
			};
			if (rec2020.alpha !== void 0) res.alpha = rec2020.alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rec2020/definition.js
		const definition$4 = {
			...definition$27,
			mode: "rec2020",
			fromMode: {
				xyz65: convertXyz65ToRec2020,
				rgb: (color) => convertXyz65ToRec2020(convertRgbToXyz65(color))
			},
			toMode: {
				xyz65: convertRec2020ToXyz65,
				rgb: (color) => convertXyz65ToRgb(convertRec2020ToXyz65(color))
			},
			parse: ["rec2020"],
			serialize: "rec2020"
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyb/constants.js
		const bias = .0037930732552754493;
		const bias_cbrt = Math.cbrt(bias);
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyb/convertRgbToXyb.js
		const transfer$1 = (v) => Math.cbrt(v) - bias_cbrt;
		const convertRgbToXyb = (color) => {
			const { r, g, b, alpha } = convertRgbToLrgb(color);
			const l = transfer$1(.3 * r + .622 * g + .078 * b + bias);
			const m = transfer$1(.23 * r + .692 * g + .078 * b + bias);
			const s = transfer$1(.2434226892454782 * r + .2047674442449682 * g + .5518098665095535 * b + bias);
			const res = {
				mode: "xyb",
				x: (l - m) / 2,
				y: (l + m) / 2,
				b: s - (l + m) / 2
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyb/convertXybToRgb.js
		const transfer = (v) => Math.pow(v + bias_cbrt, 3);
		const convertXybToRgb = ({ x, y, b, alpha }) => {
			if (x === void 0) x = 0;
			if (y === void 0) y = 0;
			if (b === void 0) b = 0;
			const l = transfer(x + y) - bias;
			const m = transfer(y - x) - bias;
			const s = transfer(b + y) - bias;
			const res = convertLrgbToRgb({
				r: 11.031566904639861 * l - 9.866943908131562 * m - .16462299650829934 * s,
				g: -3.2541473810744237 * l + 4.418770377582723 * m - .16462299650829934 * s,
				b: -3.6588512867136815 * l + 2.7129230459360922 * m + 1.9459282407775895 * s
			});
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyb/definition.js
		const definition$3 = {
			mode: "xyb",
			channels: [
				"x",
				"y",
				"b",
				"alpha"
			],
			parse: ["--xyb"],
			serialize: "--xyb",
			toMode: { rgb: convertXybToRgb },
			fromMode: { rgb: convertRgbToXyb },
			ranges: {
				x: [-.0154, .0281],
				y: [0, .8453],
				b: [-.2778, .388]
			},
			interpolate: {
				x: interpolatorLinear,
				y: interpolatorLinear,
				b: interpolatorLinear,
				alpha: {
					use: interpolatorLinear,
					fixup: fixupAlpha
				}
			}
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz50/definition.js
		const definition$2 = {
			mode: "xyz50",
			parse: ["xyz-d50"],
			serialize: "xyz-d50",
			toMode: {
				rgb: convertXyz50ToRgb,
				lab: convertXyz50ToLab
			},
			fromMode: {
				rgb: convertRgbToXyz50,
				lab: convertLabToXyz50
			},
			channels: [
				"x",
				"y",
				"z",
				"alpha"
			],
			ranges: {
				x: [0, .964],
				y: [0, .999],
				z: [0, .825]
			},
			interpolate: {
				x: interpolatorLinear,
				y: interpolatorLinear,
				z: interpolatorLinear,
				alpha: {
					use: interpolatorLinear,
					fixup: fixupAlpha
				}
			}
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz65/convertXyz65ToXyz50.js
		const convertXyz65ToXyz50 = (xyz65) => {
			let { x, y, z, alpha } = xyz65;
			if (x === void 0) x = 0;
			if (y === void 0) y = 0;
			if (z === void 0) z = 0;
			let res = {
				mode: "xyz50",
				x: 1.0479298208405488 * x + .0229467933410191 * y - .0501922295431356 * z,
				y: .0296278156881593 * x + .990434484573249 * y - .0170738250293851 * z,
				z: -.0092430581525912 * x + .0150551448965779 * y + .7518742899580008 * z
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz65/convertXyz50ToXyz65.js
		const convertXyz50ToXyz65 = (xyz50) => {
			let { x, y, z, alpha } = xyz50;
			if (x === void 0) x = 0;
			if (y === void 0) y = 0;
			if (z === void 0) z = 0;
			let res = {
				mode: "xyz65",
				x: .9554734527042182 * x - .0230985368742614 * y + .0632593086610217 * z,
				y: -.0283697069632081 * x + 1.0099954580058226 * y + .021041398966943 * z,
				z: .0123140016883199 * x - .0205076964334779 * y + 1.3303659366080753 * z
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz65/definition.js
		const definition$1 = {
			mode: "xyz65",
			toMode: {
				rgb: convertXyz65ToRgb,
				xyz50: convertXyz65ToXyz50
			},
			fromMode: {
				rgb: convertRgbToXyz65,
				xyz50: convertXyz50ToXyz65
			},
			ranges: {
				x: [0, .95],
				y: [0, 1],
				z: [0, 1.088]
			},
			channels: [
				"x",
				"y",
				"z",
				"alpha"
			],
			parse: ["xyz", "xyz-d65"],
			serialize: "xyz-d65",
			interpolate: {
				x: interpolatorLinear,
				y: interpolatorLinear,
				z: interpolatorLinear,
				alpha: {
					use: interpolatorLinear,
					fixup: fixupAlpha
				}
			}
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/yiq/convertRgbToYiq.js
		const convertRgbToYiq = ({ r, g, b, alpha }) => {
			if (r === void 0) r = 0;
			if (g === void 0) g = 0;
			if (b === void 0) b = 0;
			const res = {
				mode: "yiq",
				y: .29889531 * r + .58662247 * g + .11448223 * b,
				i: .59597799 * r - .2741761 * g - .32180189 * b,
				q: .21147017 * r - .52261711 * g + .31114694 * b
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/yiq/convertYiqToRgb.js
		const convertYiqToRgb = ({ y, i, q, alpha }) => {
			if (y === void 0) y = 0;
			if (i === void 0) i = 0;
			if (q === void 0) q = 0;
			const res = {
				mode: "rgb",
				r: y + .95608445 * i + .6208885 * q,
				g: y - .27137664 * i - .6486059 * q,
				b: y - 1.10561724 * i + 1.70250126 * q
			};
			if (alpha !== void 0) res.alpha = alpha;
			return res;
		};
		// ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/yiq/definition.js
		const definition = {
			mode: "yiq",
			toMode: { rgb: convertYiqToRgb },
			fromMode: { rgb: convertRgbToYiq },
			channels: [
				"y",
				"i",
				"q",
				"alpha"
			],
			parse: ["--yiq"],
			serialize: "--yiq",
			ranges: {
				i: [-.595, .595],
				q: [-.522, .522]
			},
			interpolate: {
				y: interpolatorLinear,
				i: interpolatorLinear,
				q: interpolatorLinear,
				alpha: {
					use: interpolatorLinear,
					fixup: fixupAlpha
				}
			}
		};
		const clamp$1 = (value) => Math.max(0, Math.min(1, value || 0));
		const fixup = (value) => Math.round(clamp$1(value) * 255);
		const rgb$1 = converter("rgb");
		const serializeHex = (color) => {
			if (color === void 0) return;
			let r = fixup(color.r);
			let g = fixup(color.g);
			let b = fixup(color.b);
			return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
		};
		const formatHex = (c) => serializeHex(rgb$1(c));
		useMode(definition$26);
		useMode(definition$25);
		useMode(definition$24);
		useMode(definition$23);
		useMode(definition$22);
		useMode(definition$21);
		useMode(definition$20);
		useMode(definition$19);
		useMode(definition$18);
		useMode(definition$17);
		useMode(definition$16);
		useMode(definition$15);
		useMode(definition$14);
		useMode(definition$13);
		useMode(definition$12);
		useMode(definition$11);
		useMode(definition$10);
		useMode(definition$9);
		useMode(modeOkhsl);
		useMode(modeOkhsv);
		useMode(definition$8);
		const oklch = useMode(definition$7);
		useMode(definition$6);
		useMode(definition$5);
		useMode(definition$4);
		const rgb = useMode(definition$27);
		useMode(definition$3);
		useMode(definition$2);
		useMode(definition$1);
		useMode(definition);
		// src/shared/color.ts
		const HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
		const L_MIN = .08;
		const L_MAX = .995;
		/** 归一化成 #RRGGBB（大写）；非法输入返回 null */
		function normalizeHex(value) {
			const trimmed = value.trim();
			if (!HEX_PATTERN.test(trimmed)) return null;
			let hex = trimmed.slice(1);
			if (hex.length === 3) hex = hex.split("").map((char) => char + char).join("");
			return `#${hex.toUpperCase()}`;
		}
		function hexToRgb(hex) {
			const normalized = normalizeHex(hex);
			if (!normalized) throw new Error(`不是合法 HEX：${hex}`);
			return {
				r: parseInt(normalized.slice(1, 3), 16),
				g: parseInt(normalized.slice(3, 5), 16),
				b: parseInt(normalized.slice(5, 7), 16)
			};
		}
		function channelToLinear(channel) {
			const value = channel / 255;
			return value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
		}
		/** WCAG 2.1 相对亮度 */
		function relativeLuminance(hex) {
			const { r, g, b } = hexToRgb(hex);
			return .2126 * channelToLinear(r) + .7152 * channelToLinear(g) + .0722 * channelToLinear(b);
		}
		/** WCAG 2.1 对比度：1 ~ 21 */
		function contrastRatio(foreground, background) {
			const a = relativeLuminance(foreground);
			const b = relativeLuminance(background);
			const lighter = Math.max(a, b);
			const darker = Math.min(a, b);
			return (lighter + .05) / (darker + .05);
		}
		function hexToOklch(hex) {
			const converted = oklch(hex);
			if (!converted) throw new Error(`无法转换为 OKLCH：${hex}`);
			return {
				l: converted.l,
				c: converted.c ?? 0,
				h: Number.isFinite(converted.h) ? converted.h : 0
			};
		}
		function inSrgbGamut(l, c, h) {
			const converted = rgb({
				mode: "oklch",
				l,
				c,
				h
			});
			if (!converted) return false;
			const { r, g, b } = converted;
			return Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b) && r >= -1e-4 && r <= 1.0001 && g >= -1e-4 && g <= 1.0001 && b >= -1e-4 && b <= 1.0001;
		}
		/** OKLCH → HEX：保 L 与 H，彩度超出 sRGB 时二分收敛到色域边界 */
		function oklchToHex(color) {
			const l = Math.min(L_MAX, Math.max(L_MIN, color.l));
			const h = Number.isFinite(color.h) ? color.h : 0;
			let c = Math.max(0, color.c);
			if (!inSrgbGamut(l, c, h)) {
				let low = 0;
				let high = c;
				for (let index = 0; index < 24; index += 1) {
					const mid = (low + high) / 2;
					if (inSrgbGamut(l, mid, h)) low = mid;
					else high = mid;
				}
				c = low;
			}
			const converted = rgb({
				mode: "oklch",
				l,
				c,
				h
			});
			return (converted ? formatHex(converted) : "#000000").toUpperCase();
		}
		// src/shared/guidance.ts
		const GUIDANCE = {
			version: "1.0.0",
			source: "motion-web",
			motion: [
				{
					id: "fade-up",
					name: "淡入上浮",
					spec: "区块入场：translateY 16px→0 + opacity 0→1",
					duration: "480ms",
					easing: "cubic-bezier(0.16,1,0.3,1)"
				},
				{
					id: "fade-in",
					name: "淡入",
					spec: "不改变布局的显隐：仅 opacity",
					duration: "200ms",
					easing: "cubic-bezier(0.16,1,0.3,1)"
				},
				{
					id: "scale-pop",
					name: "缩放弹出",
					spec: "焦点卡片：scale .86→1.04→1，轻微过冲",
					duration: "340ms",
					easing: "cubic-bezier(0.34,1.56,0.64,1)"
				},
				{
					id: "slide-left",
					name: "左侧滑入",
					spec: "translateX -26px→0 + opacity",
					duration: "460ms",
					easing: "cubic-bezier(0.16,1,0.3,1)"
				},
				{
					id: "slide-right",
					name: "右侧滑入",
					spec: "translateX 26px→0 + opacity",
					duration: "460ms",
					easing: "cubic-bezier(0.16,1,0.3,1)"
				},
				{
					id: "blur-in",
					name: "模糊聚焦",
					spec: "blur 9px→0 + opacity，用于图片/图层进入",
					duration: "700ms",
					easing: "cubic-bezier(0.16,1,0.3,1)"
				},
				{
					id: "flip-x",
					name: "翻转入场",
					spec: "rotateX 72°→0，需要 perspective",
					duration: "500ms",
					easing: "cubic-bezier(0.16,1,0.3,1)"
				},
				{
					id: "rotate-in",
					name: "旋转入场",
					spec: "rotate -9° + scale .9 → 1",
					duration: "450ms",
					easing: "cubic-bezier(0.16,1,0.3,1)"
				},
				{
					id: "drop-in",
					name: "下落弹入",
					spec: "translateY -46px→0，带重力感",
					duration: "650ms",
					easing: "cubic-bezier(0.16,1,0.3,1)"
				},
				{
					id: "elastic",
					name: "弹性回弹",
					spec: "scale .8→1.13→.96→1，两端都过冲，节制使用",
					duration: "800ms",
					easing: "cubic-bezier(0.68,-0.6,0.32,1.6)"
				},
				{
					id: "shake-x",
					name: "横向抖动",
					spec: "错误反馈：三段横向位移",
					duration: "200ms",
					easing: "cubic-bezier(0.76,0,0.24,1)",
					iterations: 3
				},
				{
					id: "pulse",
					name: "呼吸脉冲",
					spec: "吸引注意：scale 1→1.06→1",
					duration: "300ms",
					easing: "cubic-bezier(0.76,0,0.24,1)",
					iterations: 2
				},
				{
					id: "glow",
					name: "辉光扩散",
					spec: "成功态：box-shadow 环由内向外扩散",
					duration: "450ms",
					easing: "cubic-bezier(0,0.55,0.45,1)"
				},
				{
					id: "shimmer",
					name: "流光扫过",
					spec: "加载占位：背景光带横扫",
					duration: "900ms",
					easing: "linear",
					iterations: 2
				},
				{
					id: "float",
					name: "悬浮浮动",
					spec: "空状态装饰：translateY ±11px 循环",
					duration: "2.4s",
					easing: "cubic-bezier(0.76,0,0.24,1)",
					iterations: 2
				},
				{
					id: "orbit",
					name: "环绕旋转",
					spec: "加载指示：0→360° 旋转",
					duration: "1.2s",
					easing: "linear",
					iterations: 2
				},
				{
					id: "wave",
					name: "波浪起伏",
					spec: "列表错峰：上下交替位移",
					duration: "900ms",
					easing: "cubic-bezier(0.76,0,0.24,1)",
					iterations: 2
				},
				{
					id: "caret",
					name: "光标闪烁",
					spec: "输入提示：竖线明暗切换",
					duration: "1s",
					easing: "steps(1,end)",
					iterations: 3
				},
				{
					id: "sweep",
					name: "掠光扫过",
					spec: "卡片强调：斜向高光掠过表面",
					duration: "700ms",
					easing: "cubic-bezier(0,0.55,0.45,1)"
				},
				{
					id: "drift",
					name: "视差漂移",
					spec: "空间层次：translate3d 跟随指针",
					duration: "1.6s",
					easing: "cubic-bezier(0.76,0,0.24,1)",
					iterations: 2
				}
			],
			antiSlop: [
				{
					id: "a1-default-hero",
					text: "默认英雄区：全幅 + 居中 H1 + 一行副标题 + 两个按钮（一实一虚）。必须打破居中、两个按钮、badge 三者中至少一项；动效页的 hero 常常就是机制本身"
				},
				{
					id: "a2-three-cards",
					text: "居中三栏特性卡：图标在上、粗体名词、两行灰字。若真是三个同级内容，也要用不等权重、堆叠编辑式列表、索引表或一提两降来表达"
				},
				{
					id: "a3-same-section",
					text: "每一屏都是「标题 + 段落，居中」。一页至少要有三种不同的 section 形状——结构多样性才是区分两个设计的东西，配色多样性不是"
				},
				{
					id: "a4-violet-gradient",
					text: "紫蓝渐变（#6366F1→#A855F7）、紫蓝 mesh 背景、发光紫球。两色 + 一个中性色才是调色板，光谱不是；不要把彩虹当主题"
				},
				{
					id: "a5-decoration",
					text: "用装饰代替设计：噪点叠加、漂浮色块、网格底纹、全局辉光。它们不解决空洞，只是把空洞做旧；空洞是结构问题（字号太小、section 太像、没有尺度对比）"
				},
				{
					id: "a6-no-scale-contrast",
					text: "全部字号挤在 16–48px 之间。当前获奖站的显示字号中位数 108px、正文 16px，比值约 8×；低于 4× 就是没有尺度对比"
				},
				{
					id: "a7-fake-chrome",
					text: "假浏览器窗口（红绿灯圆点）、假手机边框、把 pre 包进假 IDE。要么放真实截图进 figure，要么不要框"
				},
				{
					id: "a8-invented-proof",
					text: "编造的社会证明：「+47% 转化」「50,000+ 团队信赖」、五个 logo 占位、编的证言。用户没给的数字不许上页面，改用标注清楚的占位块"
				},
				{
					id: "b1-uniform-hover",
					text: "所有卡片统一 hover 抬升 translateY(-4px) + 阴影。这是动效版的三栏特性卡——用在了所有地方就等于什么都没说；说得出它在表达什么才留"
				},
				{
					id: "b2-scroll-fadeup",
					text: "全页统一的滚动淡入上浮（opacity 0→1、translateY 20px）。多数内容应该本来就在那儿；入场只留给真正受益的两三处，且到达方式要各不相同"
				},
				{
					id: "b3-one-easing",
					text: "全站一个 0.3s ease。要有至少三档时长 token，该有物理感的地方用 spring"
				},
				{
					id: "b4-hero-budget",
					text: "预算全烧在首屏，之后八屏静止。滚动时间轴是排期不是烟花，要把动作分配到全页"
				},
				{
					id: "b5-unrelated-motion",
					text: "动效与内容无关：B2B 页面背后飘粒子、读书会背后转球体。机制必须来自主题自身的物理；换成别的选题也能用，那就是装饰"
				},
				{
					id: "b6-parallax-only",
					text: "把视差当成唯一纵深手段。纵深更多来自遮挡与轮廓交叠，而不是各层速率差"
				},
				{
					id: "b7-trailing-cursor",
					text: "跟着鼠标的小圆点光标（lerp 追尾、不连接任何东西）。2019 年的签名，现在是默认值；要么让光标真正做事（揭示、放大、携带状态），要么用系统光标"
				},
				{
					id: "b8-reduced-motion",
					text: "开启 prefers-reduced-motion 后页面变空白或崩坏。静帧才是页面本体，动效是增强；减弱动效版本不可用等于 A 类闸门从未真正通过"
				}
			],
			hardSpecs: [
				{
					id: "dur-instant",
					text: "instant 80–100ms：光标反馈、tooltip 显隐"
				},
				{
					id: "dur-fast",
					text: "fast 150–200ms：hover 态、按钮按下、开关"
				},
				{
					id: "dur-standard",
					text: "standard 280–350ms：卡片展开、面板滑入、抽屉"
				},
				{
					id: "dur-medium",
					text: "medium 400–500ms：区块揭示、图片打开、滚动触发"
				},
				{
					id: "dur-slow",
					text: "slow 600–800ms：页面进入、hero 文字揭示、路由切换"
				},
				{
					id: "dur-cinematic",
					text: "cinematic 1000–1400ms：冷开场、幕布擦除、戏剧性入场"
				},
				{
					id: "dur-ambient",
					text: "ambient 持续：背景循环、粒子场、呼吸光"
				},
				{
					id: "dur-halve",
					text: "说不出某个时长对应哪种意图，就把它减半"
				},
				{
					id: "ease-out-expo",
					text: "ease-out-expo cubic-bezier(0.16,1,0.3,1)：快进柔落，揭示类默认"
				},
				{
					id: "ease-in-expo",
					text: "ease-in-expo cubic-bezier(0.7,0,0.84,0)：慢起硬出，只用于退场"
				},
				{
					id: "ease-in-out-quart",
					text: "ease-in-out-quart cubic-bezier(0.76,0,0.24,1)：对称平滑，适合自动循环"
				},
				{
					id: "ease-out-back",
					text: "ease-out-back cubic-bezier(0.34,1.56,0.64,1)：轻微过冲落地，俏皮 hover"
				},
				{
					id: "ease-out-circ",
					text: "ease-out-circ cubic-bezier(0,0.55,0.45,1)：极快减速，机械清脆"
				},
				{
					id: "ease-sharp",
					text: "ease-sharp cubic-bezier(0.65,0,0.45,1)：硬品牌感，横向开场"
				},
				{
					id: "ease-standard",
					text: "ease-standard cubic-bezier(0.4,0,0.2,1)：Material 默认，安全基线"
				},
				{
					id: "ease-expressive",
					text: "ease-expressive cubic-bezier(0.68,-0.6,0.32,1.6)：两端都过冲，极少用"
				},
				{
					id: "ease-linear",
					text: "linear：滚动擦除、shader uniform 必须用它"
				},
				{
					id: "ease-linear-fn",
					text: "CSS 要真过冲回弹用 linear() 采样点（cubic-bezier 表达不了），如 linear(0,.32 8%,.79 20%,1.03 30%,1.01 46%,1)"
				},
				{
					id: "spring-gentle",
					text: "spring-gentle stiffness 100 / damping 15 / mass 1：柔和无回弹，氛围揭示"
				},
				{
					id: "spring-default",
					text: "spring-default 200 / 22 / 1：自然手感，卡片 hover、抽屉"
				},
				{
					id: "spring-snappy",
					text: "spring-snappy 350 / 28 / 1：高级快弹，按钮反馈"
				},
				{
					id: "spring-bouncy",
					text: "spring-bouncy 200 / 10 / 1：俏皮过冲，游戏化图标"
				},
				{
					id: "spring-heavy",
					text: "spring-heavy 150 / 35 / 1.5：厚重迟缓，大面板"
				},
				{
					id: "spring-stiff",
					text: "spring-stiff 500 / 40 / 1：近乎瞬时，鼠标跟随"
				},
				{
					id: "stagger-tight",
					text: "stagger tight-grid 0.04s/项：数据行、开发工具面板"
				},
				{
					id: "stagger-list",
					text: "stagger standard-list 0.07–0.08s：卡片列表、特性网格、导航项"
				},
				{
					id: "stagger-editorial",
					text: "stagger editorial-line 0.08–0.1s/行：文字揭示、文章段落"
				},
				{
					id: "stagger-cascade",
					text: "stagger dramatic-cascade 0.12–0.18s：获奖站 hero、横向开场"
				},
				{
					id: "stagger-none",
					text: "stagger no-stagger 0s：单一决定性 CTA 入场、脆的品牌动作"
				},
				{
					id: "stagger-native",
					text: "原生错峰无需逐项 index：animation-delay: calc(sibling-index() * 60ms)，Chromium 优先，保留无延迟版本兜底"
				},
				{
					id: "phys-spring",
					text: "欠阻尼弹簧替代 lerp：vel += (target-x)*STIFFNESS*dt（STIFFNESS 60–90），vel *= DAMPING（0.86 弹跳 / 0.90 果冻 / 0.93 平静），x += vel*dt；dt 钳到 1/30"
				},
				{
					id: "phys-velocity",
					text: "速度耦合：lean = clamp(vel*GAIN, -MAX, MAX)（如 GAIN 0.5、MAX ±22°），元素朝行进方向倾斜，停下自然回正"
				},
				{
					id: "phys-wheel",
					text: "滚轮惯性防抖：累积阈值 ~90px 触发一步，锁 550–650ms 吃掉触控板惯性尾巴，acc 每帧 ×0.92 衰减"
				},
				{
					id: "phys-jelly",
					text: "次级果冻：主运动速度喂进松弹簧（阻尼 ~0.90），体积守恒 scale(1+j·k, 1-j·k)，各元素增益/方向/相位不同（×1.0/×1.6/×2.1）"
				},
				{
					id: "phys-follow-exp",
					text: "跟随必须帧率无关：x += (target-x) * (1 - exp(-k*dt))，k 是 1/s 的紧度不是每帧比例；实测 k：相机跟随 4.5、yaw 回中 2.2、pitch 回平 0.35"
				},
				{
					id: "phys-follow-lead",
					text: "跟随移动目标会稳定落后 speed/k：aim = targetPos + targetVel/k 抵消；「跟手但总差一点」是缺前馈项，不是弹簧不够硬"
				},
				{
					id: "phys-one-filter",
					text: "一个量只能有一个滤波器、一个目标；在滤波之后再叠加修正会导致每帧回拉（抖动的真实成因）"
				},
				{
					id: "phys-critical",
					text: "该停住的量用临界阻尼 c = 2√k，零过冲；k=120（≈0.09s 到 63%）适合姿态，k=200（≈0.14s）适合尺寸生长"
				},
				{
					id: "phys-accel",
					text: "姿态由加速度驱动而不是输入驱动：读输入会让身体「宣告」输入，读加速度才让它「回应」世界"
				},
				{
					id: "phys-verify-fps",
					text: "任何声称帧率无关的公式，都要在 30/60/120fps 下跑同一输入并对比轨迹"
				},
				{
					id: "perf-cheap",
					text: "便宜档：transform（translate/scale/rotate/skew）与 opacity 永远安全"
				},
				{
					id: "perf-medium",
					text: "中等档：filter blur/brightness、clip-path，面积小可以用"
				},
				{
					id: "perf-expensive",
					text: "昂贵档：width/height/padding/margin/top/left 触发 layout，动画里避免；要动尺寸用 scaleX/scaleY + transform-origin"
				},
				{
					id: "perf-very-expensive",
					text: "极贵：大模糊 box-shadow、缩放中的 border-radius（重绘），动画里避免"
				},
				{
					id: "perf-will-change",
					text: "will-change 只给正在动的元素，动画结束移除，绝不全局声明"
				},
				{
					id: "type-ratio",
					text: "显示字号 ÷ 正文字号 ≥ 4×；当前获奖站中位数约 8×（显示 108px / 正文 16px，n=12），区间 3.3×–14×"
				},
				{
					id: "type-display",
					text: "最大字号中位数 108px，区间 52–218px；正文 16px，区间 10–16px，多站用 12px 正文让大字号更显大"
				},
				{
					id: "type-families",
					text: "字体家族中位数 2 个（1–4）：一个 grotesk 打底 + 一个衬线做对比即可"
				},
				{
					id: "layout-no-maxwidth",
					text: "15/15 获奖站都没有给 body 设全局 max-width——度量按元素设定；全局居中列读起来像文档不像设计"
				},
				{
					id: "layout-palette",
					text: "主导色中位数 4 个（1–6），#FFFFFF 出现 15/15、#000000 14/15；饱和色通常只有 1 个色相且用得克制"
				},
				{
					id: "layout-no-gradient-bg",
					text: "渐变当背景在这批样本里 0/15；紫蓝系全样本只出现 1 次"
				},
				{
					id: "layout-sections",
					text: "每页不同的 section 形状：创意站中位数 2.5，产品站中位数 5；每页至少 3 种"
				},
				{
					id: "layout-h1",
					text: "每页恰好一个 h1；section 标题左对齐约为居中的 3 倍（76% vs 21%）"
				},
				{
					id: "layout-grid4",
					text: "间距落在 4 的网格上：4/6/8/12/16/24 为主"
				},
				{
					id: "comp-dialect",
					text: "先定组件方言：创意站 border-radius 中位数 1 种、按钮圆角多为 0px、box-shadow 中位数 0；产品站圆角中位数 8 种、阴影中位数 17.5"
				},
				{
					id: "comp-dialect-check",
					text: "方言属于「画布」而非「控件」：创意画布可以内含产品控件；把产品画布（导航+CTA+hero+三卡+五列页脚）套在创意内容上才是 AI 味来源"
				},
				{
					id: "comp-nav",
					text: "两种方言都同意：导航高度 ≈64px，按钮文字 ≈14px，页脚创意站 2 列 4 链接、产品站 5 列 35 链接"
				},
				{
					id: "comp-states",
					text: "每个交互组件都要交齐状态矩阵：rest / hover / active / focus-visible / disabled / loading / error / empty / success"
				},
				{
					id: "comp-focus",
					text: "用 :focus-visible 而不是 :focus；outline: 2px solid、offset 3px，绝不 outline:none 却不给替代"
				},
				{
					id: "comp-hover-query",
					text: "hover 样式必须包在 @media (hover: hover) and (pointer: fine) 里，触屏不能有粘住的 hover"
				},
				{
					id: "comp-active",
					text: "按下要有真实反馈：scale 0.98 或一个颜色台阶，≤80ms"
				},
				{
					id: "comp-error",
					text: "错误信息贴住控件、配 aria-describedby，永远不只用颜色表达"
				},
				{
					id: "comp-images",
					text: "图片预留盒子：创意站仅 37% 预留、产品站 76%；srcset 创意 15%、产品 48%"
				},
				{
					id: "bank-l01-bento",
					text: "Bento 网格：12 列 CSS Grid，gap 1px 本身就是边框；max-width 1100–1200px 居中；区块间距 5–6rem；768px 坍成一列并保留圆角"
				},
				{
					id: "bank-l02-editorial",
					text: "编辑单列：单列居中 680–720px；区块间距 6–10rem（留白就是设计）；移动端满宽 + 1.5rem 内边距，字号不变"
				},
				{
					id: "bank-l03-asymmetric",
					text: "非对称分栏：2:1 或 3:1 主内容 + 侧栏；max-width 1100px；区块间距 4rem；768px 反转为单列、侧栏内容下移"
				},
				{
					id: "bank-l04-fullbleed",
					text: "满幅沉浸：100vw 分区，内容在内部定位，无全局容器（或内部 1400px 封顶）；区块间距 0——边界是视觉的，不是空间的"
				},
				{
					id: "bank-l05-masonry",
					text: "瀑布流图墙：CSS columns 或 JS masonry，行高可变；max-width 1400px；1024px 两列、640px 单列"
				}
			]
		};
		// src/client/preview.ts
		/**
		* Palette bridge between the vault snapshot and the preview.
		*
		* The colours are the style's own: `bg`, `surface`, `muted` and `text` come
		* straight from `styles.json`. The seed only nudges the accent's OKLCH hue by at
		* most ±18°, so a style can be explored without losing its identity.
		*
		* @module design-vault-plugin/client/preview
		*/
		/** Used only when a vault row is missing a key; never on a normal path. */
		const FALLBACK = {
			primary: "#4C6EF5",
			bg: "#F4F5F7",
			surface: "#FFFFFF",
			text: "#111318",
			muted: "#5B6270"
		};
		/** FNV-1a over UTF-16 code units: small, stable, no dependencies. */
		function fnv1a(input) {
			let hash = 2166136261;
			for (let index = 0; index < input.length; index += 1) {
				hash ^= input.charCodeAt(index);
				hash = Math.imul(hash, 16777619) >>> 0;
			}
			return hash >>> 0;
		}
		/**
		* Rotate a colour's OKLCH hue by a seed-derived amount.
		*
		* @param primary - the style's own primary colour.
		* @param seed - free-form text; empty means "no shift".
		*/
		function deriveAccent(primary, seed) {
			const base = normalizeHex(primary) ?? FALLBACK.primary;
			const trimmed = seed.trim();
			if (trimmed === "") return {
				hex: base,
				hueShift: 0
			};
			const hueShift = fnv1a(trimmed) % 37 - 18;
			if (hueShift === 0) return {
				hex: base,
				hueShift: 0
			};
			const oklch = hexToOklch(base);
			return {
				hex: oklchToHex({
					l: oklch.l,
					c: oklch.c,
					h: (oklch.h + hueShift + 360) % 360
				}),
				hueShift
			};
		}
		/**
		* Read the preview palette out of a style's stored palette.
		*
		* @param palette - the style's palette exactly as stored in the vault.
		* @param seed - free-form text that slightly rotates the accent.
		*/
		function paletteFromStyle(palette, seed) {
			const accent = deriveAccent(palette.primary ?? FALLBACK.primary, seed);
			return {
				background: normalizeHex(palette.bg ?? "") ?? FALLBACK.bg,
				card: normalizeHex(palette.surface ?? "") ?? FALLBACK.surface,
				content: normalizeHex(palette.muted ?? "") ?? FALLBACK.muted,
				title: normalizeHex(palette.text ?? "") ?? FALLBACK.text,
				accent: accent.hex,
				hueShift: accent.hueShift
			};
		}
		/**
		* Project the live preview into the exported shape.
		*
		* A pure mapping, so the JSON on screen is always exactly the panel on screen.
		*
		* @param input - current controls, shape tokens and the palette being painted.
		*/
		function buildDesignConfigExport(input) {
			const { vibeId, vibeName, seed, paletteId, controls, palette } = input;
			return {
				vibe: vibeId,
				vibeName,
				seed,
				paletteId,
				density: controls.density,
				typography: controls.typography,
				layout: controls.layout,
				radius: controls.radius,
				shadow: controls.shadow,
				border: controls.border,
				motion: controls.motion,
				palette: {
					background: palette.background,
					card: palette.card,
					content: palette.content,
					title: palette.title
				},
				guidance: GUIDANCE
			};
		}
		// src/client/palette-slots.ts
		/**
		* Turn an unordered HEX list into the five surfaces the canvas paints.
		*
		* A curated palette carries no roles, so placement has to be deterministic —
		* and it has to survive palettes that were never meant to be UIs: pastel-only
		* sets with no dark colour, or dark sets whose brightest colour is a neon accent.
		*
		* The rules, in order:
		*
		*   1. paper is the lightest colour — unless the lightest is a vivid colour and
		*      something much darker exists, which means the palette is a dark one;
		*   2. accent is the most chromatic colour that is not the paper;
		*   3. ink is whatever contrasts most with the paper, pushed darker (or lighter)
		*      until it clears 4.5:1 — a pastel palette gets a synthesized title colour;
		*   4. content is the next best contrast, nudged toward the paper and re-checked,
		*      so body text never lands on the midpoint grey that fails AA;
		*   5. surface is a neutral step off the paper, derived when the palette has none.
		*
		* @module design-vault-plugin/client/palette-slots
		*/
		/**
		* Use a vendored visual-bank archetype as-is.
		*
		* These arrive with explicit roles (`text_primary` → title, `text_secondary` →
		* content), so nothing is inferred; only the accent follows the seed.
		*
		* @param entry - one `BANK_PALETTES` row.
		* @param seed - rotates the accent.
		*/
		function bankPalette(entry, seed) {
			const accent = deriveAccent(entry.accent, seed);
			return {
				background: entry.background,
				card: entry.surface,
				content: entry.content,
				title: entry.title,
				accent: accent.hex,
				hueShift: accent.hueShift
			};
		}
		/** Below this chroma a colour reads as neutral and may become a surface. */
		const NEUTRAL_CHROMA = .06;
		/** Lightness gap below which a surface would read as the paper. */
		const CARD_SEPARATION = .04;
		/** AA for body text. */
		const MIN_CONTRAST = 4.5;
		/** A paper above this chroma is assumed to be a vivid colour, not paper. */
		const VIVID_PAPER_CHROMA = .12;
		function clamp(value, min, max) {
			return Math.min(Math.max(value, min), max);
		}
		const isNeutral = (color) => color.c < NEUTRAL_CHROMA;
		/**
		* Move a colour away from the paper until it clears `target` contrast.
		*
		* Walks in 40 steps toward the far end of the lightness axis, shedding chroma as
		* it goes, so a synthesized ink still carries the palette's hue.
		*/
		function pushForContrast(seed, paper, target) {
			const seedColor = hexToOklch(seed);
			const end = hexToOklch(paper).l < .5 ? .98 : .05;
			let candidate = seed;
			for (let step = 1; step <= 40; step += 1) {
				const ratio = step / 40;
				candidate = oklchToHex({
					l: clamp(seedColor.l + (end - seedColor.l) * ratio, .03, .99),
					c: seedColor.c * (1 - ratio * .6),
					h: seedColor.h
				});
				if (contrastRatio(candidate, paper) >= target) return candidate;
			}
			return candidate;
		}
		/** A surface that is one step off the paper in the direction the theme allows. */
		function deriveSurface(paper, dark) {
			return {
				l: clamp(paper.l + (dark ? .06 : -.045), .02, .98),
				c: paper.c * .8,
				h: paper.h
			};
		}
		/**
		* Map a raw colour list onto the five surfaces.
		*
		* @param colors - HEX strings; invalid entries are dropped.
		* @param seed - rotates the accent, exactly like a style palette.
		* @returns the palette, or `null` when no colour survived validation.
		*/
		function slotsFromColors(colors, seed) {
			const ranked = colors.map((hex) => normalizeHex(hex)).filter((hex) => hex !== null).map((hex) => ({
				hex,
				oklch: hexToOklch(hex)
			})).sort((a, b) => a.oklch.l - b.oklch.l);
			if (ranked.length === 0) return null;
			const darkest = ranked[0];
			const lightest = ranked[ranked.length - 1];
			const dark = lightest.oklch.c > VIVID_PAPER_CHROMA && darkest.oklch.l < .35;
			const paperEntry = dark ? darkest : lightest;
			const paper = paperEntry.hex;
			const paperColor = paperEntry.oklch;
			if (ranked.length === 1) {
				const ink = pushForContrast(paper, paper, MIN_CONTRAST);
				const accentOnly = deriveAccent(paper, seed);
				return {
					background: paper,
					card: oklchToHex(deriveSurface(paperColor, dark)),
					content: ink,
					title: ink,
					accent: accentOnly.hex,
					hueShift: accentOnly.hueShift
				};
			}
			const others = ranked.filter((item) => item.hex !== paper);
			const accent = deriveAccent(others.reduce((best, item) => item.oklch.c > best.oklch.c ? item : best).hex, seed);
			const inkSeed = others.reduce((best, item) => contrastRatio(item.hex, paper) > contrastRatio(best.hex, paper) ? item : best).hex;
			const title = contrastRatio(inkSeed, paper) >= MIN_CONTRAST ? inkSeed : pushForContrast(inkSeed, paper, MIN_CONTRAST);
			const contentPool = others.filter((item) => item.hex !== title);
			const contentSeed = contentPool.length > 0 ? contentPool.reduce((best, item) => contrastRatio(item.hex, paper) > contrastRatio(best.hex, paper) ? item : best).hex : title;
			const direct = contrastRatio(contentSeed, paper) >= MIN_CONTRAST ? contentSeed : title;
			const titleColor = hexToOklch(title);
			const towardPaper = paperColor.l < .5 ? -.07 : .07;
			const softened = oklchToHex({
				l: clamp(titleColor.l + towardPaper, .03, .99),
				c: titleColor.c,
				h: titleColor.h
			});
			const content = direct === title && contrastRatio(softened, paper) >= MIN_CONTRAST ? softened : direct;
			const surfaceTarget = deriveSurface(paperColor, dark);
			return {
				background: paper,
				card: others.filter((item) => isNeutral(item.oklch) && Math.abs(item.oklch.l - paperColor.l) >= CARD_SEPARATION && Math.abs(item.oklch.l - surfaceTarget.l) <= .12).reduce((best, item) => {
					if (best === null) return item;
					return Math.abs(item.oklch.l - surfaceTarget.l) < Math.abs(best.oklch.l - surfaceTarget.l) ? item : best;
				}, null)?.hex ?? oklchToHex(surfaceTarget),
				content,
				title,
				accent: accent.hex,
				hueShift: accent.hueShift
			};
		}
		// src/client/style-tokens.ts
		/**
		* The design-system table behind the preview — every dimension the panel
		* exposes is data here, so the canvas, the exported DesignConfig and any future
		* CSS writer read the same numbers.
		*
		* Tokens are Capitalised on purpose: they are the values that reach the export,
		* so they should read as design vocabulary (`Airy`, `Editorial Serif`), not as
		* size abbreviations.
		*
		* @module design-vault-plugin/client/style-tokens
		*/
		/** Corner radius per token, in px. */
		const RADIUS_PX = {
			None: 0,
			Sm: 6,
			Md: 12,
			Lg: 20,
			Full: 999
		};
		const SHADOW_CSS = {
			None: "none",
			Sm: "0 1px 2px rgba(0,0,0,.10), 0 1px 1px rgba(0,0,0,.06)",
			Md: "0 4px 10px rgba(0,0,0,.14), 0 2px 4px rgba(0,0,0,.08)",
			Lg: "0 12px 28px rgba(0,0,0,.20), 0 4px 10px rgba(0,0,0,.10)",
			Xl: "0 28px 60px rgba(0,0,0,.28), 0 10px 20px rgba(0,0,0,.14)"
		};
		/** Gap between blocks, padding around them, and padding inside each block. */
		const DENSITY_CSS = {
			Compact: {
				gap: 6,
				padding: 10,
				inset: 8
			},
			Dense: {
				gap: 8,
				padding: 12,
				inset: 10
			},
			Balanced: {
				gap: 14,
				padding: 20,
				inset: 14
			},
			Comfortable: {
				gap: 18,
				padding: 24,
				inset: 16
			},
			Airy: {
				gap: 22,
				padding: 28,
				inset: 18
			}
		};
		const SANS = "ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", sans-serif";
		const SERIF = "ui-serif, Georgia, Cambria, \"Times New Roman\", serif";
		const MONO = "ui-monospace, \"SF Mono\", Menlo, Consolas, monospace";
		const GEOMETRIC = "\"Avenir Next\", Avenir, Futura, \"Century Gothic\", ui-sans-serif, sans-serif";
		const TYPOGRAPHY_CSS = {
			"Modern Sans": {
				body: SANS,
				heading: SANS,
				weight: 500,
				headingWeight: 800,
				tracking: "-0.01em",
				leading: 1.45
			},
			"Geometric Sans": {
				body: GEOMETRIC,
				heading: GEOMETRIC,
				weight: 500,
				headingWeight: 700,
				tracking: "-0.02em",
				leading: 1.4
			},
			"Editorial Serif": {
				body: SERIF,
				heading: SERIF,
				weight: 400,
				headingWeight: 700,
				tracking: "0.01em",
				leading: 1.72
			},
			"Brutalist Mono": {
				body: MONO,
				heading: MONO,
				weight: 700,
				headingWeight: 800,
				tracking: "-0.03em",
				leading: 1.28
			},
			Mixed: {
				body: SANS,
				heading: SERIF,
				weight: 450,
				headingWeight: 700,
				tracking: "0em",
				leading: 1.55
			},
			"Editorial Thin": {
				body: SANS,
				heading: SANS,
				weight: 400,
				headingWeight: 300,
				tracking: "-0.035em",
				leading: 1.05
			},
			"Grotesk Bold": {
				body: SANS,
				heading: SANS,
				weight: 400,
				headingWeight: 700,
				tracking: "-0.04em",
				leading: 1
			},
			"Swiss System": {
				body: SANS,
				heading: SANS,
				weight: 400,
				headingWeight: 500,
				tracking: "-0.02em",
				leading: 1.15
			},
			"Serif + Sans": {
				body: SANS,
				heading: SERIF,
				weight: 400,
				headingWeight: 400,
				tracking: "-0.01em",
				leading: 1.2
			},
			"Technical Mono": {
				body: SANS,
				heading: MONO,
				weight: 400,
				headingWeight: 500,
				tracking: "0em",
				leading: 1.4
			}
		};
		/** Width in px, plus the alpha the border borrows from the palette. */
		const BORDER_CSS = {
			None: {
				width: 0,
				alpha: 0
			},
			Hairline: {
				width: 1,
				alpha: .18
			},
			Medium: {
				width: 2,
				alpha: .32
			},
			Heavy: {
				width: 4,
				alpha: .55
			}
		};
		const MOTION_CSS = {
			None: {
				transition: "none",
				hoverTransform: "none",
				duration: "0s",
				easing: "linear",
				lift: "none"
			},
			Restrained: {
				transition: "all 0.3s ease",
				hoverTransform: "translateY(-2px)",
				duration: "300ms",
				easing: "cubic-bezier(.22,.61,.36,1)",
				lift: "translateY(-6px)"
			},
			Springy: {
				transition: "all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
				hoverTransform: "translateY(-4px) scale(1.03)",
				duration: "450ms",
				easing: "cubic-bezier(.34,1.56,.64,1)",
				lift: "translateY(-10px) scale(1.02)"
			}
		};
		/** `#RRGGBB` plus an alpha, as a CSS `rgba()` the border can use. */
		function withAlpha(hex, alpha) {
			if (alpha >= 1) return hex;
			const { r, g, b } = hexToRgb(hex);
			return `rgba(${r}, ${g}, ${b}, ${alpha})`;
		}
		// src/client/preview-doc.ts
		/**
		* The preview canvas: a self-contained HTML document rendered in an
		* `<iframe srcdoc>`.
		*
		* Why a document and not React nodes: keyframes, `:hover`, `color-mix()` and
		* pointer parallax are all things inline styles cannot express. The parent only
		* writes CSS custom properties into it and asks for one recipe at a time, so the
		* canvas never reloads and never flickers.
		*
		* @module design-vault-plugin/client/preview-doc
		*/
		/**
		* The twenty recipes, in display order.
		*
		* The canonical list lives in `guidance.ts` so the canvas, the export and the
		* prompt panel cannot drift apart; the canvas keys its CSS classes by position.
		*/
		const MOTION_RECIPES = GUIDANCE.motion.map((recipe) => ({
			key: recipe.id,
			label: recipe.name
		}));
		/** Every value the canvas needs, as CSS custom properties. */
		function previewVars(palette, controls) {
			const density = DENSITY_CSS[controls.density];
			const type = TYPOGRAPHY_CSS[controls.typography];
			const motion = MOTION_CSS[controls.motion];
			const border = BORDER_CSS[controls.border];
			return {
				"--dv-bg": palette.background,
				"--dv-surface": palette.card,
				"--dv-body": palette.content,
				"--dv-ink": palette.title,
				"--dv-primary": palette.accent,
				"--dv-radius": `${RADIUS_PX[controls.radius]}px`,
				"--dv-pad": `${density.padding}px`,
				"--dv-gap": `${density.gap}px`,
				"--dv-inset": `${density.inset}px`,
				"--dv-shadow": SHADOW_CSS[controls.shadow],
				"--dv-shadow-lift": "0 20px 44px rgba(0,0,0,.28), 0 8px 16px rgba(0,0,0,.14)",
				"--dv-border-width": `${border.width}px`,
				"--dv-border-color": border.width === 0 ? "transparent" : withAlpha(palette.content, border.alpha),
				"--dv-font": type.body,
				"--dv-font-head": type.heading,
				"--dv-weight": String(type.weight),
				"--dv-weight-head": String(type.headingWeight),
				"--dv-track": type.tracking,
				"--dv-leading": String(type.leading),
				"--dv-dur": motion.duration,
				"--dv-ease": motion.easing,
				"--dv-lift": motion.lift
			};
		}
		/**
		* Build the message for the current state.
		*
		* @param palette - colours resolved for the selected style.
		* @param controls - the seven shape/type tokens.
		* @param vibeName - style name, shown in the canvas header.
		* @param recipe - 1-based recipe index, 0 for none.
		* @param nonce - monotonically increasing click counter.
		*/
		function previewMessage(palette, controls, vibeName, recipe, nonce) {
			return {
				dv: true,
				vars: previewVars(palette, controls),
				layout: controls.layout,
				vibe: vibeName,
				recipe,
				nonce
			};
		}
		const RECIPE_SELECTORS = MOTION_RECIPES.map((_, index) => `.fx-${index + 1}`).join(",");
		const RECIPE_NAMES = JSON.stringify(MOTION_RECIPES.map((recipe) => recipe.label));
		/**
		* Per-recipe timing, generated from `guidance.motion` (the motion-web duration
		* scale and easing dictionary) so the canvas obeys the same tokens it publishes.
		*/
		const RECIPE_RULES = GUIDANCE.motion.map((recipe, index) => {
			const n = index + 1;
			const iterations = recipe.iterations ?? 1;
			return `.fx-${n}{animation-name:k${n};animation-duration:${recipe.duration};animation-timing-function:${recipe.easing};animation-iteration-count:${iterations}}`;
		}).join("\n");
		/** The document itself. Built once; every later change arrives by message. */
		function buildPreviewDoc(palette, controls, vibeName) {
			return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<style>
:root{${Object.entries(previewVars(palette, controls)).map(([key, value]) => `${key}:${value};`).join("")}}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{
  background:var(--dv-bg);color:var(--dv-ink);font-family:var(--dv-font);font-weight:var(--dv-weight);
  letter-spacing:var(--dv-track);line-height:var(--dv-leading);padding:var(--dv-pad);
  -webkit-font-smoothing:antialiased;overflow:hidden;
  transition:background var(--dv-dur) var(--dv-ease),color var(--dv-dur) var(--dv-ease);
}
.stage{display:grid;gap:var(--dv-gap);height:100%;grid-template-areas:"top top" "hero deck" "split deck";grid-template-columns:1.25fr 1fr;grid-template-rows:auto auto 1fr}
body[data-layout="Bento"] .stage{grid-template-areas:"top top" "hero hero" "split deck"}
body[data-layout="ThreeColumn"] .stage{grid-template-areas:"top top top" "hero split deck";grid-template-columns:1fr 1.15fr 1fr}
body[data-layout="Stack"] .stage{grid-template-areas:"top" "hero" "split" "deck";grid-template-columns:1fr}

.top{grid-area:top;display:flex;align-items:center;justify-content:space-between;gap:12px}
.brand{display:flex;align-items:center;gap:9px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--dv-body)}
.dot{width:9px;height:9px;border-radius:50%;background:var(--dv-primary);box-shadow:0 0 0 4px color-mix(in srgb,var(--dv-primary) 18%,transparent)}
.pill{font-size:10px;letter-spacing:.12em;text-transform:uppercase;padding:4px 10px;border-radius:999px;border:var(--dv-border-width) solid var(--dv-border-color);color:var(--dv-body)}

.hero{grid-area:hero;display:grid;gap:calc(var(--dv-gap) * .5);align-content:start;animation:k1 620ms var(--dv-ease) both}
.hl{margin:0;font-family:var(--dv-font-head);font-weight:var(--dv-weight-head);font-size:clamp(22px,3.6vw,34px);line-height:1.06;letter-spacing:-.025em}
.hl em{font-style:normal;color:var(--dv-primary)}
.bars{display:grid;gap:7px;margin-top:2px}
.bar{height:7px;border-radius:999px;background:color-mix(in srgb,var(--dv-ink) 15%,transparent)}
.bar.w1{width:94%}.bar.w2{width:76%}.bar.w3{width:58%}

.split{grid-area:split;display:grid;grid-template-columns:1.1fr 1fr;gap:var(--dv-gap);min-height:0}
.media{position:relative;overflow:hidden;border-radius:var(--dv-radius);border:var(--dv-border-width) solid var(--dv-border-color);
  background:linear-gradient(140deg,color-mix(in srgb,var(--dv-primary) 26%,var(--dv-surface)),var(--dv-surface));box-shadow:var(--dv-shadow);
  transition:box-shadow var(--dv-dur) var(--dv-ease),transform var(--dv-dur) var(--dv-ease)}
.media:hover{box-shadow:var(--dv-shadow-lift);transform:var(--dv-lift)}
.spark{position:absolute;right:-18%;bottom:-42%;width:78%;aspect-ratio:1;border-radius:50%;
  background:radial-gradient(circle at 32% 30%,color-mix(in srgb,var(--dv-primary) 70%,transparent),transparent 70%);
  filter:blur(4px);transform:translate3d(calc(var(--px) * 12px),calc(var(--py) * 12px),0);transition:transform 120ms linear}
.media .tag{position:absolute;left:12px;bottom:12px;font-size:10px;letter-spacing:.14em;text-transform:uppercase;
  color:color-mix(in srgb,var(--dv-ink) 70%,transparent);background:color-mix(in srgb,var(--dv-surface) 80%,transparent);
  padding:4px 8px;border-radius:999px;border:var(--dv-border-width) solid var(--dv-border-color)}

.copy{display:grid;gap:10px;align-content:start;min-width:0}
.copy strong{font-family:var(--dv-font-head);font-weight:var(--dv-weight-head);font-size:13px;letter-spacing:-.01em}
.copy p{margin:0;font-size:12px;color:var(--dv-body)}
.btn{align-self:start;appearance:none;border:0;cursor:pointer;font:inherit;font-size:12px;font-weight:700;color:#fff;
  background:var(--dv-primary);padding:9px 16px;border-radius:calc(var(--dv-radius) * .7);
  box-shadow:0 6px 16px color-mix(in srgb,var(--dv-primary) 42%,transparent);
  transition:transform var(--dv-dur) var(--dv-ease),filter var(--dv-dur) var(--dv-ease),box-shadow var(--dv-dur) var(--dv-ease)}
.btn:hover{transform:var(--dv-lift);filter:brightness(1.06) saturate(1.05);box-shadow:0 14px 30px color-mix(in srgb,var(--dv-primary) 50%,transparent)}
.btn:active{transform:translateY(0) scale(.985)}

.deck{grid-area:deck;display:grid;align-content:end;min-height:0}
.card{position:relative;overflow:hidden;border-radius:var(--dv-radius);background:var(--dv-surface);border:var(--dv-border-width) solid var(--dv-border-color);
  box-shadow:var(--dv-shadow);padding:calc(var(--dv-inset) * .9);
  transition:transform var(--dv-dur) var(--dv-ease),box-shadow var(--dv-dur) var(--dv-ease);
  animation:k1 720ms var(--dv-ease) both}
.card:hover{transform:var(--dv-lift);box-shadow:var(--dv-shadow-lift)}
.thumb{height:74px;border-radius:calc(var(--dv-radius) * .75);margin-bottom:10px;
  background:linear-gradient(125deg,color-mix(in srgb,var(--dv-primary) 55%,var(--dv-surface)),color-mix(in srgb,var(--dv-primary) 12%,var(--dv-surface)))}
.card b{display:block;font-family:var(--dv-font-head);font-weight:var(--dv-weight-head);font-size:13px;margin-bottom:4px}
.card p{margin:0;font-size:11px;color:var(--dv-body)}

.hud{position:fixed;left:12px;bottom:10px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--dv-body);opacity:.75}

/* ---- the twenty recipes ---- */
@keyframes k1{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes k2{from{opacity:0}to{opacity:1}}
@keyframes k3{0%{transform:scale(.86);opacity:0}60%{transform:scale(1.04);opacity:1}100%{transform:scale(1)}}
@keyframes k4{from{opacity:0;transform:translateX(-26px)}to{opacity:1;transform:none}}
@keyframes k5{from{opacity:0;transform:translateX(26px)}to{opacity:1;transform:none}}
@keyframes k6{from{filter:blur(9px);opacity:0}to{filter:blur(0);opacity:1}}
@keyframes k7{from{transform:rotateX(72deg);opacity:0}to{transform:rotateX(0);opacity:1}}
@keyframes k8{from{transform:rotate(-9deg) scale(.9);opacity:0}to{transform:none;opacity:1}}
@keyframes k9{from{transform:translateY(-46px);opacity:0}to{transform:none;opacity:1}}
@keyframes k10{0%{transform:scale(.8)}45%{transform:scale(1.13)}70%{transform:scale(.96)}100%{transform:scale(1)}}
@keyframes k11{10%,90%{transform:translateX(-3px)}30%,70%{transform:translateX(6px)}50%{transform:translateX(-7px)}}
@keyframes k12{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes k13{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--dv-primary) 0%,transparent)}50%{box-shadow:0 0 0 14px color-mix(in srgb,var(--dv-primary) 26%,transparent)}}
@keyframes k14{from{background-position:-160% 0}to{background-position:160% 0}}
@keyframes k15{0%,100%{transform:translateY(0)}50%{transform:translateY(-11px)}}
@keyframes k16{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes k17{0%,100%{transform:translateY(0)}25%{transform:translateY(-7px)}50%{transform:translateY(0)}75%{transform:translateY(7px)}}
@keyframes k18{0%,49%{border-right-color:var(--dv-primary)}50%,100%{border-right-color:transparent}}
@keyframes k19{from{transform:translateX(-130%) skewX(-12deg)}to{transform:translateX(130%) skewX(-12deg)}}
@keyframes k20{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(12px,-9px,0)}}

${RECIPE_SELECTORS}{animation-fill-mode:both}
${RECIPE_RULES}
.fx-14{background-image:linear-gradient(100deg,transparent 32%,color-mix(in srgb,var(--dv-ink) 14%,transparent) 50%,transparent 68%);background-size:200% 100%}
.fx-16{transform-origin:50% 50%}
.fx-18{border-right:3px solid var(--dv-primary)}
.fx-19{position:relative;overflow:hidden}
.fx-19::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 35%,color-mix(in srgb,var(--dv-surface) 75%,transparent) 50%,transparent 65%);animation:k19 780ms var(--dv-ease) both}
</style>
</head>
<body data-layout="${controls.layout}">
<div class="stage">
  <header class="top">
    <div class="brand"><span class="dot"></span><span id="vibe">${escapeHtml(vibeName)}</span></div>
    <span class="pill">wireframe</span>
  </header>

  <section class="hero">
    <h1 class="hl">Design system<br /><em>in one canvas</em></h1>
    <div class="bars"><i class="bar w1"></i><i class="bar w2"></i><i class="bar w3"></i></div>
  </section>

  <section class="split">
    <div class="media"><span class="spark"></span><span class="tag">surface</span></div>
    <div class="copy">
      <strong>视觉层级</strong>
      <p>这里每一个颜色、圆角和缓动，都是左侧面板写进 CSS 变量的真实值。</p>
      <button class="btn" id="cta" type="button">主要操作</button>
    </div>
  </section>

  <section class="deck">
    <article class="card" id="card">
      <div class="thumb"></div>
      <b>悬浮卡片</b>
      <p>悬停看抬升与阴影，点左侧配方即刻播放。</p>
    </article>
  </section>
</div>
<div class="hud" id="hud">点击左侧配方即刻预览</div>
<script>
(function () {
  var names = ${RECIPE_NAMES};
  var lastNonce = 0;

  function play(index) {
    var card = document.getElementById("card");
    var hud = document.getElementById("hud");
    if (!card) return;
    card.className = "card";
    void card.offsetWidth;
    card.className = "card fx-" + index;
    if (hud) hud.textContent = "动效 " + index + "/" + names.length + " · " + (names[index - 1] || "");
  }

  function apply(state) {
    var root = document.documentElement.style;
    Object.keys(state.vars).forEach(function (key) { root.setProperty(key, state.vars[key]); });
    document.body.dataset.layout = state.layout;
    var vibe = document.getElementById("vibe");
    if (vibe) vibe.textContent = state.vibe;
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || !data.dv) return;
    apply(data);
    if (data.recipe && data.nonce !== lastNonce) {
      lastNonce = data.nonce;
      play(data.recipe);
    }
  });

  document.addEventListener("mousemove", function (event) {
    var root = document.documentElement.style;
    root.setProperty("--px", ((event.clientX / window.innerWidth) * 2 - 1).toFixed(3));
    root.setProperty("--py", ((event.clientY / window.innerHeight) * 2 - 1).toFixed(3));
  });
})();
<\/script>
</body>
</html>`;
		}
		/** Minimal HTML escaping for the one interpolated string. */
		function escapeHtml(value) {
			return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
		}
		// src/client/prompt.ts
		/** Pad to two digits so rule lists line up. */
		function ordinal(index) {
			return String(index + 1).padStart(2, "0");
		}
		function renderRules(rules) {
			return rules.map((rule, index) => `${ordinal(index)} ${rule.text}`).join("\n");
		}
		/**
		* Build the prompt for one configuration.
		*
		* @param config - the current export, already resolved.
		*/
		function composePrompt(config) {
			const guidance = config.guidance;
			const motion = guidance.motion.map((recipe, index) => `${ordinal(index)} ${recipe.name}（${recipe.id}）— ${recipe.duration} · ${recipe.easing} · ${recipe.spec}`).join("\n");
			const hardSpecs = guidance.hardSpecs.length > 0 ? renderRules(guidance.hardSpecs) : "（尚未导入：等待 motion-web 的 74 条硬规范）";
			const sourceLabel = guidance.source === "placeholder" ? "内置草案（待替换）" : guidance.source;
			return `# Design Vault · 生成约束

> 版本 ${guidance.version} · 来源：${sourceLabel}
> 遵循以下约束生成界面；与「当前配置」冲突时，以配置为准。

## 1. 当前配置
- 风格：${config.vibeName}（${config.vibe}）
- 配色来源：${config.paletteId} · 色相种子：${config.seed || "（无）"}
- 密度：${config.density} ／ 字体：${config.typography} ／ 聚合：${config.layout}
- 圆角：${config.radius} ／ 阴影：${config.shadow} ／ 边框：${config.border} ／ 动效：${config.motion}

## 2. 色板（直接使用这些 HEX，不要另造颜色）
- background ${config.palette.background}
- card       ${config.palette.card}
- content    ${config.palette.content}
- title      ${config.palette.title}

## 3. 动效规范（${guidance.motion.length} 条）
${motion}

## 4. 去 AI 味规则（${guidance.antiSlop.length} 条）
${renderRules(guidance.antiSlop)}

## 5. 硬规范（${guidance.hardSpecs.length > 0 ? `${guidance.hardSpecs.length} 条` : "待导入"}）
${hardSpecs}
`;
		}
		// src/client/index.tsx
		/**
		* Browser half of design-vault-plugin.
		*
		* React is provided by the DSH shell at runtime; it is never bundled. The build
		* wraps this entry in `window.__ModuleLoader__.load({ id, factory })`.
		*
		* Visual language: close to the DeepSeek site — a near-white ground, sections as
		* very light blocks instead of hairlines, brand blue for every selected state,
		* borderless inputs that lift into a focus ring. The stylesheet below is scoped
		* to `.dvp-*` and injected with the tree, so it cannot reach the host shell.
		*
		* @module design-vault-plugin/client
		*/
		/**
		* One scoped stylesheet. Hand-written on purpose: the plugin ships a single CJS
		* bundle with no CSS pipeline, and inline styles cannot express `:hover`,
		* `:focus` or a ring.
		*/
		const PANEL_CSS = `
.dvp-root{
  --dvp-accent:#4D6BFE;
  --dvp-ink:#111827;
  --dvp-ink-2:#6B7280;
  --dvp-field:#F3F4F6;
  --dvp-field-hover:#ECEEF2;
  display:grid;
  grid-template-columns:320px minmax(0,1fr);
  gap:24px;
  padding:24px 28px;
  background:#F9F9F9;
  border-radius:22px;
  color:var(--dvp-ink);
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;
  font-size:13px;
  line-height:1.65;
  -webkit-font-smoothing:antialiased;
}
.dvp-rail{
  display:grid;align-content:start;gap:14px;overflow-y:auto;max-height:calc(100vh - 150px);padding-right:4px;
  scrollbar-width:thin;scrollbar-color:#D8DAE0 transparent;
}
.dvp-section{
  display:grid;gap:12px;padding:16px;background:#FFFFFF;border-radius:16px;
  box-shadow:0 1px 2px rgba(16,24,40,.04),0 1px 3px rgba(16,24,40,.03);
}
.dvp-title{font-size:12.5px;font-weight:600;color:var(--dvp-ink);letter-spacing:.01em}
.dvp-field{
  width:100%;padding:10px 12px;border:0;border-radius:10px;background:var(--dvp-field);color:var(--dvp-ink);
  font:inherit;font-size:13px;line-height:1.6;appearance:none;outline:none;
  transition:background .18s ease,box-shadow .18s ease;
}
.dvp-field:hover{background:var(--dvp-field-hover)}
.dvp-field:focus{background:#FFFFFF;box-shadow:0 0 0 3px rgba(77,107,254,.18)}
select.dvp-field{
  padding-right:34px;cursor:pointer;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat:no-repeat;background-position:right 12px center;
}
.dvp-label{display:block;margin-bottom:6px;font-size:11.5px;color:var(--dvp-ink-2)}
.dvp-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:6px;width:100%;
  padding:10px 16px;border:0;border-radius:999px;background:var(--dvp-field);color:var(--dvp-ink);
  font:inherit;font-size:13px;font-weight:500;cursor:pointer;
  transition:background .18s ease,transform .18s ease,box-shadow .18s ease,color .18s ease;
}
.dvp-btn:hover{background:var(--dvp-field-hover)}
.dvp-btn:active{transform:scale(.985)}
.dvp-btn:focus-visible{box-shadow:0 0 0 3px rgba(77,107,254,.2);outline:none}
.dvp-btn--primary{background:var(--dvp-accent);color:#FFFFFF;box-shadow:0 6px 16px rgba(77,107,254,.28)}
.dvp-btn--primary:hover{background:#3F5CF0}
.dvp-btn--primary:disabled{opacity:.45;cursor:default;box-shadow:none}
.dvp-btn--ghost{background:transparent;color:var(--dvp-ink-2);width:auto;padding:8px 12px}
.dvp-btn--ghost:hover{background:var(--dvp-field)}
.dvp-btn--sm{padding:9px 14px;font-size:12px;width:auto}
.dvp-presets{display:flex;gap:6px}
.dvp-presets .dvp-btn{flex:1;padding:8px 6px;font-size:12px}
.dvp-chips{display:flex;gap:10px}
.dvp-chip{display:grid;justify-items:center;gap:7px;flex:1;min-width:0;cursor:pointer}
.dvp-chip-swatch{
  position:relative;width:34px;height:34px;border-radius:50%;border:0;
  box-shadow:0 1px 2px rgba(16,24,40,.14),0 4px 10px rgba(16,24,40,.06);
  transition:transform .18s ease,box-shadow .18s ease;
}
.dvp-chip:hover .dvp-chip-swatch{transform:translateY(-2px) scale(1.05);box-shadow:0 6px 14px rgba(16,24,40,.14)}
.dvp-chip input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
.dvp-chip-label{font-size:10.5px;color:var(--dvp-ink-2);white-space:nowrap}
.dvp-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}
.dvp-dots{display:flex;gap:5px;margin-top:2px}
.dvp-dot{width:13px;height:13px;border-radius:50%;box-shadow:0 1px 2px rgba(16,24,40,.2)}
.dvp-status{font-size:11px;color:var(--dvp-ink-2)}
.dvp-status--error{color:#DC2626}
.dvp-recipes{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.dvp-recipe{
  display:flex;align-items:center;gap:6px;padding:8px 9px;border:0;border-radius:9px;
  background:var(--dvp-field);color:#374151;font:inherit;font-size:11.5px;text-align:left;cursor:pointer;
  transition:background .18s ease,color .18s ease,box-shadow .18s ease;
}
.dvp-recipe:hover{background:var(--dvp-field-hover)}
.dvp-recipe:focus-visible{box-shadow:0 0 0 3px rgba(77,107,254,.2);outline:none}
.dvp-recipe--active{background:rgba(77,107,254,.10);color:#3F5CF0;box-shadow:inset 0 0 0 1.5px rgba(77,107,254,.35)}
.dvp-recipe-index{font-variant-numeric:tabular-nums;font-size:9.5px;opacity:.5}
.dvp-recipe-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dvp-preview{display:grid;gap:16px;align-content:start;min-width:0}
.dvp-tray{display:grid;place-items:center;padding:28px;border-radius:20px;background:#F1F2F4}
.dvp-paper{
  width:100%;max-width:920px;border-radius:16px;overflow:hidden;background:#FFFFFF;
  box-shadow:0 24px 60px rgba(16,24,40,.12),0 4px 12px rgba(16,24,40,.05);
}
.dvp-paper iframe{display:block;width:100%;height:520px;border:0}
.dvp-export{display:grid;gap:10px}
.dvp-tabs{display:flex;gap:6px}
.dvp-tab{
  padding:7px 14px;border:0;border-radius:999px;background:transparent;color:var(--dvp-ink-2);
  font:inherit;font-size:12px;font-weight:500;cursor:pointer;transition:background .18s ease,color .18s ease;
}
.dvp-tab:hover{background:var(--dvp-field)}
.dvp-tab--active{background:#FFFFFF;color:var(--dvp-ink);box-shadow:0 1px 2px rgba(16,24,40,.08)}
.dvp-export-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.dvp-note{font-size:11.5px;color:var(--dvp-ink-2)}
.dvp-textarea{
  width:100%;padding:16px;border:0;border-radius:16px;background:#FFFFFF;color:var(--dvp-ink);
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;line-height:1.65;
  box-shadow:0 1px 2px rgba(16,24,40,.04);resize:vertical;outline:none;
  transition:box-shadow .18s ease;
}
.dvp-textarea:focus{box-shadow:0 0 0 3px rgba(77,107,254,.18)}
`.trim();
		/** A left-navigation glyph: replace with the plugin's own mark. */
		function Icon({ size = 18 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 16 16",
				width: size,
				height: size,
				fill: "none",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: "2.75",
					y: "2.75",
					width: "10.5",
					height: "10.5",
					rx: "2",
					stroke: "currentColor"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M5.5 8h5",
					stroke: "currentColor",
					strokeLinecap: "round"
				})]
			});
		}
		const DEFAULT_CONTROLS = {
			density: "Balanced",
			typography: "Modern Sans",
			layout: "Split",
			radius: "Md",
			shadow: "Sm",
			border: "Hairline",
			motion: "Springy"
		};
		const DEFAULT_SEED = "aurora";
		const VIBE_OPTIONS = VIBES.map((vibe) => ({
			value: vibe.id,
			label: vibe.name
		}));
		const DENSITY_OPTIONS = [
			{
				value: "Compact",
				label: "紧凑 Compact"
			},
			{
				value: "Dense",
				label: "紧密 Dense"
			},
			{
				value: "Balanced",
				label: "均衡 Balanced"
			},
			{
				value: "Comfortable",
				label: "舒适 Comfortable"
			},
			{
				value: "Airy",
				label: "宽松 Airy"
			}
		];
		const TYPOGRAPHY_OPTIONS = [
			{
				value: "Modern Sans",
				label: "现代无衬线"
			},
			{
				value: "Geometric Sans",
				label: "几何无衬线"
			},
			{
				value: "Editorial Serif",
				label: "复古衬线"
			},
			{
				value: "Brutalist Mono",
				label: "粗野等宽"
			},
			{
				value: "Mixed",
				label: "混排（衬线标题 + 无衬线正文）"
			},
			{
				value: "Editorial Thin",
				label: "编辑细体 Editorial Thin（w300 / -0.035em / 1.05）"
			},
			{
				value: "Grotesk Bold",
				label: "粗犷 Grotesk Bold（w700 / -0.04em / 1.0）"
			},
			{
				value: "Swiss System",
				label: "瑞士系统 Swiss System（w500 / -0.02em / 1.15）"
			},
			{
				value: "Serif + Sans",
				label: "衬线 + 无衬线 Serif + Sans（1.2 行高）"
			},
			{
				value: "Technical Mono",
				label: "技术等宽 Technical Mono（w500 / 1.4 行高）"
			}
		];
		const LAYOUT_OPTIONS = [
			{
				value: "Split",
				label: "左右分屏"
			},
			{
				value: "Bento",
				label: "网格拼图"
			},
			{
				value: "ThreeColumn",
				label: "三栏布局"
			},
			{
				value: "Stack",
				label: "垂直堆叠"
			}
		];
		const RADIUS_OPTIONS = [
			{
				value: "None",
				label: "无圆角"
			},
			{
				value: "Sm",
				label: "极小"
			},
			{
				value: "Md",
				label: "适中"
			},
			{
				value: "Lg",
				label: "圆润"
			},
			{
				value: "Full",
				label: "全圆角"
			}
		];
		const SHADOW_OPTIONS = [
			{
				value: "None",
				label: "无阴影"
			},
			{
				value: "Sm",
				label: "极轻"
			},
			{
				value: "Md",
				label: "轻"
			},
			{
				value: "Lg",
				label: "中"
			},
			{
				value: "Xl",
				label: "重"
			}
		];
		const BORDER_OPTIONS = [
			{
				value: "None",
				label: "无边框"
			},
			{
				value: "Hairline",
				label: "极细线"
			},
			{
				value: "Medium",
				label: "中等边框"
			},
			{
				value: "Heavy",
				label: "粗边框"
			}
		];
		const MOTION_OPTIONS = [
			{
				value: "None",
				label: "无动效"
			},
			{
				value: "Restrained",
				label: "克制平滑"
			},
			{
				value: "Springy",
				label: "弹性阻尼"
			}
		];
		/** Three whole compositions, for when picking seven dimensions by hand is slow. */
		const PRESETS = [
			{
				label: "杂志编辑",
				hint: "宽松 · 复古衬线 · 左右分屏",
				controls: {
					density: "Comfortable",
					typography: "Editorial Serif",
					layout: "Split",
					radius: "Sm",
					shadow: "Sm",
					border: "Hairline",
					motion: "Restrained"
				}
			},
			{
				label: "瑞士网格",
				hint: "紧凑 · 几何无衬线 · 三栏",
				controls: {
					density: "Compact",
					typography: "Geometric Sans",
					layout: "ThreeColumn",
					radius: "None",
					shadow: "None",
					border: "Hairline",
					motion: "None"
				}
			},
			{
				label: "新粗野",
				hint: "紧密 · 粗野等宽 · 网格拼图",
				controls: {
					density: "Dense",
					typography: "Brutalist Mono",
					layout: "Bento",
					radius: "None",
					shadow: "Xl",
					border: "Heavy",
					motion: "Springy"
				}
			}
		];
		const SURFACES = [
			{
				key: "background",
				label: "背景"
			},
			{
				key: "card",
				label: "卡片/表面"
			},
			{
				key: "content",
				label: "正文"
			},
			{
				key: "title",
				label: "标题"
			},
			{
				key: "accent",
				label: "强调色"
			}
		];
		function Section({ title, children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "dvp-section",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dvp-title",
					children: title
				}), children]
			});
		}
		function SelectField({ label, value, options, onChange }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [label === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "dvp-label",
				children: label
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
				className: "dvp-field",
				value,
				onChange: (event) => onChange(event.target.value),
				children: options.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
					value: option.value,
					children: option.label
				}, option.value))
			})] });
		}
		/** A colour chip that opens the native picker; the chip *is* the input. */
		function ColorChip({ label, value, onChange }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: "dvp-chip",
				title: `${label} · ${value}`,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dvp-chip-swatch",
					style: { background: value },
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "color",
						value,
						onChange: (event) => onChange(event.target.value)
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dvp-chip-label",
					children: label
				})]
			});
		}
		/** The full page selected by the navigation entry. */
		function Page({ t }) {
			const [vibeId, setVibeId] = (0, react.useState)(VIBES[0]?.id ?? "");
			const [seed, setSeed] = (0, react.useState)(DEFAULT_SEED);
			const [controls, setControls] = (0, react.useState)(DEFAULT_CONTROLS);
			const [source, setSource] = (0, react.useState)({ kind: "style" });
			const [edits, setEdits] = (0, react.useState)({});
			const [recipe, setRecipe] = (0, react.useState)({
				id: 0,
				nonce: 0
			});
			const [exported, setExported] = (0, react.useState)(null);
			const [copied, setCopied] = (0, react.useState)("idle");
			const [aiPrompt, setAiPrompt] = (0, react.useState)("");
			const [aiStatus, setAiStatus] = (0, react.useState)("idle");
			const [pasteText, setPasteText] = (0, react.useState)("");
			const [pasteError, setPasteError] = (0, react.useState)(null);
			const vibe = VIBES.find((item) => item.id === vibeId) ?? VIBES[0];
			const vibeName = vibe?.name ?? vibeId;
			const activePreset = source.kind === "preset" ? PALETTES.find((preset) => preset.id === source.id) : void 0;
			/** Grouped for the picker: 31 presets in one flat list is unreadable. */
			const paletteGroups = (0, react.useMemo)(() => groupPalettes(PALETTES), []);
			const activeBank = source.kind === "bank" ? BANK_PALETTES.find((entry) => entry.id === source.id) : void 0;
			/** Base colours for the source, then the user's chip edits on top. */
			const palette = (0, react.useMemo)(() => {
				const stylePalette = paletteFromStyle(vibe?.palette ?? {}, seed);
				if (source.kind === "bank" && activeBank) return {
					...bankPalette(activeBank, seed),
					...edits
				};
				if (source.kind === "preset" && activePreset) return {
					...slotsFromColors(activePreset.colors, seed) ?? stylePalette,
					...edits
				};
				if (source.kind === "colors") return {
					...slotsFromColors(source.colors, seed) ?? stylePalette,
					...edits
				};
				return {
					...stylePalette,
					...edits
				};
			}, [
				vibe,
				seed,
				source,
				activePreset,
				activeBank,
				edits
			]);
			const paletteId = source.kind === "bank" ? `bank:${source.id}` : source.kind === "preset" ? `preset:${source.id}` : source.kind === "colors" ? "custom" : `style:${vibeId}`;
			const label = (key, fallback) => t?.(key) ?? fallback;
			const frameRef = (0, react.useRef)(null);
			const doc = (0, react.useMemo)(() => buildPreviewDoc(paletteFromStyle(VIBES[0]?.palette ?? {}, DEFAULT_SEED), DEFAULT_CONTROLS, VIBES[0]?.name ?? ""), []);
			const send = (0, react.useCallback)(() => {
				const target = frameRef.current?.contentWindow;
				if (!target) return;
				target.postMessage(previewMessage(palette, controls, vibeName, recipe.id, recipe.nonce), "*");
			}, [
				palette,
				controls,
				vibeName,
				recipe
			]);
			(0, react.useEffect)(() => {
				send();
			}, [send]);
			const patch = (key, value) => {
				setControls((current) => ({
					...current,
					[key]: value
				}));
			};
			const play = (index) => {
				setRecipe((current) => ({
					id: index + 1,
					nonce: current.nonce + 1
				}));
			};
			const choosePreset = (id) => {
				if (id.startsWith("bank:")) setSource({
					kind: "bank",
					id: id.slice(5)
				});
				else setSource(id === "" ? { kind: "style" } : {
					kind: "preset",
					id
				});
				setEdits({});
			};
			/** Copy a ready-to-paste brief; the palette itself is baked on the next build. */
			const requestPalette = async () => {
				const ok = await copyText(`请生成一组配色（只输出 3–5 个 HEX，按冷/暖与明暗给出）：${aiPrompt.trim() || "（未填写描述）"}`);
				setAiStatus(ok ? "copied" : "fail");
			};
			const applyPaste = () => {
				const colors = pasteText.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
				if (colors.length < 2) {
					setPasteError("至少需要 2 个 HEX，例如 #AABBCC, #DDEEFF");
					return;
				}
				setSource({
					kind: "colors",
					colors
				});
				setEdits({});
				setPasteError(null);
			};
			const [tab, setTab] = (0, react.useState)("json");
			const currentConfig = (0, react.useMemo)(() => buildDesignConfigExport({
				vibeId,
				vibeName,
				seed,
				paletteId,
				controls,
				palette
			}), [
				vibeId,
				vibeName,
				seed,
				paletteId,
				controls,
				palette
			]);
			const promptText = (0, react.useMemo)(() => composePrompt(currentConfig), [currentConfig]);
			const signature = JSON.stringify([
				paletteId,
				seed,
				controls,
				palette
			]);
			const stale = exported !== null && exported.signature !== signature;
			const exportConfig = () => {
				setExported({
					json: JSON.stringify(currentConfig, null, 2),
					signature
				});
				setCopied("idle");
			};
			const activeText = tab === "json" ? exported?.json ?? "" : promptText;
			const copyActive = async () => {
				if (activeText === "") return;
				const ok = await copyText(activeText);
				setCopied(ok ? "ok" : "fail");
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dvp-root",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", { children: PANEL_CSS }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
						className: "dvp-rail",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
								title: label("panel.vibe", "风格"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectField, {
									value: vibeId,
									options: VIBE_OPTIONS,
									onChange: setVibeId
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Section, {
								title: "配色来源",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dvp-label",
										children: "精选配色"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										className: "dvp-field",
										value: source.kind === "bank" ? `bank:${source.id}` : source.kind === "preset" ? source.id : "",
										onChange: (event) => choosePreset(event.target.value),
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
												value: "",
												children: [
													"跟随风格（",
													vibeName,
													"）"
												]
											}),
											paletteGroups.map((group) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("optgroup", {
												label: `${group.label} · ${group.items.length}`,
												children: group.items.map((preset) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
													value: preset.id,
													children: preset.name
												}, preset.id))
											}, group.category)),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("optgroup", {
												label: `视觉库 · ${BANK_PALETTES.length}（显式角色）`,
												children: BANK_PALETTES.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
													value: `bank:${entry.id}`,
													children: entry.name
												}, entry.id))
											})
										]
									})] }),
									activePreset ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "dvp-dots",
										children: activePreset.colors.map((hex) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dvp-dot",
											style: { background: hex },
											title: hex
										}, hex))
									}) : null,
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dvp-label",
											children: "AI 配色"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "dvp-row",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												className: "dvp-field",
												value: aiPrompt,
												onChange: (event) => {
													setAiPrompt(event.target.value);
													setAiStatus("idle");
												},
												placeholder: "描述你想要的氛围，如「雨后的冷调工业」"
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: "dvp-btn dvp-btn--sm",
												onClick: () => void requestPalette(),
												children: "生成"
											})]
										}),
										aiStatus === "copied" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: "dvp-status",
											style: { margin: "8px 0 0" },
											children: "已复制生成请求 · 粘到对话里产出后，烘焙进预置库"
										}) : null,
										aiStatus === "fail" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: "dvp-status dvp-status--error",
											style: { margin: "8px 0 0" },
											children: "复制失败，请手动复制描述"
										}) : null
									] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dvp-label",
											children: "Color Hunt / 粘贴 HEX"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "dvp-row",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												className: "dvp-field",
												value: pasteText,
												onChange: (event) => {
													setPasteText(event.target.value);
													setPasteError(null);
												},
												placeholder: "#AABBCC, #DDEEFF, #112233"
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: "dvp-btn dvp-btn--sm",
												onClick: applyPaste,
												children: "应用"
											})]
										}),
										pasteError ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: "dvp-status dvp-status--error",
											style: { margin: "8px 0 0" },
											children: pasteError
										}) : null
									] })
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Section, {
								title: "当前配色",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dvp-chips",
									children: SURFACES.map((surface) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ColorChip, {
										label: surface.label,
										value: palette[surface.key],
										onChange: (value) => setEdits((current) => ({
											...current,
											[surface.key]: value
										}))
									}, surface.key))
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dvp-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										className: "dvp-field",
										value: seed,
										onChange: (event) => setSeed(event.target.value),
										placeholder: "色相种子",
										"aria-label": "色相种子"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dvp-btn dvp-btn--ghost",
										onClick: () => setEdits({}),
										children: "复位"
									})]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
								title: "预设组合",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dvp-presets",
									children: PRESETS.map((preset) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dvp-btn",
										title: preset.hint,
										onClick: () => setControls(preset.controls),
										children: preset.label
									}, preset.label))
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
								title: label("panel.density", "密度"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectField, {
									value: controls.density,
									options: DENSITY_OPTIONS,
									onChange: (value) => patch("density", value)
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
								title: label("panel.typography", "字体"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectField, {
									value: controls.typography,
									options: TYPOGRAPHY_OPTIONS,
									onChange: (value) => patch("typography", value)
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
								title: label("panel.layout", "聚合形式"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectField, {
									value: controls.layout,
									options: LAYOUT_OPTIONS,
									onChange: (value) => patch("layout", value)
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Section, {
								title: label("panel.components", "圆角 · 阴影 · 边框"),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectField, {
										label: "圆角大小",
										value: controls.radius,
										options: RADIUS_OPTIONS,
										onChange: (value) => patch("radius", value)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectField, {
										label: "阴影层级",
										value: controls.shadow,
										options: SHADOW_OPTIONS,
										onChange: (value) => patch("shadow", value)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectField, {
										label: "边框粗细",
										value: controls.border,
										options: BORDER_OPTIONS,
										onChange: (value) => patch("border", value)
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
								title: label("panel.motion", "动效手感"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectField, {
									value: controls.motion,
									options: MOTION_OPTIONS,
									onChange: (value) => patch("motion", value)
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
								title: label("panel.recipes", "动效配方库"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dvp-recipes",
									children: MOTION_RECIPES.map((item, index) => {
										const active = recipe.id === index + 1;
										return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => play(index),
											title: `播放：${item.label}`,
											className: `dvp-recipe${active ? " dvp-recipe--active" : ""}`,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "dvp-recipe-index",
												children: String(index + 1).padStart(2, "0")
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "dvp-recipe-label",
												children: item.label
											})]
										}, item.key);
									})
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dvp-btn dvp-btn--primary",
								onClick: exportConfig,
								children: label("panel.export", "导出 DesignConfig")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dvp-preview",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dvp-tray",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dvp-paper",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("iframe", {
									ref: frameRef,
									title: "设计预览",
									srcDoc: doc,
									sandbox: "allow-scripts",
									onLoad: send
								})
							})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dvp-export",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dvp-tabs",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: `dvp-tab${tab === "json" ? " dvp-tab--active" : ""}`,
										onClick: () => setTab("json"),
										children: "DesignConfig JSON"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: `dvp-tab${tab === "prompt" ? " dvp-tab--active" : ""}`,
										onClick: () => setTab("prompt"),
										children: "生成提示词"
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dvp-export-bar",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "dvp-btn dvp-btn--ghost",
											onClick: () => void copyActive(),
											disabled: activeText === "",
											style: {
												opacity: activeText === "" ? .45 : 1,
												cursor: activeText === "" ? "default" : "pointer"
											},
											children: copied === "ok" ? "已复制" : tab === "json" ? "复制 JSON" : "复制提示词"
										}),
										copied === "fail" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dvp-note",
											children: "复制失败，请手动选中复制"
										}) : null,
										tab === "json" && stale ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dvp-note",
											children: "参数已变更，点「导出」刷新"
										}) : null,
										tab === "prompt" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: "dvp-note",
											children: [
												GUIDANCE.version,
												" ·",
												" ",
												GUIDANCE.source === "placeholder" ? "内置草案，待 motion-web 覆盖" : GUIDANCE.source
											]
										}) : null
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
									className: "dvp-textarea",
									readOnly: true,
									rows: tab === "json" ? 13 : 24,
									spellCheck: false,
									value: activeText,
									placeholder: tab === "json" ? "点击「导出 DesignConfig」生成 JSON" : ""
								})
							]
						})]
					})
				]
			});
		}
		/**
		* @param ctx - the client Cordis context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				en: {
					"panel.title": "design-vault-plugin",
					"panel.vibe": "Style",
					"panel.density": "Density",
					"panel.typography": "Typography",
					"panel.layout": "Layout",
					"panel.components": "Radius · shadow · border",
					"panel.motion": "Motion feel",
					"panel.recipes": "Motion library",
					"panel.export": "Export DesignConfig"
				},
				zh: {
					"panel.title": "design-vault 预览",
					"panel.vibe": "风格",
					"panel.density": "密度",
					"panel.typography": "字体",
					"panel.layout": "聚合形式",
					"panel.components": "圆角 · 阴影 · 边框",
					"panel.motion": "动效手感",
					"panel.recipes": "动效配方库",
					"panel.export": "导出 DesignConfig"
				}
			}), `${NAME}: dictionaries`);
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: NAME,
				order: 60,
				label: () => ctx.locale.bind(NS)("panel.title"),
				locale: NS
			}, Icon));
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: NAME,
				locale: NS
			}, Page));
		}
		const name = NAME;
		const inject = ["slots", "locale"];
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});
