# genauigkeit

## Visual Regression Testing for Storybook

\*genauigkeit\*\* (German for "accuracy") is a library that simplifies visual regression testing for your components in Storybook. It leverages the power of concurrency and Docker containers to ensure fast and reliable tests.

## Key Features

-   **Fast:** Concurrent testing significantly reduces test execution time.
-   **Local:** Run tests locally without the need for a cloud service.
-   **Reliable:** Docker containers provide a consistent isolated environment for screenshot generation, eliminating environmental discrepancies.
-   **Easy to Use:** Integrate genauigkeit seamlessly into your existing Storybook workflow.

## Requirements

-   Node.js 20 or higher
-   Docker

## Installation

```sh
npx nypm add genauigkeit
```

## Usage

Generate a configuration file by running the following command:

```sh
npx genauigkeit init
```

### Generate References

To generate reference screenshots, execute the following command:

```sh
npx genauigkeit reference
```

### Run Tests

To run tests, execute the following command:

```bash
npx genauigkeit test
```

### package.json

You can also add scripts to your package.json:

```json
{
    "scripts": {
        "genauigkeit:generate": "genauigkeit generate",
        "genauigkeit:test": "genauigkeit test"
    }
}
```

## Contributing

We welcome contributions! Please refer to the [contribution guidelines](./CONTRIBUTING.md) before submitting a pull request.

## License

This project is licensed under the MIT License.
