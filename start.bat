@echo off
rem Double-click to run the Kadens site locally on http://localhost:3200
chcp 65001 >nul
cd /d "%~dp0"

if not exist node_modules (
  echo Installing dependencies...
  call npm install
)
if not exist .env copy .env.example .env >nul
if not exist prisma\dev.db (
  echo Preparing the database...
  call npx prisma migrate deploy
  call npx prisma db seed
)
if not exist public\photos\hero.jpg (
  echo Preparing photos...
  call npm run photos
)

start "" http://localhost:3200
call npm run dev
