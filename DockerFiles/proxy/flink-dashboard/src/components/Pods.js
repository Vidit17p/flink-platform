import React, { useState, useEffect } from "react";
import axios from "axios";

function Pods() {
  const [pods, setPods] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the BASE_URL from environment variables
  const BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:3001"; // Fallback if not set

  useEffect(() => {
    axios.get(`${BASE_URL}/api/pods`)
      .then(response => {
        const data = response.data['data'];
        
        // Handle different response formats
        if (typeof data === 'string') {
          // If data is a string, parse it
          const lines = data.split('\n').filter(line => line.trim() !== '');
          const headers = lines[0].split(/\s{2,}/); // Split by multiple spaces
          const rows = lines.slice(1).map(line => line.split(/\s{2,}/)); // Process rows
          setPods({ headers, rows });
        } else if (typeof data === 'object' && data !== null) {
          // Handle if data is an object (e.g., { data: ... })
          setPods(data);
        } else {
          console.warn('Unexpected response format:', data);
          setError("Unexpected response format.");
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching pods:", error);
        setError("Failed to load pods.");
        setLoading(false);
      });
  }, [BASE_URL]); // Add BASE_URL as a dependency

  if (loading) {
    return <div className="spinner-border text-primary" role="status"><span className="sr-only">Loading...</span></div>;
  }

  if (error) {
    return <div className="alert alert-danger" role="alert">{error}</div>;
  }

  if (!pods) {
    return <div>No pods data available.</div>;
  }

  return (
    <div className="Pods">
      <h1>Flink Pods</h1>
      <table className="table table-bordered">
        <thead>
          <tr>
            {pods.headers.map((header, index) => <th key={index}>{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {pods.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Pods;
