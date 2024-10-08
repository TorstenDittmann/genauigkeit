import { readFile } from "node:fs/promises";
import looksSame from "looks-same";
import { chromium, firefox, webkit } from "playwright";
import sharp from "sharp";

/**
 * @param {Story} story
 * @param {import('playwright').Browser} browser
 * @param {Config} config
 * @param {Devices} device
 * @param {Browsers} target_browser
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
        image.toFile(
            `${config.directory}/references/${target_browser}/${story.id}-${device}.png`,
        ),
    );
}

/**
 * @param {Story} story
 * @param {import('playwright').Browser} browser
 * @param {Config} config
 * @param {Devices} device
 * @param {Browsers} target_browser
 * @returns {Promise<{ story: Story, equal: boolean, device: Devices, target_browser: Browsers, images: {current: Buffer, reference: Buffer, difference?: Buffer}}>}
 */
export async function run_tests(
    story,
    browser,
    config,
    device,
    target_browser,
) {
    const current = await create_reference(story, browser, config, device);
    await current.toFile(
        `${config.directory}/current/${target_browser}/${story.id}-${device}.png`,
    );
    const reference = await readFile(
        `${config.directory}/references/${target_browser}/${story.id}-${device}.png`,
    );
    const diff = await looksSame(
        `${config.directory}/references/${target_browser}/${story.id}-${device}.png`,
        `${config.directory}/current/${target_browser}/${story.id}-${device}.png`,
        { strict: config.strict, createDiffImage: true },
    );

    if (!diff.equal) {
        if (!diff.diffImage) throw new Error("Diff image was not created");
        diff.diffImage.save(
            `${config.directory}/diffs/${target_browser}/${story.id}-${device}.png`,
        );
    }

    return {
        story,
        equal: diff.equal,
        device,
        target_browser,
        images: {
            current: await current.toBuffer(),
            reference,
            difference: await diff.diffImage?.createBuffer("png"),
        },
    };
}

/**
 * @param {Browsers} type
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
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
    throw new Error("Could not connect to browser");
}

/**
 * Take a screenshot of the story
 * @param {Story} story
 * @param {import('playwright').Browser} browser
 * @param {Config} config
 * @param {Devices} device
 * @returns {Promise<sharp.Sharp>}
 */
export async function create_reference(story, browser, config, device) {
    const page = await browser.newPage(
        device === "mobile"
            ? {
                  deviceScaleFactor: 2,
                  viewport: { width: 480, height: 920 },
                  reducedMotion: "reduce",
              }
            : {
                  viewport: { width: 1920, height: 1080 },
                  reducedMotion: "reduce",
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
 * @returns {Promise<sharp.Sharp>}
 */
async function crop_image(buffer) {
    return sharp(buffer).trim({
        lineArt: true,
        threshold: 0,
    });
}
