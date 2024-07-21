# GitHub Actions

To run genauigkeit in a GitHub Actions workflow, you need to create a `.github/workflows` directory in your repository and add a `.yml` file with the following content:

```yaml
name: Genauigkeit Tests
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20
    - name: Install dependencies
      run: npm ci
    - name: Run Genauigkeit tests
      run: npx genauigkeit test
    - uses: actions/upload-artifact@v4
      if: ${{ !cancelled() }}
      with:
        name: genauigkeit-report
        path: .genauigkeit/report/
        retention-days: 30
```

This workflow will run your tests on every push to the `main` branch and on every pull request targeting the `main` branch. It will install dependencies, run your tests, and upload the test report as an artifact.

For more information on GitHub Actions, see the [official documentation](https://docs.github.com/en/actions).

## Download Report

To download the test report, navigate to the Actions tab in your repository and select the latest workflow run. You can download the report by clicking on the `genauigkeit-report` artifact.

![Download Report](/github-report.png)