import { loadConfig } from "c12";

/**
 * @typedef {Object} Config
 * @property {number} port
 * @property {string} directory
 */
const config_defaults = {
    port: 6006,
    directory: "./.genauigkeit",
};

/**
 * @returns {Promise<Config>}
 */
export async function load_config() {
    const { config } = await loadConfig({
        name: "genauigkeit",
        defaults: config_defaults,
    });

    return config;
}
