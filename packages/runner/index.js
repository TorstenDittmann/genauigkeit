import { consola } from "consola";
import yargs from "yargs";
import { run_generate, run_tests } from "./src/engine.js";
import { init_config } from "./src/init.js";
import { start_server, stop_server } from "./src/server.js";

const cli = yargs(process.argv.slice(2));

cli.scriptName("genauigkeit").alias("-h", "--help").alias("-v", "--version");

cli.command("test", "Run tests.", async () => {
    await start_server();
    consola.info("Running tests...");
    await run_tests();
    await stop_server();
});

cli.command("generate", "Generate references", async () => {
    await start_server();
    consola.info("Generate references...");
    await run_generate();
    await stop_server();
});

cli.command("init", "Initialize genauigkeit", async () => {
    await init_config();
});

cli.fail(async (msg, err) => {
    await stop_server();
    consola.warning(msg);
    if (err) {
        consola.error(err);
    }
    process.exit(1);
});

cli.help().argv;
