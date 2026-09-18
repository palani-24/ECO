@echo off
title EcoReward Spring Boot Microservice
set JAVA_HOME=C:\Program Files\Java\jdk-21
set MAVEN_HOME=%~dp0maven_bin\apache-maven-3.9.9
echo Starting EcoReward Spring Boot Microservice on port 8085...
call "%MAVEN_HOME%\bin\mvn.cmd" spring-boot:run
pause
