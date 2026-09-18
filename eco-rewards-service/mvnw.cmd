@echo off
set JAVA_HOME=C:\Program Files\Java\jdk-21
set MAVEN_HOME=%~dp0maven_bin\apache-maven-3.9.9
call "%MAVEN_HOME%\bin\mvn.cmd" %*
