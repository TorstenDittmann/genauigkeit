import { consola } from "consola";

/**
 * @param {string} url_root
 * @returns {Promise<Story[]>}
 */
export async function get_stories(url_root) {
    consola.start("Fetching stories...");
    const response = await fetch(`${url_root}/index.json`);
    const metadata = await response.json();

    const stories = Object.values(metadata.entries).reduce((acc, entry) => {
        if (entry.type === "story") {
            acc.push(entry);
        }

        return acc;
    }, []);
    consola.ready(`Fetched ${stories.length} stories!`);
    return stories;
}
