#!/bin/sh

# Fail on a single failed command in a pipeline (if supported)
(set -o | grep -q pipefail) && set -o pipefail

# Fail on error and undefined vars
set -eu

token='/var/run/secrets/kubernetes.io/serviceaccount/token'
if [ -r "${token}" ]
then
  export KUBEBOX_SA_TOKEN="$(cat ${token})"
else
  echo "Service account credential not found!"
fi

envsubst < 'nginx.tpl.js' > 'nginx.js'
if [ $? = 0 ]; then
  echo Starting NGINX...
  nginx -g 'daemon off;'
else
  exit 1
fi