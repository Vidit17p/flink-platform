FROM nginx:1.25.3

# Install kubectl, apache2-utils, nodejs, and npm
RUN apt-get update -y && apt-get install -y apache2-utils nodejs npm && rm -rf /var/lib/apt/lists/*
RUN curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/arm64/kubectl && chmod +x kubectl && mv ./kubectl /usr/local/bin/kubectl

# Basic auth credentials ,placeholder overridden in k8s
ENV BASIC_USERNAME=username
ENV BASIC_PASSWORD=password

# Forward host and foward port as env variables
# google.com is used as a placeholder, to be replaced using environment variables
ENV FORWARD_WEB_HOST=google.com
ENV FORWARD_WEB_PORT=80
ENV FORWARD_API_HOST=google.com
ENV FORWARD_API_PORT=80

# Nginx config file
WORKDIR /
COPY nginx-basic-auth.conf nginx-basic-auth.conf
COPY service-lookup ./node-app

# Copy frontend and backend folders
COPY Frontend ./frontend
COPY Backend ./backend

# Install dependencies for frontend and backend
WORKDIR /frontend
RUN npm install

WORKDIR /backend
RUN npm install

# Return to root directory
WORKDIR /

# Startup script
COPY run.sh ./
RUN chmod 0755 ./run.sh
CMD [ "./run.sh" ]