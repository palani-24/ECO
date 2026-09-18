$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$mvnPath = Join-Path $scriptDir "maven_bin\apache-maven-3.9.9\bin\mvn.cmd"
Write-Host "🍃 Starting EcoReward Spring Boot Microservice on port 8085..." -ForegroundColor Green
& $mvnPath spring-boot:run
