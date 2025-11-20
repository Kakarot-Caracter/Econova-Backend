#!/bin/sh

npx prisma migrate deploy

npx prisma generate

npx prisma migrate dev --name init

exec "$@"
