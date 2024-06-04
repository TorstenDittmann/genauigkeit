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
const devices = ["mobile", "desktop"];

export async function run_generate() {
    const config = await load_config();
    emptyDirSync(`${config.directory}/current`);
    emptyDirSync(`${config.directory}/diffs`);
    emptyDirSync(`${config.directory}/references`);
    const [stories, browser] = await Promise.all([
        get_stories(`http://localhost:${config.port}`),
        connect_to_browser("chromium"),
    ]);

    let progress = 0;
    const queue = new PQueue({ concurrency: cpus_count });
    queue.addListener("completed", ({ story, device }) => {
        const progress_current = ++progress;
        const progress_text = `[${progress_current}/${
            stories.length * devices.length
        }]`;
        consola.success(`${progress_text} ${story.id} (${device})`);
    });
    for (const story of stories) {
        for (const device of devices) {
            queue.add(async () => {
                await create_reference(story, browser, config, device).then(
                    (image) =>
                        image.write(
                            `${config.directory}/references/${story.id}-${device}.png`,
                        ),
                );

                return { story, device };
            });
        }
    }

    await new Promise((resolve, reject) =>
        queue.onIdle().then(resolve).catch(reject),
    );
}

export async function run_tests() {
    const config = await load_config();
    emptyDirSync(`${config.directory}/current`);
    emptyDirSync(`${config.directory}/diffs`);
    const [stories, browser] = await Promise.all([
        get_stories(`http://localhost:${config.port}`),
        connect_to_browser("chromium"),
    ]);

    let progress = 0;
    const results = [];
    const queue = new PQueue({ concurrency: cpus_count });

    queue.addListener("completed", ({ diff, story, device }) => {
        const progress_current = ++progress;
        const progress_text = `[${progress_current}/${
            stories.length * devices.length
        }]`;
        if (!diff.equal) {
            consola.fail(`${progress_text} diff found for ${story.id}`);
        } else {
            consola.success(`${progress_text} ${story.id} (${device})`);
        }
        results.push({ story, diff, device });
    });

    for (const story of stories) {
        for (const device of ["mobile", "desktop"]) {
            queue.add(async () => {
                const ref = await create_reference(
                    story,
                    browser,
                    config,
                    device,
                );
                await ref.writeAsync(
                    `${config.directory}/current/${story.id}-${device}.png`,
                );

                const diff = await looksSame(
                    `${config.directory}/references/${story.id}-${device}.png`,
                    `${config.directory}/current/${story.id}-${device}.png`,
                    { strict: true, createDiffImage: true },
                );
                if (!diff.equal) {
                    diff.diffImage.save(
                        `${config.directory}/diffs/${story.id}-${device}.png`,
                    );
                }

                return { story, diff, device };
            });
        }
    }

    /** @type {{story: Story, diff: looksSame.LooksSameWithExistingDiffResult}[]} */
    await new Promise((resolve, reject) =>
        queue.onIdle().then(resolve).catch(reject),
    );

    await browser.close();
    const total_tests = stories.length * devices.length;
    const failed_tests = results.filter(({ diff }) => !diff.equal).length;
    const passed_tests = total_tests - failed_tests;

    consola.box(
        `Tests ${
            failed_tests > 0 ? "failed" : "succesful"
        }!\nFailed: ${failed_tests}\nPassed: ${passed_tests}\nTotal: ${total_tests}`,
    );

    process.exit(failed_tests > 0 ? 1 : 0);
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
 * @param {import('./config').Config} config
 * @param {"mobile"|"desktop"} device
 * @returns {Promise<import('jimp')>}
 */
export async function create_reference(story, browser, config, device) {
    const page = await browser.newPage(
        device === "mobile"
            ? {
                  deviceScaleFactor: 2,
                  viewport: { width: 360, height: 800 },
              }
            : {
                  viewport: { width: 1920, height: 1080 },
              },
    );
    const url = new URL(`http://genauigkeit-host:${config.port}/iframe.html`);
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
