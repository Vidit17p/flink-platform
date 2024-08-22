# flink-platform
A platform around official flink k8s operator for more funcationality

## Features to cover
- Development Environment
    - Need both Flink SQL and PyFlink Env
- Scheduling Flink Jobs
- Cluster Management and observability
- Job Observability
- Failure alerting 

## Installation Setups
1. Need to install Flink k8s operator and the required CRDs that come with it
    
    [Documentation](https://nightlies.apache.org/flink/flink-kubernetes-operator-docs-main/)

    [Installation Guide](https://nightlies.apache.org/flink/flink-kubernetes-operator-docs-main/docs/development/guide/#installing-the-operator-locally)

2. Build the following Docker images
