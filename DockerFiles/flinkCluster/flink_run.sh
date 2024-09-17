#!/bin/bash

# Function to check if Flink CLI is installed
function check_flink_installed {
  if ! command -v flink &> /dev/null; then
    echo "Flink CLI could not be found. Please ensure Flink is installed and the 'flink' command is in your PATH."
    exit 1
  fi
}

# Function to run a Flink job in daemon mode
function run_flink_job {
  local py_file=$1
  local py_file_path="/opt/flink/scripts/$py_file"

  if [[ -f "$py_file_path" ]]; then
    echo "Running Flink job for: $py_file_path"
    flink run -d -py "$py_file_path"
  else
    echo "File $py_file_path does not exist. Skipping..."
  fi
}

# Check if at least one argument (Python file) is provided
if [[ $# -eq 0 ]]; then
  echo "No Python files provided. Usage: $0 <file1.py> <file2.py> ... <fileN.py>"
  exit 1
fi

# Check if Flink CLI is installed
check_flink_installed

# Loop through all provided arguments (Python files) and run them as Flink jobs
for py_file in "$@"; do
  run_flink_job "$py_file"
done
