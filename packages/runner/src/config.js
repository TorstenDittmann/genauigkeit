import { loadConfig } from "c12";

/**
 * @typedef {Object} Config
 * @property {number} storybookPort
 * @property {string} directory
 */
const config_defaults = {
    storybookPort: 6006,
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
