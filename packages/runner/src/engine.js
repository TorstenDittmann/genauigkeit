import jimp from "jimp";
import looksSame from "looks-same";
import { emptyDirSync } from "fs-extra";
import { chromium } from "playwright";
import { get_stories } from "./storybook.js";

export async function run_generate() {
    const stories = await get_stories("http://localhost:6006");
    for (const story of stories) {
        const image = await create_reference(story);
        image.write(`./references/${story.id}.png`);
    }
}

export async function run_tests() {
    emptyDirSync("./current");
    emptyDirSync("./diffs");
    const stories = await get_stories("http://localhost:6006");
    for (const story of stories) {
        console.group(`Testing ${story.id}`);
        await create_reference(story).then((image) =>
            image.writeAsync(`./current/${story.id}.png`),
        );

        const diff = await looksSame(
            `./references/${story.id}.png`,
            `./current/${story.id}.png`,
            { strict: true, createDiffImage: true },
        );

        if (!diff.equal) {
            console.error(`Diff found for ${story.id}`);
            diff.diffImage.save(`./diffs/${story.id}.png`);
        }
        console.groupEnd();
    }
}

export async function create_diff() {}

/**
 * Take a screenshot of the story
 * @param {import('./storybook').Story} story
 * @returns {Promise<import('jimp')>}
 */
export async function create_reference(story) {
    const browser = await chromium.launch(); // Or 'firefox' or 'webkit'.
    const page = await browser.newPage();
    const url = new URL("http://localhost:6006/iframe.html");
    url.searchParams.set("id", story.id);
    url.searchParams.set("viewMode", "story");
    await page.goto(url.toString());
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    const root = page.locator("#storybook-root");
    await root.evaluate((element) => {
        element.style.margin = "2rem";
        element.style.padding = "2rem";
    });
    const shot = await root.screenshot({
        scale: "device",
    });

    const cropped = await crop_image(shot);

    await browser.close();

    return cropped;
}

/**
 * @param {Buffer} buffer
 * @returns {Promise<import('jimp')>}
 */
async function crop_image(buffer) {
    const image = await jimp.read(buffer);
    return image.autocrop();
}
