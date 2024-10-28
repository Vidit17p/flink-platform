const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3001;
const cors = require('cors');
app.use(cors());

// Define the base URL and namespace from environment variables
const BASE_URL = process.env.BASE_URL || "http://localhost:3001"; // fallback value
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
    const lastContainerStatus = pod.status.containerStatuses ? pod.status.containerStatuses[0] : null ;
    const lastRestartTime = lastContainerStatus ? lastContainerStatus.lastState.terminated ? 
        new Date(lastContainerStatus.lastState.terminated.finishedAt) : null : null;

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

    return { age, ageSinceLastRestart };
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
                const restartCount = pod.status.containerStatuses && pod.status.containerStatuses.length > 0 ? pod.status.containerStatuses[0].restartCount : 0;
                const resources = pod.spec.containers && pod.spec.containers.length > 0 ? pod.spec.containers[0].resources : {};
                const { age ,ageSinceLastRestart} = getPodDetails(pod);
                return {
                    name: pod.metadata.name,
                    status: pod.status.phase,
                    num_restarts: restartCount,
                    age,
                    resources: resources,
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
        const flinkDepCommand = `kubectl get flinkdep ${queryParams['clusterName']} -n ${NAMESPACE} -o json`;
        const flinkEventsCommand = `kubectl describe flinkdep ${queryParams['clusterName']} -n ${NAMESPACE}  | awk '/Events:/,EOF'`;
        
        Promise.all([
            new Promise((resolve, reject) => {
                exec(flinkDepCommand, { maxBuffer: 1024 * 500 }, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`exec error: ${error}`);
                        reject(error);
                    } else if (stderr) {
                        console.error(`stderr: ${stderr}`);
                        reject(new Error(stderr));
                    } else {
                        try {
                            resolve(JSON.parse(stdout));
                        } catch (parseError) {
                            console.error(`JSON parse error: ${parseError}`);
                            reject(parseError);
                        }
                    }
                });
            }),
            new Promise((resolve, reject) => {
                exec(flinkEventsCommand, { maxBuffer: 1024 * 500 }, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`exec error: ${error}`);
                        reject(error);
                    } else if (stderr) {
                        console.error(`stderr: ${stderr}`);
                        reject(new Error(stderr));
                    } else {
                        resolve(stdout.trim()); // Treat as string, trim any leading/trailing whitespace
                    }
                });
            })
        ]).then(([flinkDepOutput, flinkEventsOutput]) => {
            res.json({ flinkDep: flinkDepOutput, flinkEvents: flinkEventsOutput });
        }).catch(error => {
            res.status(500).json({ error: error.message });
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
    console.log(`App listening at ${BASE_URL}`);
});
