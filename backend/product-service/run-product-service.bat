@echo off
REM ============================================================================
REM Product Service Launcher
REM Runs Product Service on port 8082
REM ============================================================================

set JAVA_HOME=C:\Users\aari4343\.jdk\jdk-17.0.16
set MAVEN_HOME=C:\Users\aari4343\.maven\maven-3.9.14
set PATH=%MAVEN_HOME%\bin;%JAVA_HOME%\bin;%PATH%

cd /d "%~dp0"

echo.
echo ============================================================================
echo Product Service Launcher
echo ============================================================================
echo.
echo Java Home: %JAVA_HOME%
echo Maven Home: %MAVEN_HOME%
echo.
echo Starting Product Service on port 8082...
echo H2 Console: http://localhost:8082/h2-console
echo API Base URL: http://localhost:8082/api/products
echo.
echo ============================================================================
echo.

mvn spring-boot:run
