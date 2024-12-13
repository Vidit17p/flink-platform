.PHONY: build deploy

# Default target
all: build deploy load_examples port_forward

# Build both frontend and backend Docker images
build:
	docker build -t frontend:latest ./source_code/Frontend
	docker build -t backend:latest ./source_code/Backend

# Deploy using Helm
deploy:
	cd helm_charts && helmfile apply

clean:
	kubectl delete -f helm_charts/Flink-Samples/FlinkDeployment.yaml -n flink
	kubectl delete -f helm_charts/Flink-Samples/FlinkSession.yaml -n flink
	helm uninstall minio -n flink
	helm uninstall proxy -n flink
	helm uninstall flink-kubernetes-operator -n flink

load_examples:
	kubectl apply -f helm_charts/Flink-Samples/FlinkDeployment.yaml -n flink
	kubectl apply -f helm_charts/Flink-Samples/FlinkSession.yaml -n flink

port_forward:
	kubectl port-forward svc/proxy-svc 8000:80 -n flink