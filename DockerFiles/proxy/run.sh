#!/bin/sh

# nginx config variable injection
envsubst < nginx-basic-auth.conf > /etc/nginx/conf.d/default.conf

# htpasswd for basic authentication
htpasswd -c -b /etc/nginx/.htpasswd $BASIC_USERNAME $BASIC_PASSWORD

# Start the frontend app
cd /frontend && npm start &

# Start the backend app
cd /backend && node app.js &


# Start nginx in the foreground
nginx -g "daemon off;"