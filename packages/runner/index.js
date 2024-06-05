import { consola } from "consola";
import yargs from "yargs";
import { generate, test } from "./src/entrypoints.js";
import { init_config } from "./src/init.js";
import { start_server, stop_server } from "./src/server.js";

const cli = yargs(process.argv.slice(2));

cli.scriptName("genauigkeit")
    .alias("-h", "--help")
    .alias("-v", "--version")
    .strict(true);

cli.fail(async (msg, err) => {
    if (err) {
        return err;
    }
    consola.error(msg);
    process.exit(1);
});

cli.command("test", "Run tests.", async () => {
    await start_server();
    consola.info("Running tests...");
    const succesful = await test();
    await stop_server();
    process.exit(succesful ? 0 : 1);
});

cli.command("generate", "Generate references", async () => {
    await start_server();
    consola.info("Generate references...");
    await generate();
    await stop_server();
});

cli.command("init", "Initialize genauigkeit", async () => {
    await init_config();
});

cli.help().argv;
