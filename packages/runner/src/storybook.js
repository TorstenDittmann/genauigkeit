import { consola } from "consola";

/**
 * @param {string} url_root
 * @param {?RegExp} pattern
 * @returns {Promise<Story[]>}
 */
export async function get_stories(url_root, pattern = null) {
    consola.start("fetching stories...");
    const response = await fetch(`${url_root}/index.json`);
    const metadata = await response.json();

    const stories = Object.values(metadata.entries).reduce((acc, entry) => {
        if (entry.type === "story") {
            if (pattern !== null && !pattern.test(entry.id)) {
                return acc;
            }
            acc.push(entry);
        }

        return acc;
    }, []);
    consola.ready(`fetched ${stories.length} stories!`);
    return stories;
}
