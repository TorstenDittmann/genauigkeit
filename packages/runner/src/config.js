import { loadConfig } from "c12";
import { BROWSERS, DEVICES } from "./constants.js";

/**
 * @param {Config} config
 */
export function get_browsers(config) {
    return BROWSERS.filter((b) => config.browsers[b]);
}

/**
 * @param {Config} config
 */
export function get_devices(config) {
    return DEVICES.filter((d) => config.devices[d]);
}

/**
 * @type {Config} config
 */
export const config_defaults = {
    port: 6006,
    strict: false,
    directory: "./.genauigkeit",
    concurrency: "auto",
    browsers: {
        chromium: true,
        firefox: true,
        webkit: true,
    },
    devices: {
        mobile: true,
        desktop: true,
    },
};

/**
 * @returns {Promise<Config>}
 */
export async function load_config() {
    const { config } = await loadConfig({
        name: "genauigkeit",
        defaultConfig: config_defaults,
    });

    if (config === null) {
        throw new Error("Could not load configuration.");
    }

    return config;
}
