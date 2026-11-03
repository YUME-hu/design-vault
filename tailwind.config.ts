import type { Config } from "tailwindcss";

/**
 * 也就是「工具本身」的视觉系统 = NASA-Punk 工业控制台：
 * 零圆角 / 1px 炭黑边 / 米白纸面 / 单一信号红点缀。
 * 注意：风格数据（色值、字体、tokens）在 data/styles.json 里，
 * 这里是外壳骨架；两者刻意同源，好让工具本身就是第一个样例。
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 终末地工业风皮肤（M4a 参考）
        "ef-paper": "#F4F2EC",
        "ef-ink": "#121212",
        "ef-accent": "#E3B341",
        "ef-steel": "#8A8F8C",
        "ef-line": "rgba(18,18,18,0.16)",
        paper: "#ECE5D6",
        charcoal: "#191919",
        signal: "#D63A2C",
        sand: "#DBA972",
        ink: {
          DEFAULT: "#191919",
          soft: "#3A3A38",
          faded: "#6B6A63",
        },
        hairline: "rgba(25,25,25,0.22)",
        "hairline-strong": "rgba(25,25,25,0.55)",

        // shadcn/ui 约定槽位，映射到上面的工业色
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      fontFamily: {
        mono: ['"Space Mono"', '"Noto Sans SC"', "ui-monospace", "monospace"],
        sans: ['"Noto Sans SC"', '"Space Mono"', "system-ui", "sans-serif"],
      },
      fontSize: {
        label: ["10px", { lineHeight: "1.2", letterSpacing: "0.22em" }],
        micro: ["11px", { lineHeight: "1.5", letterSpacing: "0.12em" }],
      },
      borderRadius: {
        DEFAULT: "0px",
        none: "0px",
        sm: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        full: "0px",
      },
      maxWidth: {
        console: "1440px",
      },
      backgroundImage: {
        "hazard-stripe":
          "repeating-linear-gradient(45deg, #191919 0 3px, #ECE5D6 3px 6px)",
      },
      backgroundSize: {
        blueprint: "24px 24px",
      },
      keyframes: {
        "blink-cursor": {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        "stamp-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0px)" },
        },
      },
      animation: {
        "blink-cursor": "blink-cursor 1.1s steps(1) infinite",
        "stamp-in": "stamp-in 180ms steps(3) both",
      },
    },
  },
  plugins: [],
};

export default config;
