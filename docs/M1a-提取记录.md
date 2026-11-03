# M1a 草案提取记录

> 4 条草案全部来自官方设计文档 / 官方分发包，**没有一个色值是我编的**。
> 下表逐条写清楚：哪个值从哪来。取不到的系统直接说明为什么没采用。

`data/styles.draft.json` · confidence 0.6 · source.type = `extracted-draft`

## 1. Material 3（Baseline Light）

- 官方文档：<https://m3.material.io/styles/color/roles>
- 取数来源：`@material/web` 官方 npm 分发包里的 token（`tokens/versions/v0_192/_md-ref-palette.scss`、`_md-sys-shape.scss`、`_md-sys-typescale.scss`、`_md-sys-elevation.scss`）

| 槽位 | 值 | 来源 |
| --- | --- | --- |
| primary | `#6750A4` | ref-palette `primary40` |
| bg | `#FEF7FF` | ref-palette `neutral98`（baseline surface） |
| surface | `#FFFFFF` | ref-palette `neutral100`（surface-container-lowest） |
| text | `#1D1B20` | ref-palette `neutral10`（on-surface） |
| muted | `#49454F` | ref-palette `neutral-variant30`（on-surface-variant） |
| info | `#625B71` | ref-palette `secondary40` |
| danger | `#B3261E` | ref-palette `error40` |
| identity | `#6750A4 / #625B71 / #7D5260 / #B3261E` | primary40 / secondary40 / tertiary40 / error40 |

- 形状：`corner-none 0 / extra-small 4 / small 8 / medium 12 / large 16 / extra-large 28`（`_md-sys-shape.scss`）
- 字号：`11/12/14/16/22/24/28/32/36/45/57`（`_md-sys-typescale.scss` 的 label-small → display-large，rem 换算成 px）
- 字体：Roboto（`_md-ref-typeface.scss` 的 `plain`）
- 层级：`level1 1dp / level2 3dp / level3 6dp`（`_md-sys-elevation.scss`）

## 2. IBM Carbon（White 主题）

- 官方文档：<https://carbondesignsystem.com/elements/color/usage/>
- 取数来源：`@carbon/themes`（white 主题）、`@carbon/colors`、`@carbon/type`、`@carbon/layout` 官方分发包

| 槽位 | 值 | 来源 token |
| --- | --- | --- |
| primary | `#0F62FE` | `interactive` / `linkPrimary`（blue 60） |
| bg | `#FFFFFF` | `background` |
| surface | `#F4F4F4` | `layer01` |
| text | `#161616` | `textPrimary`（gray 100） |
| muted | `#525252` | `textSecondary`（gray 70） |
| danger | `#DA1E28` | `supportError` |
| success | `#24A148` | `supportSuccess` |
| warning | `#F1C21B` | `supportWarning` |
| identity | `#0F62FE / #161616 / #8D8D8D / #DA1E28` | interactive / textPrimary / borderStrong01 / supportError |

- 描边：`borderSubtle00 #E0E0E0`、`borderStrong01 #8D8D8D`
- 焦点：`focus #0F62FE`（Carbon 的 2px focus 环）
- 间距：`@carbon/layout` spacing 0–11 → 2/4/8/12/16/24/32/40/48
- 字号：`@carbon/type` label-01 12 → heading-07 54 → `12/14/16/20/28/32/42/54`
- 字体：`IBM Plex Sans` / `IBM Plex Mono`

## 3. GitHub Primer（Light）

- 官方文档：<https://primer.style/foundations/color>
- 取数来源：`@primer/primitives` 10 的 `dist/css/functional/themes/light.css` 与 `typography/typography.css`

| 槽位 | 值 | 来源变量 |
| --- | --- | --- |
| primary | `#0969DA` | `--bgColor-accent-emphasis` |
| bg | `#FFFFFF` | `--bgColor-default` |
| surface | `#F6F8FA` | `--bgColor-muted` |
| text | `#1F2328` | `--fgColor-default` |
| muted | `#59636E` | `--fgColor-muted` |
| danger | `#CF222E` | `--bgColor-danger-emphasis` |
| success | `#1A7F37` | `--bgColor-success-emphasis` |
| warning | `#9A6700` | `--bgColor-attention-emphasis` |
| identity | `#0969DA / #1F2328 / #D1242F / #1A7F37` | accent / fg.default / danger.fg / success |

- 描边：`--borderColor-default: #D1D9E0`
- 圆角：`--borderRadius-medium: 0.375rem`（6px）、`small: 0.1875rem`
- 阴影：`--shadow-resting-small: 0px 1px 1px 0px #1f23280f, 0px 1px 3px 0px #1f23280f`
- 字体：`--fontStack-sansSerif` / `--fontStack-monospace`
- 字号：caption 12 / body 12·14·16 / subtitle 20 / title 32 / display 40

## 4. Stripe Elements（默认主题）

- 官方文档：<https://docs.stripe.com/elements/appearance-api>
- 取数来源：文档 Variables 一节的默认示例

| 槽位 | 值 | 来源 |
| --- | --- | --- |
| primary | `#0570DE` | `colorPrimary` 默认示例 |
| bg | `#FFFFFF` | `colorBackground` 默认示例 |
| surface | `#FFFFFF` | 同上（Stripe 的表单面就是白底） |
| text | `#30313D` | `colorText` 默认示例 |
| danger | `#DF1B41` | `colorDanger` 默认示例 |
| muted | `#E0E6EB` | 文档 `rules` 示例里的输入框描边色（`border / borderColor / stroke: '#E0E6EB'`） |
| 圆角 | `4px` | `borderRadius` 默认值 |
| 间距 | `2px` | `spacingUnit` 默认值 |
| 字体 | `Ideal Sans, system-ui, sans-serif` | `fontFamily` 默认示例 |

> **M1b 复核结论**：`colorTextSecondary` 这个变量确实存在（文档原文：“The color used for text of secondary importance”），
> 但官方**没有公开它的默认 HEX**：整篇 Appearance API 文档里只出现 5 个色值
> （#0570DE / #30313D / #DF1B41 / #E0E6EB / #FFFFFF），没有 secondary text 的默认值。
> 所以 `muted` 仍然保留 `#E0E6EB`（同一文档里的描边色，语义取「弱化/分隔」），
> 并在条目里加了 `notes` 字段说明「这是描边色映射、不是官方 secondary text、确认前需复核对比度」。
> 详情页的「人工备注」区会显示这段说明。

## 为什么不是 Linear

Linear 的官方品牌页（<https://linear.app/brand>）只公开两个色值：Mercury White `#F4F5F8`、Nordic Gray `#222326`；
品牌主色只有一句「a subtle desaturated blue」，没有 hex。5 个语义槽位填不满，按「提取不到就换一个系统」处理，未采用。

## 我做了什么、没做什么

- **只搬了确定性数据**：色值、字号、圆角、间距、阴影、字体名全部来自上表来源。
- **`frontend_prompt` 是我基于这些 token 重写的前端提示词**（`prompt_type: manual`），不是官方文案；官方系统并没有给我们一段「前端提示词」。
- **`components` 是对官方组件规则的转述**（例如 Carbon 的 focus 2px、Primer 的 32px 按钮/6px 圆角），不是逐字照抄。
- 每条草案都在 `/library/[id]` 详情页的 `SOURCE` 行给出官方文档链接，草案列表里也带「官方文档 ↗」链接。
