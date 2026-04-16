@echo off
REM ============================================================================
REM Order Service Launcher
REM Runs Order Service on port 8083
REM ============================================================================

set JAVA_HOME=C:\Users\aari4343\.jdk\jdk-17.0.16
set MAVEN_HOME=C:\Users\aari4343\.maven\maven-3.9.14
set PATH=%MAVEN_HOME%\bin;%JAVA_HOME%\bin;%PATH%

cd /d "%~dp0"

echo.
echo ============================================================================
echo Order Service Launcher
echo ============================================================================
echo.
echo Java Home: %JAVA_HOME%
echo Maven Home: %MAVEN_HOME%
echo.
echo Starting Order Service on port 8083...
echo H2 Console: http://localhost:8083/h2-console
echo API Base URL: http://localhost:8083/api/orders
echo.
echo ============================================================================
echo.

mvn spring-boot:run
