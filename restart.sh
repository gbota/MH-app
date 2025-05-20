#!/bin/bash

# Stop any running backend
pkill -f server.js
sleep 1

# Start backend
cd server
nohup node server.js > ../server.log 2>&1 &
cd ..

# Stop any running frontend (react-scripts)
pkill -f react-scripts
sleep 1

# Start frontend
cd client
nohup npm start > ../client.log 2>&1 &
cd ..

echo "Backend and frontend restarted. Logs: server.log, client.log" 