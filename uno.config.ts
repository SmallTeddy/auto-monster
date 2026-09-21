import {
    defineConfig, // https://github.com/antfu/unocss/blob/main/src/types/config.ts
    // 预设 attributify
    presetAttributify, // https://unocss.dev/preset/attributify
    // 预设 icon
    presetIcons, // https://unocss.dev/preset/icons
    // 预设 typography
    presetTypography, // https://unocss.dev/preset/typography
    // 预设 preset
    presetUno, //  https://unocss.dev/preset/uno
    // 预设 web-font
    presetWebFonts, // https://unocss.dev/preset/web-fonts
    // 自动导入指令
    transformerDirectives, // https://github.com/antfu/unocss/blob/main/src/transformers/directives.ts
} from "unocss";

export default defineConfig({
    safelist: [
        'i-carbon-logo-github',
        'i-carbon-translate',
        'i-gridicons:fullscreen',
        'i-gridicons:fullscreen-exit',
        'i-material-symbols:pause-circle',
        'i-material-symbols:play-circle-rounded',
        'i-mdi-clover',
        'i-mdi-crosshairs-gps',
        'i-mdi-flash-outline',
        'i-mdi-flask-round-bottom-outline',
        'i-mdi-heart-outline',
        'i-mdi-heart-plus-outline',
        'i-mdi-hospital-box-outline',
        'i-mdi-shield-crown-outline',
        'i-mdi-skull-outline',
        'i-mdi-blood-bag',
        'i-mdi-water-plus-outline',
        'i-mdi-weather-windy',
    ],
    //  自定义配置
    shortcuts: {
        "border-base": "border-gray-400",
        "border-solid-base": "border-width-1 border-solid border-base",
        "game-bg": "bg-black",
        "bg-mask": "bg-black-30",
        "bg-active": "bg-gray:10",
        "hw-full": "h-full w-full of-hidden",
        "flex-center": "flex items-center justify-center",
        "equipment-box": "w-40px h-40px",
        "game-btn": "rounded-lg bg-primary px-3 py-1.5 text-13px font-semibold text-black transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40",
        "game-btn-ghost": "rounded-lg bg-white/10 px-3 py-1.5 text-13px font-semibold text-white transition enabled:hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40",
        "game-btn-purple": "rounded-lg bg-purple-500 px-3 py-1.5 text-13px font-semibold text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40",
        "game-chip": "flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-12px",
    },
    //  额外选项
    rules: [
        [/^t-a-(\d+)$/, ([, d]) => ({ transition: `all 0.${d}s linear` })],
        [
            /^bg-white-(\d+)$/,
            ([, d]) => ({ "background-color": `rgb(255 255 255 / ${d}%)` }),
        ],
        [
            /^bg-black-(\d+)$/,
            ([, d]) => ({ "background-color": `rgb(0 0 0 / ${d}%)` }),
        ],
        [/^l-s-(\d+)$/, ([, d]) => ({ "letter-spacing": `${d}px` })],
    ],
    //  主题
    theme: {
        colors: {
            primary: {
                DEFAULT: "#00DC82",
            },
        },
    },
    //  预设
    presets: [
        presetUno(),
        presetIcons(),
        presetAttributify(),
        presetWebFonts({
            provider: "bunny",
            fonts: {
                sans: "DM Sans",
                mono: "DM Mono",
                ping: "PingFangMedium"
            },
        }),
        presetTypography(),
    ],
    //  交互
    transformers: [transformerDirectives()],
});
