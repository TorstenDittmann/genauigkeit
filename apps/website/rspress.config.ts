import * as path from "node:path";
import { defineConfig } from "rspress/config";

export default defineConfig({
    root: path.join(__dirname, "docs"),
    title: "genauigkeit",
    description: "Visual Regression Testing for Storybook",
    icon: "/logo.png",
    logoText: "genauigkeit.dev",
    themeConfig: {
        socialLinks: [
            {
                icon: "github",
                mode: "link",
                content: "https://github.com/TorstenDittmann/genauigkeit",
            },
            {
                icon: "twitter",
                mode: "link",
                content: "https://x.com/DittmannTorsten",
            },
        ],
    },
});
