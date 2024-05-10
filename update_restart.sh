#!/bin/bash

cd "$(dirname "$0")"
echo "$(pwd)"

if [ ! -d "./temp" ]; then
    mkdir "./temp"
fi

if [ ! -d "./log" ]; then
    mkdir "./log"
fi

git pull

if [ -f "./temp/backend.pid" ]; then
    kill $(cat ./temp/backend.pid)
    rm -f ./temp/backend.pid
fi

if [ -f "./temp/frontend.pid" ]; then
    kill $(cat ./temp/frontend.pid)
    rm -f ./temp/frontend.pid
fi

sleep 5

cd backend
nohup node server.js > ../log/backend.log 2>&1 &
echo $! > ../temp/backend.pid

cd ../frontend
nohup npm run serve > ../log/frontend.log 2>&1 &
echo $! > ../temp/frontend.pid
