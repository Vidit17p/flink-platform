import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";



const FlinkSessionDetails = ({ sessionDetails }) => {
  if (!sessionDetails) {
    return <div className="spinner-border text-primary" role="status"><span className="sr-only">Loading...</span></div>;
  }

  const { metadata, spec, status } = sessionDetails.flinkDep;
  const job = spec?.job || {};
  const jobStatus = status?.jobStatus || {};
  const reconciliationStatus = status?.reconciliationStatus || {};
  const lifecycleState = status?.lifecycleState || "Unknown";
  const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001"; // Fallback if env var is not set


  const getJobStateColor = (state) => {
    switch (state?.toLowerCase()) {
      case 'running':
        return '#28a745'; // Green
      case 'reconciling': 
        return '#ffc107'; // Yellow
      case 'failed':
        return '#dc3545'; // Red
      default:
        return 'inherit';
    }
  };

  return (
    <div>
      <h2>Session Job: {metadata.name}</h2>
      <section>
        <h3>General Information</h3>
        <p><strong>Namespace:</strong> {metadata.namespace}</p>
        <p><strong>Creation Timestamp:</strong> {metadata.creationTimestamp}</p>
        <p><strong>Deployment Name:</strong> <button className="btn btn-link p-0" onClick={() => window.location.href=`/flink-deployments?deployment=${encodeURIComponent(spec.deploymentName)}`}>{spec.deploymentName}</button></p>
      </section>

      <section>
        <h3>Job Information</h3>
        <p><strong>Job Name:</strong> {jobStatus.jobName || 'N/A'}</p>
        <p><strong>Job State:</strong> <span style={{ color: getJobStateColor(jobStatus.state), fontWeight: 'bold' }}>{jobStatus.state}</span></p>
        <p><strong>Job Parallelism:</strong> {job.parallelism}</p>
        <p><strong>Job JAR URI:</strong> {job.jarURI}</p>
        <p><strong>Start Time:</strong> {new Date(parseInt(jobStatus.startTime)).toLocaleString()}</p>
        <p><strong>Job ID:</strong> {jobStatus.jobId}</p>
        <p><strong>Upgrade Mode:</strong> {job.upgradeMode}</p>
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
        <pre>{sessionDetails.flinkEvents}</pre>
      </section>
    </div>
  );
};

function FlinkSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sessionDetails, setSessionDetails] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

  useEffect(() => {
    fetchSessions();
  }, [BASE_URL]);

  const fetchSessions = () => {
    setLoading(true);
    setError(null);
    axios.get(`${BASE_URL}/api/flink-session`)
      .then(response => {
        const data = response.data?.sessions || [];
        if (Array.isArray(data)) {
          setSessions(data.map(name => ({
            name: name,
            href: `${BASE_URL}/api/flink-session?flinkSession=${encodeURIComponent(name)}`
          })));
        } else {
          setError("Invalid data format received from server");
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching sessions:", error);
        setError("Failed to load sessions. Please try again.");
        setLoading(false);
      });
  };

  const fetchSessionDetails = (session) => {
    setSelectedSession(session);
    setModalVisible(true);
    setSessionDetails(null);
    axios.get(session.href)
      .then(response => {
        setSessionDetails(response.data);
      })
      .catch(error => {
        console.error("Error fetching session details:", error);
        setSessionDetails(null);
      });
  };

  const closeModal = () => {
    setModalVisible(false);
    setSessionDetails(null);
  };

  if (loading) {
    return <div className="spinner-border text-primary" role="status"><span className="sr-only">Loading...</span></div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <button className="btn btn-link" onClick={fetchSessions}>Retry</button>
      </div>
    );
  }

  return (
    <div className="FlinkSessions">
      <h1>Flink Sessions</h1>
      <div className="row">
        {sessions.map((session, index) => (
          <div className="col-md-4" key={index}>
            <div className="card mb-3">
              <div className="card-body">
                <button
                  className="btn btn-primary"
                  onClick={() => fetchSessionDetails(session)}
                >
                  {session.name}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal className="custom-modal" show={modalVisible} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Session Details: {selectedSession?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FlinkSessionDetails sessionDetails={sessionDetails} />
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

export default FlinkSessions;
