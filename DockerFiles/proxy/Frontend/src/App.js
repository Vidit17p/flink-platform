import React from "react";
// import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Clusters from "./components/Clusters";
import Pods from "./components/Pods";
import FlinkDeployments from "./components/FlinkDeployments";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <a className="navbar-brand" href="/">Flink Dashboard</a>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/clusters">Clusters</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/pods">Pods</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/flink-deployments">Flink Deployments</Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className="container mt-4">
            <Routes>
                <Route path="/clusters" element={<Clusters />} />
                <Route path="/pods" element={<Pods />} />
                <Route path="/flink-deployments" element={<FlinkDeployments />} />
            </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
