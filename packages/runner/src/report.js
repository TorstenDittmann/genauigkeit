import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import consola from "consola";
import { emptyDirSync } from "fs-extra";

/**
 * @param {Result[]} results
 * @param {Config} config
 */
export async function create_report(results, config) {
    const date = new Date().toLocaleString();
    const title = `Genauigkeite report - ${date}`;
    /** @type{Record<string,{results: Result[], success: boolean}>} init */
    const init = {};
    const results_grouped = results.reduce((prev, curr) => {
        if (!(curr.story.id in prev)) {
            prev[curr.story.id] = {
                results: [],
                success: false,
            };
        }
        prev[curr.story.id].results.push(curr);
        return prev;
    }, init);

    for (const result in results_grouped) {
        results_grouped[result].success = results_grouped[result].results.every(
            (r) => r.equal,
        );
    }

    let body = "<h1>Genauigkeit report</h1>";
    body += `<p>Generated at ${date}</p>`;
    body += `<p>Tests: ${results.length}</p>`;
    for (const [id, summary] of Object.entries(results_grouped)) {
        body += `<details><summary>${summary.success ? "✅" : "❌"} ${id}</summary>`;
        body += `<table><thead><tr><th scope="col" width="24">ℹ️</th><th scope="col">Device</th><th scope="col">Browser</th></tr></thead><tbody>`;
        for (const result of summary.results)
            body += `<tr><td>${result.equal ? "✅" : "❌"}</td><td>${result.device}</td><td>${result.target_browser}</td></tr>`;
        body += "</tbody></table>";
        body += "</details>";
    }
    await write_report(title, "", body, config);
    consola.success(
        `report written to ${join(config.directory, "report", "index.html")}`,
    );
}

/**
 * @param {string} title
 * @param {string} head
 * @param {string} body
 * @param {Config} config
 * @returns {Promise<void>}
 */
async function write_report(title, head, body, config) {
    const directory = dirname(fileURLToPath(import.meta.url));
    const template = readFileSync(join(directory, "report.html")).toString();
    const result = template
        .replace("%title%", title)
        .replace("%head%", head)
        .replace("%body%", body);
    emptyDirSync(join(config.directory, "report"));
    writeFileSync(join(config.directory, "report", "index.html"), result, {
        encoding: "utf-8",
    });
}
