import { writeFile } from "node:fs/promises";
import { consola } from "consola";
import path from "node:path";

const GIT_IGNORE = `current/
diffs/`;

export async function init_config() {
    const port = Number.parseInt(
        await consola.prompt("Storybook Port", {
            type: "text",
            default: "6006",
            placeholder: "6006",
        }),
    );
    const directory = await consola.prompt("Screenshots directory", {
        type: "text",
        default: "./.genauigkeit",
        placeholder: "./.genauigkeit",
    });

    console.log();
    consola.info("Initializing genauigkeit");

    const config_path = path.join("./genauigkeit.json");
    await writeFile(
        config_path,
        JSON.stringify({ port, directory }, undefined, 4),
        {
            encoding: "utf-8",
        },
    );
    consola.success(`${config_path} created.`);

    const gi_path = path.join(directory, ".gitignore");
    await writeFile(gi_path, GIT_IGNORE);
    consola.success(`${gi_path} created.`);

    let final = "genauigkeit is now ready!\n\n";
    final += "You can run `npx genauigkeit generate` to create references.\n";
    final += "After that, you can run `npx genauigkeit test` to run the tests.";
    final += "\nYou can also add scripts to your `package.json`:";
    final += '\n\n"scripts": {';
    final += '\n  "genauigkeit:generate": "genauigkeit generate",';
    final += '\n  "genauigkeit:test": "genauigkeit test"';
    final += "\n}";
    final += "\n\nHappy testing! 🎉";

    consola.box(final);
}
