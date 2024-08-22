const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3000;

// Define the base URL as a global variable
const BASE_URL = process.env.BASE_URL;
const NAMESPACE = process.env.NAMESPACE;

app.get('/', (req, res) => {

    res.send(` <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Flink</title>
            </head>
            <body>
                <h1> <a href="${BASE_URL}/cluster">Clusters</a> </h1>
                <h1> <a href="${BASE_URL}/pods">Pods</a>  </h1>
            </body>
            <footer>
                <p style="color:white"> VklESVQtUEFURUwt </p>
            </footer>
            </html>`);
});

app.get('/pods', (req, res) => {
    // Command to be executed
    const command = 'kubectl get pods -n ${NAMESPACE}'; // Replace 'ls' with any command you want to run

    // Execute the command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            res.status(500).send(`Server Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            res.status(500).send(`Error: ${stderr}`);
            return;
        }

        // Send the output of the command as the response
        res.send(`<pre>${stdout}</pre>`);
    });
});

app.get('/cluster', (req, res) => {
    // Command to be executed
    const command = "kubectl get svc -n ${NAMESPACE} | grep 8081 |awk '{print $1}'"; // Replace 'ls' with any command you want to run

    // Execute the command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            res.status(500).send(`Server Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            res.status(500).send(`Error: ${stderr}`);
            return;
        }

        // Split the output into lines and create hyperlinks
        const lines = stdout.split('\n').map(line => line.replace('-rest', ''));
        const links = lines.map(line => {
            if (line.trim() !== '') {
                return `<a href="${BASE_URL}/cluster/${encodeURIComponent(line.trim())}/#/overview" target="_blank" rel="noopener noreferrer">${line.trim()}</a>`;
            }
            return '';
        }).join('<br>');

        // Send the HTML response with a title
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Flink Clusters</title>
            </head>
            <body>
                <h1>Flink Clusters</h1>
                <pre>${links}</pre>
            </body>
            </html>
        `);
    });
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
