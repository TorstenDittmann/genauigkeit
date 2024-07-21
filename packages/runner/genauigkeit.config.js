/** @type {Config} */
export default {
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
