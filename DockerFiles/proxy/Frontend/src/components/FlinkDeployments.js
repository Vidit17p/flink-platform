import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap"; // Assuming Bootstrap is used

const FlinkDeploymentDetails = ({ deploymentDetails }) => {
  if (!deploymentDetails) {
    return <div className="spinner-border text-primary" role="status"><span className="sr-only">Loading...</span></div>;
  }

  const { metadata, spec, status } = deploymentDetails.flinkDep;
  const job = spec?.job || {};
  const jobManager = spec?.jobManager || {};
  const taskManager = spec?.taskManager || {};
  const clusterInfo = status?.clusterInfo || {};
  const jobStatus = status?.jobStatus || {};
  const reconciliationStatus = status?.reconciliationStatus || {};
  const lifecycleState = status?.lifecycleState || "Unknown";

  const getJobStateColor = (state) => {
    switch (state?.toLowerCase()) {
      case 'created':
        return '#007bff'; // Blue
      case 'running':
        return '#28a745'; // Green
      case 'deployed':
        return '#17a2b8'; // Cyan
      case 'reconciled':
        return '#ffc107'; // Yellow
      case 'failed':
        return '#dc3545'; // Red
      default:
        return 'inherit';
    }
  };

  return (
    <div>
      <h2>Deployment: {metadata.name}</h2>
      <section>
        <h3>General Information</h3>
        <p><strong>Namespace:</strong> {metadata.namespace}</p>
        <p><strong>Creation Timestamp:</strong> {metadata.creationTimestamp}</p>
        <p><strong>Flink Version:</strong> {spec.flinkVersion}</p>
        <p><strong>Image:</strong> {spec.image}</p>
      </section>

      <section>
        <h3>Job Information</h3>
        <p><strong>Job Name:</strong> {jobStatus.jobName || 'N/A'}</p>
        <p><strong>Job State:</strong> <span style={{ color: getJobStateColor(jobStatus.state), fontWeight: 'bold' }}>{jobStatus.state}</span></p>
        <p><strong>Job Parallelism:</strong> {job.parallelism}</p>
        <p><strong>Job JAR URI:</strong> {job.jarURI}</p>
        <p><strong>Start Time:</strong> {new Date(parseInt(jobStatus.startTime)).toLocaleString()}</p>
        <p><strong>Job ID:</strong> {jobStatus.jobId}</p>
      </section>

      <section>
        <h3>Cluster Info</h3>
        <p><strong>Flink Revision:</strong> {clusterInfo['flink-revision']}</p>
        <p><strong>Total CPU:</strong> {clusterInfo['total-cpu']}</p>
        <p><strong>Total Memory:</strong> {clusterInfo['total-memory']} bytes</p>
      </section>

      <section>
        <h3>Job Manager</h3>
        <p><strong>Replicas:</strong> {jobManager.replicas}</p>
        <p><strong>CPU:</strong> {jobManager.resource.cpu}</p>
        <p><strong>Memory:</strong> {jobManager.resource.memory}</p>
      </section>

      <section>
        <h3>Task Manager</h3>
        <p><strong>CPU:</strong> {taskManager.resource.cpu}</p>
        <p><strong>Memory:</strong> {taskManager.resource.memory}</p>
        <p><strong>Task Slots:</strong> {spec.flinkConfiguration['taskmanager.numberOfTaskSlots']}</p>
      </section>

      <section>
        <h3>Event Status</h3>
        <p><strong>Lifecycle State:</strong> {lifecycleState}</p>
        <p><strong>Last Reconciliation:</strong> {new Date(parseInt(reconciliationStatus.reconciliationTimestamp)).toLocaleString()}</p>
        <p><strong>Reconciliation State:</strong> {reconciliationStatus.state}</p>
        <p><strong>Observed Generation:</strong> {status.observedGeneration}</p>
      </section>

      <section>
        <h3>Flink Events</h3>
        <pre>{deploymentDetails.flinkEvents}</pre>
      </section>
    </div>
  );
};

function FlinkDeployments() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deploymentDetails, setDeploymentDetails] = useState(null);

  const BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:3001"; // Fallback if env var is not set

  useEffect(() => {
    fetchDeployments();
  }, [BASE_URL]);

  const fetchDeployments = () => {
    setLoading(true);
    setError(null);
    axios.get(`${BASE_URL}/api/flink-dep`)
      .then(response => {
        const data = response.data['deployments'];
        setDeployments(data.map(name => ({
          name: name,
          href: `${BASE_URL}/api/flink-dep?clusterName=${encodeURIComponent(name)}`
        })));
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching deployments:", error);
        setError("Failed to load deployments. Please try again.");
        setLoading(false);
      });
  };

  const fetchDeploymentDetails = (deployment) => {
    setSelectedDeployment(deployment);
    setModalVisible(true);
    setDeploymentDetails(null); // Clear previous data before fetching new one
    axios.get(deployment.href)
      .then(response => {
        setDeploymentDetails(response.data);
      })
      .catch(error => {
        console.error("Error fetching deployment details:", error);
        setDeploymentDetails(null); // Clear if error occurs
      });
  };

  const closeModal = () => {
    setModalVisible(false);
    setDeploymentDetails(null);
  };

  if (loading) {
    return <div className="spinner-border text-primary" role="status"><span className="sr-only">Loading...</span></div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <button className="btn btn-link" onClick={fetchDeployments}>Retry</button>
      </div>
    );
  }

  return (
    <div className="FlinkDeployments">
      <h1>Flink Deployments</h1>
      <div className="row">
        {deployments.map((dep, index) => (
          <div className="col-md-4" key={index}>
            <div className="card mb-3">
              <div className="card-body">
                <button
                  className="btn btn-primary"
                  onClick={() => fetchDeploymentDetails(dep)}
                >
                  {dep.name}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for deployment details */}
      <Modal className="custom-modal" show={modalVisible} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Deployment Details: {selectedDeployment?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FlinkDeploymentDetails deploymentDetails={deploymentDetails} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default FlinkDeployments;
