import React, { useState, useEffect } from "react";
import axios from "axios";

function FlinkDeployments() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:3001/flink-dep")
      .then(response => {
        const parser = new DOMParser();
        console.log('response')
        const data = response.data['deployments']
        setDeployments(data.map(name => ({
          name: name,
          href: `http://127.0.0.1:3001/flink-dep?clusterName=${encodeURIComponent(name)}`
        })));
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching deployments:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="spinner-border text-primary" role="status"><span className="sr-only">Loading...</span></div>;
  }

  return (
    <div className="FlinkDeployments">
      <h1>Flink Deployments</h1>
      <div className="row">
        {deployments.map((dep, index) => (
          <div className="col-md-4" key={index}>
            <div className="card mb-3">
              <div className="card-body">
                <a href={dep.href} className="btn btn-primary">{dep.name}</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FlinkDeployments;
