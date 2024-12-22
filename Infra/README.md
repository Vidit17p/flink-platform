# Installation Steps
## Install everything individually 
- Install flink k8s operator
- Proxy (Uses the same service account as flink k8s operator)

## Installing using Helmfile
### Installing Helmfile
- Install helmfile - https://github.com/helmfile/helmfile
- Install helm diff latest version
    ```
    helm plugin install https://github.com/databus23/helm-diff
    ```
- Run helmfile apply to install everything at once
