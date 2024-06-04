import jimp from "jimp";
import looksSame from "looks-same";
import { chromium, firefox, webkit } from "playwright";

/**
 * @param {Story} story
 * @param {import('playwright').Browser} browser
 * @param {import('./config.js').Config} config
 * @param {"desktop"|"mobile"} device
 * @param {"chromium"|"firefox"|"webkit"} target_browser
 * @returns {Promise<void>}
 */
export async function run_generate(
    story,
    browser,
    config,
    device,
    target_browser,
) {
    await create_reference(story, browser, config, device).then((image) =>
        image.write(
            `${config.directory}/references/${target_browser}/${story.id}-${device}.png`,
        ),
    );
}

/**
 * @param {Story} story
 * @param {import('playwright').Browser} browser
 * @param {import('./config.js').Config} config
 * @param {"desktop"|"mobile"} device
 * @param {"chromium"|"firefox"|"webkit"} target_browser
 * @returns {Promise<{story:Story,diff:looksSame.LooksSameWithExistingDiffResult,device:"desktop"|"mobile"}>}
 */
export async function run_tests(
    story,
    browser,
    config,
    device,
    target_browser,
) {
    const ref = await create_reference(story, browser, config, device);
    await ref.writeAsync(
        `${config.directory}/current/${target_browser}/${story.id}-${device}.png`,
    );

    const diff = await looksSame(
        `${config.directory}/references/${target_browser}/${story.id}-${device}.png`,
        `${config.directory}/current/${target_browser}/${story.id}-${device}.png`,
        { strict: true, createDiffImage: true },
    );
    if (!diff.equal) {
        diff.diffImage.save(
            `${config.directory}/diffs/${target_browser}/${story.id}-${device}.png`,
        );
    }

    return { story, equal: diff.equal, device, target_browser };
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
