/**
 * @typedef {Object} Story
 * @property {string} type
 * @property {string} id
 * @property {string} name
 * @property {string} title
 * @property {string} importPath
 * @property {string[]} tags
 */

/**
 * @param {string} url_root
 * @returns {Promise<Story[]>}
 */
export async function get_stories(url_root) {
    const response = await fetch(url_root + "/index.json");
    const metadata = await response.json();

    const stories = Object.values(metadata.entries).reduce((acc, entry) => {
        if (entry.type === "story") {
            acc.push(entry);
        }

        return acc;
    }, []);

    return stories;
}
