import React, { useState, useEffect } from "react";
import axios from "axios";

function Clusters() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get the BASE_URL from environment variables
  const BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:3001"; // Fallback if not set

  useEffect(() => {
    axios.get(`${BASE_URL}/api/cluster`)
      .then(response => {
        const data = response.data['clusters'];
        console.log(data);
        setClusters(data.map(name => ({
          name: name,
          href: `${BASE_URL}/proxy/${encodeURIComponent(name)}`
        })));
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching clusters:", error);
        setLoading(false);
      });
  }, [BASE_URL]); // Add BASE_URL as a dependency

  if (loading) {
    return <div className="spinner-border text-primary" role="status"><span className="sr-only">Loading...</span></div>;
  }

  return (
    <div className="Clusters">
      <h1>Flink Clusters</h1>
      <div className="row">
        {clusters.map((cluster, index) => (
          <div className="col-md-4" key={index}>
            <div className="card mb-3">
              <div className="card-body">
                <a href={cluster.href} className="btn btn-primary" target="_blank" rel="noopener noreferrer">{cluster.name}</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Clusters;
