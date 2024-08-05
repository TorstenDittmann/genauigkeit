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

const shared_args = {
    pattern: {
        alias: "p",
        describe: "Regex pattern to filter stories",
    },
};

cli.command("test", "Run tests.", { ...shared_args }, async (args) => {
    await start_server();
    consola.info("running tests...");
    const pattern = args.pattern === undefined ? null : String(args.pattern);
    const succesful = await test(pattern);
    process.exit(succesful ? 0 : 1);
});

cli.command(
    "generate",
    "Generate references.",
    { ...shared_args },
    async (args) => {
        await start_server();
        consola.info("generate references...");
        const pattern =
            args.pattern === undefined ? null : String(args.pattern);
        await generate(pattern);
    },
);

cli.command("init", "Initialize genauigkeit", async () => {
    await init_config();
});

cli.help().argv;
