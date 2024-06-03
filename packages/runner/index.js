import { Clerc } from "clerc";
import { helpPlugin } from "@clerc/plugin-help";
import { run_generate, run_tests } from "./src/engine.js";

const cli = Clerc.create();

cli.name("Genauigkeit CLI")
    .scriptName("genauigkeit")
    .version("1.0.0")
    .description("A visual regression testing tool.");

cli.use(helpPlugin());

cli.command("test", "A foo command")
    .on("test", async (context) => {
        await run_tests();
    })
    .parse();
