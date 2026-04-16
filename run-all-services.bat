@echo off
REM ============================================================================
REM eCommerce Microservices - All Services Launcher
REM ============================================================================
REM This script launches all 4 microservices in separate PowerShell windows
REM Services: User (8081), Product (8082), Order (8083), Supply Management (8084)
REM ============================================================================

REM Set Java and Maven paths
set JAVA_HOME=C:\Users\aari4343\.jdk\jdk-17.0.16
set MAVEN_HOME=C:\Users\aari4343\.maven\maven-3.9.14
set PATH=%MAVEN_HOME%\bin;%JAVA_HOME%\bin;%PATH%

REM Colors for console output
echo.
echo ============================================================================
echo eCommerce Platform - Microservices Launcher
echo ============================================================================
echo.
echo Starting all 4 microservices...
echo.
echo User Service............ Port 8081 (H2: http://localhost:8081/h2-console)
echo Product Service......... Port 8082 (H2: http://localhost:8082/h2-console)
echo Order Service........... Port 8083 (H2: http://localhost:8083/h2-console)
echo Supply Management....... Port 8084 (H2: http://localhost:8084/h2-console)
echo.
echo Opening 4 PowerShell windows...
echo.

REM Get the project root directory
cd /d "%~dp0"

REM Launch User Service (Port 8081)
start "User Service (8081)" powershell -NoExit -Command "cd '%cd%\backend\user-service'; $env:PATH='%MAVEN_HOME%\bin;%JAVA_HOME%\bin;' + $env:PATH; Write-Host 'Starting User Service on port 8081...' -ForegroundColor Green; mvn spring-boot:run"

REM Wait 2 seconds before launching next service
timeout /t 2 /nobreak

REM Launch Product Service (Port 8082)
start "Product Service (8082)" powershell -NoExit -Command "cd '%cd%\backend\product-service'; $env:PATH='%MAVEN_HOME%\bin;%JAVA_HOME%\bin;' + $env:PATH; Write-Host 'Starting Product Service on port 8082...' -ForegroundColor Green; mvn spring-boot:run"

REM Wait 2 seconds before launching next service
timeout /t 2 /nobreak

REM Launch Order Service (Port 8083)
start "Order Service (8083)" powershell -NoExit -Command "cd '%cd%\backend\order-service'; $env:PATH='%MAVEN_HOME%\bin;%JAVA_HOME%\bin;' + $env:PATH; Write-Host 'Starting Order Service on port 8083...' -ForegroundColor Green; mvn spring-boot:run"

REM Wait 2 seconds before launching next service
timeout /t 2 /nobreak

REM Launch Supply Management Service (Port 8084)
start "Supply Management Service (8084)" powershell -NoExit -Command "cd '%cd%\backend\supply-management-service'; $env:PATH='%MAVEN_HOME%\bin;%JAVA_HOME%\bin;' + $env:PATH; Write-Host 'Starting Supply Management Service on port 8084...' -ForegroundColor Green; mvn spring-boot:run"

echo.
echo ============================================================================
echo All services are starting...
echo Check the 4 PowerShell windows for startup logs
echo Each service will be ready in approximately 15-30 seconds
echo.
echo API Endpoints:
echo   User Service:        http://localhost:8081/api/users
echo   Product Service:     http://localhost:8082/api/products
echo   Order Service:       http://localhost:8083/api/orders
echo   Supply Management:   http://localhost:8084/api/suppliers
echo.
echo H2 Database Consoles (username: sa, password: blank):
echo   User Service:        http://localhost:8081/h2-console
echo   Product Service:     http://localhost:8082/h2-console
echo   Order Service:       http://localhost:8083/h2-console
echo   Supply Management:   http://localhost:8084/h2-console
echo ============================================================================
echo.
echo Press any key to close this window...
pause
