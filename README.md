# Flink-Platform
A platform around official flink k8s operator for more funcationality

## Progress
- Overall observability on pods ,flink clusters and flink sessions.  

## Features to cover
- Development Environment
    - Need both Flink SQL and PyFlink Env
- Scheduling Flink Jobs
- Cluster Management and observability
- Job Observability
- Failure alerting 

## Installation Setups
Official Flink k8s Operator

[Documentation](https://nightlies.apache.org/flink/flink-kubernetes-operator-docs-main/)

[Installation Guide](https://nightlies.apache.org/flink/flink-kubernetes-operator-docs-main/docs/development/guide/#installing-the-operator-locally)   **Already included in helmfile    

### Pre-requistes 
- k8s cluster
- [install helmfile](https://github.com/helmfile/helmfile) 

Use the make file to build images and deploy all the required dependencies and service in kubernetes.

<video width="640" height="360" controls>
  <source src="./assets/make.mov" type="video/quicktime">
  Your browser does not support the video tag.
</video>