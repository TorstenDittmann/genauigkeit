declare type Browsers = "chromium" | "firefox" | "webkit";
declare type Devices = "mobile" | "desktop";

declare type Config = {
    port: number;
    directory: string;
    strict: boolean;
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

declare type Result = {
    story: Story;
    equal: boolean;
    device: Devices;
    target_browser: Browsers;
};
