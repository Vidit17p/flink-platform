import React, { useState, useEffect } from "react";
import axios from "axios";
import { Spinner, Alert, Table, Card } from "react-bootstrap"; // Import Bootstrap components

function Pods() {
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:3001";

  useEffect(() => {
    axios.get(`${BASE_URL}/api/pods`)
      .then(response => {
        const data = response.data.pods;
        if (Array.isArray(data)) {
          setPods(data);
        } else {
          console.warn('Unexpected response format:', data);
          setError("Unexpected response format.");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching pods:", err);
        setError("Failed to load pods.");
        setLoading(false);
      });
  }, [BASE_URL]);

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" variant="primary" />
        <p>Loading pods...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        {error}
      </Alert>
    );
  }

  if (pods.length === 0) {
    return <div className="text-center">No pods data available.</div>;
  }

  return (
    <Card className="Pods">
      <Card.Header as="h5">Flink Pods</Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Age</th>
              <th colSpan="2">Resource Requests</th>
              <th>Number of Restarts</th>
              <th>Age Since Last Restart</th>
            </tr>
            <tr>
              <th></th>
              <th></th>
              <th></th>
              <th>CPU</th>
              <th>Memory</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pods.map((pod, index) => (
              <tr key={index} className="pod-row">
                <td>{pod.name}</td>
                <td>{pod.status}</td>
                <td>{pod.age}</td>
                <td>{pod.resources.requests.cpu}</td>
                <td>{pod.resources.requests.memory}</td>
                <td>{pod.num_restarts}</td>
                <td>{pod.ageSinceLastRestart}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default Pods;
