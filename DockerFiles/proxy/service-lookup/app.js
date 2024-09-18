const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3001;
const cors = require('cors');
app.use(cors());

// Define the base URL as a global variable
const BASE_URL = "http://localhost:3001";
const NAMESPACE = "flink";

// API endpoint to get a list of pods
app.get('/pods', (req, res) => {
    const command = `kubectl get pods -n ${NAMESPACE}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            res.status(500).json({ error: error.message });
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            res.status(500).json({ error: stderr });
            return;
        }
        res.json({ data: stdout });
    });
});

// API endpoint to get a list of clusters
app.get('/cluster', (req, res) => {
    const command = `kubectl get svc -n ${NAMESPACE} | grep 8081 | awk '{print $1}'`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            res.status(500).json({ error: error.message });
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            res.status(500).json({ error: stderr });
            return;
        }
        console.log(stdout)
        const clusters = stdout.split('\n').map(line => line.replace('-rest', '')).filter(line => line.trim() !== '');
        res.json({ clusters });
    });
});

// API endpoint to get Flink deployments
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
                res.status(500).json({ error: error.message });
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                res.status(500).json({ error: stderr });
                return;
            }
            res.json({ data: stdout });
        });
    } else {
        command = `kubectl get flinkdep -n ${NAMESPACE} | awk '{print $1}' | tail -n +2`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                res.status(500).json({ error: error.message });
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                res.status(500).json({ error: stderr });
                return;
            }
            const deployments = stdout.split('\n').map(line => line.trim()).filter(line => line.trim() !== '');
            res.json({ deployments });
        });
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
