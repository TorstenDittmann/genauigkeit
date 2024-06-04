/**
 * @param {Map<string,import('looks-same').LooksSameWithExistingDiffResult>} results
 */
export async function create_report(results) {
    let content = "<h1>Test Report</h1>";
    content += `
<table>
    <thead>
            <tr>
                <th scope="col"></th>
                <th scope="col">id</th>
                <th scope="col">diff</th>
            </tr>
      </thead>
      <tbody>
      </tbody>
</table>`;
}

const template_base = `
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
        />
        <title>{{title}}</title>
    </head>
    <body>
        <main class="container">{{content}}</main>
    </body>
</html>`;
