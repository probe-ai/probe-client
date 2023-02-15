#!/bin/bash
git fetch origin main && git reset --hard origin/main
docker-compose build && docker-compose up -d --remove-orphans