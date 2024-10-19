const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3001;
const cors = require('cors');
app.use(cors());

// Define the base URL and namespace from environment variables
const BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:3001"; // fallback value
const NAMESPACE = process.env.NAMESPACE || "flink";               // fallback value

function getPodDetails(pod) {
    const creationTimestamp = new Date(pod.metadata.creationTimestamp);
    const currentTime = new Date();
    
    // Calculate age in days, hours, and minutes
    const ageInMillis = currentTime - creationTimestamp;
    const ageInSeconds = Math.floor(ageInMillis / 1000);
    const days = Math.floor(ageInSeconds / 86400);
    const hours = Math.floor((ageInSeconds % 86400) / 3600);
    const minutes = Math.floor((ageInSeconds % 3600) / 60);
    
    // Format age
    const age = `${days}d ${hours}h ${minutes}m`;

    // Get last restart time from containerStatuses
    const lastContainerStatus = pod.status.containerStatuses[0]; // Assuming only one container
    const lastRestartTime = lastContainerStatus.lastState.terminated ? 
        new Date(lastContainerStatus.lastState.terminated.finishedAt) : null;

    // Format last restart time
    const formattedLastRestartTime = lastRestartTime ? lastRestartTime.toISOString() : "N/A";

    // Calculate age since last restart
    let ageSinceLastRestart = "N/A"; // Default value
    if (lastRestartTime) {
        const ageSinceLastRestartInMillis = currentTime - lastRestartTime;
        const ageSinceLastRestartInSeconds = Math.floor(ageSinceLastRestartInMillis / 1000);
        const lastRestartDays = Math.floor(ageSinceLastRestartInSeconds / 86400);
        const lastRestartHours = Math.floor((ageSinceLastRestartInSeconds % 86400) / 3600);
        const lastRestartMinutes = Math.floor((ageSinceLastRestartInSeconds % 3600) / 60);
        
        // Format age since last restart
        ageSinceLastRestart = `${lastRestartDays}d ${lastRestartHours}h ${lastRestartMinutes}m`;
    }

    return { age, formattedLastRestartTime, ageSinceLastRestart };
}

// API endpoint to get a list of pods
app.get('/api/pods', (req, res) => {
    const command = `kubectl get pods -n ${NAMESPACE} -o json`;

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

        try {
            const jsonOutput = JSON.parse(stdout); // Parse stdout to JSON
            const selectedPods = jsonOutput.items
            .filter(pod => 
                (pod.metadata.annotations && Object.keys(pod.metadata.annotations).some(key => key.startsWith('flinkdeployment.flink.apache.org/')))
                ||
                (pod.metadata.labels && (pod.metadata.labels.component === 'taskmanager'))
            ).map(pod => {
                const { age, formattedLastRestartTime ,ageSinceLastRestart} = getPodDetails(pod);
                return {
                    name: pod.metadata.name,
                    status: pod.status.phase,
                    num_restarts: pod.status.containerStatuses[0].restartCount,
                    age,
                    resources: pod.spec.containers[0].resources,
                    ageSinceLastRestart
                };
            });
            res.json({ pods: selectedPods }); // Return the selected pods
        } catch (parseError) {
            console.error(`JSON parse error: ${parseError}`);
            res.status(500).json({ error: 'Failed to parse JSON' });
        }
    });
});

// API endpoint to get a list of clusters
app.get('/api/cluster', (req, res) => {
    const command = `kubectl get svc -n ${NAMESPACE} -o json`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ error: error.message });
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ error: stderr });
        }
        try {
            const jsonOutput = JSON.parse(stdout); // Parse the output as JSON
            const selectedServices = jsonOutput.items
                .filter(service => service.metadata.name && service.metadata.name.includes('-rest')) // Check if the name contains '-rest'
                .map(service => service.metadata.name.replace('-rest','')); 

            res.json({ clusters: selectedServices }); // Return the array of service names
        } catch (parseError) {
            console.error(`JSON parse error: ${parseError}`);
            res.status(500).json({ error: 'Failed to parse JSON response from kubectl' });
        }
    });
});

// API endpoint to get Flink deployments
app.get('/api/flink-dep', (req, res) => {
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
