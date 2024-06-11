# FAQ

## How does it work?

**genauigkeit** will fetch all stories from your Storybook instance. After that it will automatically spin up a Docker container with playwright running.

Now **genauigkeit** will communicate with that playwright instance and create a reference screenshot for both desktop and mobile viewports on Chromium, Webkit and Firefox.

Once references are created, they are used compare upcoming changes.

## Why is Docker required?

Without a consistent testing environment, these type of tests can become flaky and cumbersome really quick. Due to browers rendering content different on varios operating system, Docker provides us an environment that is the same on any machine.
