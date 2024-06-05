declare type Browsers = "chromium" | "firefox" | "webkit";
declare type Devices = "mobile" | "desktop";

declare type Config = {
    port: number;
    directory: string;
    concurrency: "auto" | number;
    browsers: Record<Browsers, boolean>;
    devices: Record<Devices, boolean>;
};

declare type Story = {
    type: string;
    id: string;
    name: string;
    title: string;
    importPath: string;
    tags: string[];
};
