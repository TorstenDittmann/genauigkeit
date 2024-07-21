# Configuration

## Configuration File

The configuration file is located at `genauigkeit.json`.

The default configuration file looks like this:

```json
{
  "port": 6006,
  "strict": false,
  "directory": "./.genauigkeit",
  "concurrency": "auto",
  "browsers": {
    "chromium": true,
    "firefox": true,
    "webkit": true
  },
  "devices": {
    "mobile": true,
    "desktop": true
  }
}
```

## Options

- `port`: The port on which Storybook is running. Default: `6006`.
- `strict`: If `true`, tests will fail if any screenshots differ from the references without any leeway. Default: `false`.
- `directory`: The directory where the test report will be saved. Default: `./.genauigkeit`.
- `concurrency`: The number of concurrent tests to run. `auto` will use number of ports. Default: `"auto"`.
- `browsers`: The browsers to use for testing. Default: `{ chromium: true, firefox: true, webkit: true }`.
- `devices`: The devices to use for testing. Default: `{ mobile: true, desktop: true }`.
