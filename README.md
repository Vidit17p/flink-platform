# flink-platform
A platform around official flink k8s operator for more funcationality

## Progress
- Observability around flink clusters
    - Pods status in flink namespace
    - Link to flink cluster dashboard by forwarding it to service using ngnix reverse proxy
    - List of Flink Deployments and Description of FlinkDep


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

1. Build the Proxy Docker images under /DockerFiles/proxy folder using the following command
    
    ```
    docker build -t proxy:latest ./DockerFiles/proxy
    ```

2. Lastly install all the required things using the following command under helm_charts directory
    
    ```
    helmfile apply
    ```