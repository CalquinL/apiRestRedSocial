@echo off
set "MONGO_BIN=C:\Program Files\MongoDB\Server\8.3\bin"
set "DB_PATH=C:\data\db"

if not exist "%DB_PATH%" mkdir "%DB_PATH%"

start "MongoDB" /D "%MONGO_BIN%" cmd /k .\mongod.exe --dbpath "%DB_PATH%"