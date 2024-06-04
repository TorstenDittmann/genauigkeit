import { loadConfig } from "c12";

/**
 * @typedef {Object} Config
 * @property {number} port
 * @property {string} directory
 * @property {"auto"|number} concurrency
 */
const config_defaults = {
    port: 6006,
    directory: "./.genauigkeit",
    concurrency: "auto",
};

/**
 * @returns {Promise<Config>}
 */
export async function load_config() {
    const { config } = await loadConfig({
        name: "genauigkeit",
        defaultConfig: config_defaults,
    });

    return config;
}
