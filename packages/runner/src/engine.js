import { cpus } from "node:os";
import { consola } from "consola";
import { emptyDirSync } from "fs-extra";
import jimp from "jimp";
import looksSame from "looks-same";
import PQueue from "p-queue";
import { chromium, firefox, webkit } from "playwright";
import { load_config } from "./config.js";
import { get_stories } from "./storybook.js";

const cpus_count = cpus().length;

export async function run_generate() {
    const config = await load_config();
    emptyDirSync(`${config.directory}/current`);
    emptyDirSync(`${config.directory}/diffs`);
    const [stories, browser] = await Promise.all([
        get_stories(`http://localhost:${config.storybookPort}`),
        connect_to_browser("chromium"),
    ]);
    let progress = 0;
    const queue = new PQueue({ concurrency: cpus_count });
    queue.addListener("completed", (story) => {
        const progress_current = ++progress;
        const progress_text = `[${progress_current}/${stories.length}]`;
        consola.success(`${progress_text} ${story.id}`);
    });
    for (const story of stories) {
        queue.add(async () => {
            await create_reference(story, browser).then((image) =>
                image.write(`${config.directory}/references/${story.id}.png`),
            );

            return story;
        });
    }

    await new Promise((resolve, reject) =>
        queue.onIdle().then(resolve).catch(reject),
    );
}

export async function run_tests() {
    const config = await load_config();
    emptyDirSync(`${config.directory}/current`);
    emptyDirSync(`${config.directory}/diffs`);
    const stories = await get_stories(config.storybookRoot);
    const browser = await connect_to_browser("chromium");

    let progress = 0;
    const results = [];
    const queue = new PQueue({ concurrency: cpus_count });

    queue.addListener("completed", ({ diff, story }) => {
        const progress_current = ++progress;
        const progress_text = `[${progress_current}/${stories.length}]`;
        if (!diff.equal) {
            consola.fail(`${progress_text} diff found for ${story.id}`);
        } else {
            consola.success(`${progress_text} ${story.id}`);
        }
        results.push({ story, diff });
    });

    for (const story of stories) {
        queue.add(async () => {
            const ref = await create_reference(story, browser);
            await ref.writeAsync(`${config.directory}/current/${story.id}.png`);

            const diff = await looksSame(
                `${config.directory}/references/${story.id}.png`,
                `${config.directory}/current/${story.id}.png`,
                { strict: true, createDiffImage: true },
            );
            if (!diff.equal) {
                diff.diffImage.save(
                    `${config.directory}/diffs/${story.id}.png`,
                );
            }

            return { story, diff };
        });
    }

    /** @type {{story: Story, diff: looksSame.LooksSameWithExistingDiffResult}[]} */
    await new Promise((resolve, reject) =>
        queue.onIdle().then(resolve).catch(reject),
    );

    await browser.close();
    const failed_tests = results.filter(({ diff }) => !diff.equal).length;
    const passed_tests = stories.length - failed_tests;

    consola.box(
        `Tests ${
            failed_tests > 0 ? "failed" : "succesful"
        }!\nFailed: ${failed_tests}\nPassed: ${passed_tests}\nTotal: ${
            stories.length
        }`,
    );
}

/**
 * @param {"chromium" | "firefox" | "webkit"} type
 * @param {string} address
 * @returns {Promise<import('playwright').Browser>}
 */
export async function connect_to_browser(
    type,
    address = "ws://localhost:1337",
) {
    let tries = 0;
    while (tries < 10) {
        try {
            switch (type) {
                case "chromium":
                    return await chromium.connect(address);
                case "firefox":
                    return await firefox.connect(address);
                case "webkit":
                    return await webkit.connect(address);
            }
        } catch (error) {
            tries += 1;
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }
    throw new Error("Could not connect to browser");
}

/**
 * Take a screenshot of the story
 * @param {import('./storybook').Story} story
 * @param {import('playwright').Browser} browser
 * @returns {Promise<import('jimp')>}
 */
export async function create_reference(story, browser, config) {
    const page = await browser.newPage();
    const url = new URL(`http://proxy-host:${port}/iframe.html`);
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
    await page.close();

    const cropped = await crop_image(shot);

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
