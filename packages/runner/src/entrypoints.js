import { cpus } from "node:os";
import { consola } from "consola";
import { emptyDirSync } from "fs-extra";
import PQueue from "p-queue";
import { get_browsers, get_devices, load_config } from "./config.js";
import { connect_to_browser, run_generate, run_tests } from "./engine.js";
import { create_report } from "./report.js";
import { get_stories } from "./storybook.js";

/**
 * @param {?string} pattern Regex pattern to filter stories
 */
export async function generate(pattern = null) {
    const config = await load_config();
    const used_browsers = get_browsers(config);
    const used_devices = get_devices(config);
    const re_pattern = pattern === null ? null : new RegExp(pattern);
    const stories = await get_stories(
        `http://localhost:${config.port}`,
        re_pattern,
    );

    let progress = 0;
    const concurrency =
        config.concurrency === "auto" ? cpus().length : config.concurrency;
    const queue = new PQueue({ concurrency });
    queue.addListener("error", (e) => console.error(e));
    queue.addListener("completed", ({ story, device, target_browser }) => {
        const progress_current = ++progress;
        const progress_text = `[${progress_current}/${
            stories.length * used_devices.length * used_browsers.length
        }]`;
        consola.success(
            `${progress_text} ${story.id} (${target_browser} ${device})`,
        );
    });

    for (const target_browser of used_browsers) {
        const browser = await connect_to_browser(target_browser);
        emptyDirSync(`${config.directory}/current/${target_browser}`);
        emptyDirSync(`${config.directory}/diffs/${target_browser}`);
        emptyDirSync(`${config.directory}/references/${target_browser}`);

        for (const device of used_devices) {
            for (const story of stories) {
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
        await new Promise((resolve, reject) =>
            queue.onIdle().then(resolve).catch(reject),
        );
        await browser.close();
    }
}

/**
 * @param {?string} pattern Regex pattern to filter stories
 */
export async function test(pattern) {
    const config = await load_config();
    const used_browsers = get_browsers(config);
    const used_devices = get_devices(config);
    const re_pattern = pattern === null ? null : new RegExp(pattern);
    const stories = await get_stories(
        `http://localhost:${config.port}`,
        re_pattern,
    );
    const concurrency =
        config.concurrency === "auto" ? cpus().length : config.concurrency;

    /**
     * @type {Result[]} results
     */
    const results = [];
    const queue = new PQueue({ concurrency });
    let progress = 0;
    queue.addListener("error", (e) => console.error(e));
    queue.addListener(
        "completed",
        ({ equal, story, device, target_browser }) => {
            const progress_current = ++progress;
            const progress_text = `[${progress_current}/${
                stories.length * used_devices.length * used_browsers.length
            }]`;
            const output = `${progress_text} ${story.id} (${target_browser} ${device})`;
            equal ? consola.success(output) : consola.fail(output);
            results.push({ story, equal, device, target_browser });
        },
    );

    for (const target_browser of used_browsers) {
        emptyDirSync(`${config.directory}/current/${target_browser}`);
        emptyDirSync(`${config.directory}/diffs/${target_browser}`);
        const browser = await connect_to_browser(target_browser);
        for (const story of stories) {
            for (const device of used_devices) {
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

        await new Promise((resolve, reject) =>
            queue.onIdle().then(resolve).catch(reject),
        );
        await browser.close();
    }

    await create_report(results, config);

    const total_tests =
        stories.length * used_devices.length * used_browsers.length;
    const failed_tests = results.filter(({ equal }) => !equal).length;
    const passed_tests = total_tests - failed_tests;

    for (const result of results) {
        if (result.equal) continue;
        let message = `${result.story.id}\n`;
        message += `  \`url\`: http://localhost:${config.port}/?path=/story/${result.story.id}\n`;
        message += `  \`device\`: ${result.device}\n`;
        message += `  \`browser\`: ${result.target_browser}\n`;
        message += `  \`source\`: ${result.story.importPath}\n`;
        message += `  \`diff\`: ${config.directory}/diffs/${result.target_browser}/${result.story.id}-${result.device}.png`;
        consola.fail(message);
    }

    let summary = `tests ${failed_tests > 0 ? "failed" : "succeeded"}!\n`;
    summary += `\`failed\`: ${failed_tests}\n`;
    summary += `\`passed\`: ${passed_tests}\n`;
    summary += `\`total\`: ${total_tests}`;
    consola.box(summary);

    return failed_tests === 0;
}
