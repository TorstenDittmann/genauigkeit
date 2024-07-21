import { consola } from "consola";
import Docker from "dockerode";

/** @type {?string} */
let container_id = null;

const version = "1.45.2";
const image = `mcr.microsoft.com/playwright:v${version}`;

/**
 * @param {string} docker_image
 * @param {Docker} docker
 */
export async function local_image_available(docker_image, docker) {
    return docker
        .getImage(image)
        .inspect()
        .then(() => true)
        .catch(() => false);
}

/**
 * @param {string} image
 * @param {Docker} docker
 */
export async function pull_image(image, docker) {
    consola.info(`pulling image ${image}`);
    const pulling = await docker.pull(image);
    return new Promise((resolve, reject) => {
        pulling.addListener("data", (buffer) => {
            try {
                const response = JSON.parse(buffer.toString());
                if (response?.progress) {
                    consola.info(response.progress);
                }
            } catch {}
        });
        pulling.addListener("end", () => {
            consola.success(`pulled image ${image}`);
            resolve(true);
        });
        pulling.addListener("error", reject);
    });
}

/**
 * Start a Playwright server in a Docker container
 * @returns {Promise<Docker.Container>}
 */
export async function start_server() {
    await stop_server();
    consola.start("server starting...");
    const docker = new Docker();

    if (!(await local_image_available(image, docker))) {
        await pull_image(image, docker);
    }

    const container = await docker.createContainer({
        name: "genauigkeit",
        Image: image,
        Tty: true,
        OpenStdin: true,
        Cmd: [
            "/bin/sh",
            "-c",
            `cd /home/pwuser && npx -y playwright@${version} run-server --port 1337`,
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
