import { consola } from "consola";
import { emptyDirSync } from "fs-extra";
import PQueue from "p-queue";
import { load_config } from "./config.js";
import { BROWSERS, CPU_COUNT, DEVICES } from "./constants.js";
import { connect_to_browser, run_generate, run_tests } from "./engine.js";
import { get_stories } from "./storybook.js";

export async function generate() {
    const config = await load_config();
    const stories = await get_stories(`http://localhost:${config.port}`);

    let progress = 0;
    const queue = new PQueue({ concurrency: CPU_COUNT });
    queue.addListener("error", (e) => console.error(e));
    queue.addListener("completed", ({ story, device, target_browser }) => {
        const progress_current = ++progress;
        const progress_text = `[${progress_current}/${
            stories.length * DEVICES.length * BROWSERS.length
        }]`;
        consola.success(`${progress_text} ${story.id} (${target_browser} ${device})`);
    });

    for (const target_browser of BROWSERS) {
        const browser = await connect_to_browser(target_browser);

        emptyDirSync(`${config.directory}/current/${target_browser}`);
        emptyDirSync(`${config.directory}/diffs/${target_browser}`);
        emptyDirSync(`${config.directory}/references/${target_browser}`);

        for (const story of stories) {
            for (const device of DEVICES) {
                queue.add(async () => {
                    await run_generate(
                        story,
                        browser,
                        config,
                        device,
                        target_browser,
                    );
                    return { story, device, target_browser };
                });
            }
        }
    }

    await new Promise((resolve, reject) =>
        queue.onIdle().then(resolve).catch(reject),
    );
}

export async function test() {
    const config = await load_config();
    const stories = await get_stories(`http://localhost:${config.port}`);

    let progress = 0;
    const results = [];
    const queue = new PQueue({ concurrency: CPU_COUNT });
    queue.addListener("error", (e) => console.error(e));
    queue.addListener(
        "completed",
        ({ diff, story, device, target_browser }) => {
            const progress_current = ++progress;
            const progress_text = `[${progress_current}/${
                stories.length * DEVICES.length * BROWSERS.length
            }]`;
            if (!diff.equal) {
                consola.fail(
                    `${progress_text} diff found for ${story.id} (${target_browser} ${device})`,
                );
            } else {
                consola.success(
                    `${progress_text} ${story.id} (${target_browser} ${device})`,
                );
            }
            results.push({ story, diff, device, target_browser });
        },
    );

    for (const target_browser of BROWSERS) {
        emptyDirSync(`${config.directory}/current/${target_browser}`);
        emptyDirSync(`${config.directory}/diffs/${target_browser}`);
        const browser = await connect_to_browser(target_browser);
        for (const story of stories) {
            for (const device of DEVICES) {
                queue.add(
                    async () =>
                        await run_tests(
                            story,
                            browser,
                            config,
                            device,
                            target_browser,
                        ),
                );
            }
        }
    }

    /** @type {{story: Story, diff: looksSame.LooksSameWithExistingDiffResult}[]} */
    await new Promise((resolve, reject) =>
        queue.onIdle().then(resolve).catch(reject),
    );

    const total_tests = stories.length * DEVICES.length * BROWSERS.length;
    const failed_tests = results.filter(({ diff }) => !diff.equal).length;
    const passed_tests = total_tests - failed_tests;

    let summary = `Tests ${failed_tests > 0 ? "failed" : "succeeded"}!\n`;
    summary += `Failed: ${failed_tests}\n`;
    summary += `Passed: ${passed_tests}\n`;
    summary += `Total: ${total_tests}`;
    consola.box(summary);

    return failed_tests === 0;
}