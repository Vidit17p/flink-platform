const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3001;

// Define the base URL as a global variable
const BASE_URL = "http://localhost:3001";
const NAMESPACE = "flink";


// TODO = REPLACE with process.env.BASE_URL
// const NAMESPACE = process.env.NAMESPACE;
// const BASE_URL = process.env.BASE_URL;


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
                <h1> <a href="${BASE_URL}/flink-dep">Flink Deployments</a>  </h1>
            </body>
            <footer>
                <p style="color:white"> VklESVQtUEFURUwt </p>
            </footer>
            </html>`);
});

app.get('/pods', (req, res) => {
    // Command to be executed
    const command = `kubectl get pods -n ${NAMESPACE}`; // Replace 'ls' with any command you want to run

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
        res.send(`<pre>${stdout}</pre><footer><a href="${BASE_URL}">back</a></footer>`);
    });
});

app.get('/cluster', (req, res) => {
    // Command to be executed
    const command = `kubectl get svc -n ${NAMESPACE} | grep 8081 |awk '{print $1}'` // Replace 'ls' with any command you want to run

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
            <footer><a href="${BASE_URL}">back</a></footer>
            </html>
        `);
    });
});

app.get('/flink-dep', (req, res) => {
    const queryParams = req.query;
    let command;
    if ('clusterName' in queryParams) {
        command = `kubectl describe flinkdep ${queryParams['clusterName']} -n ${NAMESPACE} | awk '
                    /Status:/ && !status_printed {status_printed=1; in_status=1}
                    /Spec:/ && !spec_printed {spec_printed=1; in_spec=1}
                    /Events:/ && !events_printed {events_printed=1; in_events=1}
    
                    /^$/ {in_status=0; in_spec=0; in_events=0}
    
                    in_status || in_spec || in_events {print}
                    ' > output.txt && cat output.txt`;
        exec(command, { maxBuffer: 1024 * 500 }, (error, stdout, stderr) => {
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
            res.send(`<h1>${queryParams['clusterName']}</h1><pre>${stdout}</pre><footer><a href="${BASE_URL}/flink-dep">back</a></footer>`);
        });
    } else {
        command = ` kubectl get flinkdep -n ${NAMESPACE} | awk '{print $1}' |  tail -n +2`
        // Split the output into lines and create hyperlinks
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
            const lines = stdout.split('\n').map(line => line.replace('', ''));
            const links = lines.map(line => {
                if (line.trim() !== '') {
                    return `<a href="${BASE_URL}/flink-dep?clusterName=${encodeURIComponent(line.trim())}">${line.trim()}</a>`;
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
                    <title>Flink Deployments</title>
                </head>
                <body>
                    <h1>Flink Deployments</h1>
                    <pre>${links}</pre>
                </body>
                <footer><a href="${BASE_URL}">back</a></footer>
                </html>
            `);
        });
        
    }
    // Set a larger buffer size
    
});



app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});