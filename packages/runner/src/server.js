import { consola } from "consola";
import Docker from "dockerode";

/** @type {?string} */
let container_id = null;

/**
 * Start a Playwright server in a Docker container
 * @returns {Promise<Docker.Container>}
 */
export async function start_server() {
    await stop_server();
    consola.start("server starting...");
    const docker = new Docker();
    const container = await docker.createContainer({
        name: "genauigkeit",
        Image: "mcr.microsoft.com/playwright:v1.44.1-jammy",
        Tty: true,
        OpenStdin: true,
        Cmd: [
            "/bin/sh",
            "-c",
            "cd /home/pwuser && npx -y playwright@1.44.1 run-server --port 1337",
        ],
        HostConfig: {
            ExtraHosts: ["genauigkeit-host:host-gateway"],
            IpcMode: "host",
            PortBindings: {
                "1337/tcp": [
                    {
                        HostPort: "1337",
                    },
                ],
            },
        },
        Labels: {
            genauigkeit: "true",
        },
        ExposedPorts: {
            "1337/tcp": {},
        },
    });
    await container.start();

    consola.success("server started!");

    container_id = container.id;

    return container;
}

export async function restart_server() {
    if (container_id === null) {
        return;
    }
    const docker = new Docker();
    const container = docker.getContainer(container_id);
    await container.restart();
}

export async function stop_server() {
    const docker = new Docker();
    const containers = await docker.listContainers({
        filters: {
            label: ["genauigkeit=true"],
        },
        all: true,
    });
    for (const containerInfo of containers) {
        consola.start("stopping server");
        const container = docker.getContainer(containerInfo.Id);

        await container.stop().catch(() => null);
        await container.remove().catch(() => null);
        consola.ready("server stopped");
    }
}
