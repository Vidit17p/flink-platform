import React, { useState, useEffect } from "react";
import axios from "axios";

function Clusters() {
	const [clusters, setClusters] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedCluster, setSelectedCluster] = useState(null);

	// Get the BASE_URL from environment variables
	const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001"; // Fallback if not set

	useEffect(() => {
		axios.get(`${BASE_URL}/api/cluster`)
			.then(response => {
				const data = response.data['clusters'];
				setClusters(data.map(name => ({
					name: name,
					href: `${BASE_URL}/proxy/${encodeURIComponent(name)}/`
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

	const handleClusterClick = (cluster) => {
		setSelectedCluster(cluster);
	};

	if (clusters.length === 0) {
		return (
			<div className="Clusters">
				<h1>Flink Clusters</h1>
				<div>No Flink clusters found in the namespace</div>
			</div>
		);
	}

	return (
		<div className="Clusters">
			<h1>Flink Clusters</h1>
			<div className="row">
				{clusters.map((cluster, index) => (
					<div className="col-md-4" key={index}>
						<div className="card mb-3">
							<div className="card-body">
								<button onClick={() => handleClusterClick(cluster)} className="btn btn-primary">{cluster.name}</button>
							</div>
						</div>
					</div>
				))}
			</div>
			{selectedCluster && (
				<div className="embedded-cluster">
					<h2>{selectedCluster.name}</h2>
					<iframe
						src={selectedCluster.href}
						title={selectedCluster.name}
						width="100%"
						height="90%"
						frameBorder="0"
						style={{
							minHeight: "80vh",
							maxWidth: "1200px",
							margin: "0 auto 2rem auto", // Added margin-bottom of 2rem
							display: "block"
						}}
					/>
				</div>
			)}
		</div>
	);
}

export default Clusters;
