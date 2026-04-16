# Running the eCommerce Microservices

This guide explains how to run all 4 microservices for the eCommerce platform.

## Quick Start

### Option 1: Launch All Services at Once (Easiest)

**Using Maven** (auto-recompiles on code changes):
```bash
double-click: run-all-services.bat
```

**Using JAR files** (faster startup):
```bash
double-click: run-all-services-jar.bat
```

This will open 4 PowerShell windows, one for each service.

---

## Running Individual Services

### User Service (Port 8081)

**Option A: Using Maven**
```bash
cd backend\user-service
run-user-service.bat
REM or manually:
mvn spring-boot:run
```

**Option B: Using JAR**
```bash
cd backend\user-service
java -jar target/user-service-1.0.0.jar --server.port=8081
```

### Product Service (Port 8082)

**Option A: Using Maven**
```bash
cd backend\product-service
run-product-service.bat
REM or manually:
mvn spring-boot:run
```

**Option B: Using JAR**
```bash
cd backend\product-service
java -jar target/product-service-1.0.0.jar --server.port=8082
```

### Order Service (Port 8083)

**Option A: Using Maven**
```bash
cd backend\order-service
run-order-service.bat
REM or manually:
mvn spring-boot:run
```

**Option B: Using JAR**
```bash
cd backend\order-service
java -jar target/order-service-1.0.0.jar --server.port=8083
```

### Supply Management Service (Port 8084)

**Option A: Using Maven**
```bash
cd backend\supply-management-service
run-supply-service.bat
REM or manually:
mvn spring-boot:run
```

**Option B: Using JAR**
```bash
cd backend\supply-management-service
java -jar target/supply-management-service-1.0.0.jar --server.port=8084
```

---

## Scripts Provided

| Script | Location | Purpose |
|--------|----------|---------|
| `run-all-services.bat` | Project root | Launch all 4 services using Maven (with auto-compile) |
| `run-all-services-jar.bat` | Project root | Launch all 4 services using pre-built JAR files |
| `run-user-service.bat` | backend/user-service | Launch User Service only |
| `run-product-service.bat` | backend/product-service | Launch Product Service only |
| `run-order-service.bat` | backend/order-service | Launch Order Service only |
| `run-supply-service.bat` | backend/supply-management-service | Launch Supply Management Service only |

---

## Before Running Services

### 1. Build JAR Files (One Time Only)

If you haven't built the JAR files yet, run this from the project root:

```bash
REM Build all services
cd backend\user-service
mvn clean install

cd ..\product-service
mvn clean install

cd ..\order-service
mvn clean install

cd ..\supply-management-service
mvn clean install
```

Or use this PowerShell command:
```powershell
$env:PATH = "C:\Users\aari4343\.maven\maven-3.9.14\bin;C:\Users\aari4343\.jdk\jdk-17.0.16\bin;$env:PATH"
cd backend; foreach ($dir in 'user-service', 'product-service', 'order-service', 'supply-management-service') { cd $dir; mvn clean install; cd .. }
```

### 2. Add Maven & Java to System PATH (Optional but Recommended)

This allows you to run `mvn` command directly without the batch scripts.

**Steps**:
1. Press `Win + X` → select **System**
2. Click **Advanced system settings**
3. Click **Environment Variables...**
4. Under **System variables**, select **Path** → **Edit**
5. Click **New** and add these paths:
   - `C:\Users\aari4343\.maven\maven-3.9.14\bin`
   - `C:\Users\aari4343\.jdk\jdk-17.0.16\bin`
6. Click **OK** three times
7. **Restart PowerShell/CMD**

After adding to PATH, you can run:
```bash
mvn spring-boot:run
```

---

## Accessing Services

Once all services are running, you can access them:

### API Endpoints

| Service | Endpoint |
|---------|----------|
| User Service | http://localhost:8081/api/users |
| Product Service | http://localhost:8082/api/products |
| Order Service | http://localhost:8083/api/orders |
| Supply Management | http://localhost:8084/api/suppliers |

### H2 Database Consoles

Access the in-memory database consoles:

| Service | URL | Credentials |
|---------|-----|-------------|
| User Service | http://localhost:8081/h2-console | sa / (blank) |
| Product Service | http://localhost:8082/h2-console | sa / (blank) |
| Order Service | http://localhost:8083/h2-console | sa / (blank) |
| Supply Management | http://localhost:8084/h2-console | sa / (blank) |

**To access H2 console**:
1. Navigate to the URL above
2. Use JDBC URL from the service configuration (e.g., `jdbc:h2:mem:userdb`)
3. Keep Username as `sa`
4. Leave Password blank
5. Click "Connect"

### Frontend

The React frontend runs on: **http://localhost:3000**

### BFF (Backend for Frontend)

The Node.js BFF runs on: **http://localhost:3001**

---

## Stopping Services

### Stop Individual Service
- Click the PowerShell window running the service
- Press `Ctrl + C`

### Stop All Services
- Close all 4 PowerShell windows
- Or press `Ctrl + C` in each window

---

## Troubleshooting

### "mvn is not recognized"

**Solution 1: Use the batch scripts**
```bash
run-all-services.bat
```

**Solution 2: Add to PATH permanently** (see "Add Maven & Java to System PATH" above)

**Solution 3: Use JAR files instead**
```bash
run-all-services-jar.bat
```

### Port already in use

If a port is already in use, you can change it:

```bash
java -jar service-1.0.0.jar --server.port=9081
```

### Service fails to start

1. Make sure you've run `mvn clean install` in the service directory
2. Check that port is not in use: `netstat -ano | findstr :8081`
3. Review logs in the PowerShell window for error details
4. Ensure H2 database is not locked (close H2 console browser tab)

### "No such file or directory"

Make sure you're in the correct directory:
```bash
cd c:\Users\aari4343\Downloads\eCommerce-app\eCommerce-Application
```

---

## Service Startup Times

Expected startup time for each service:
- **Maven Mode**: 15-30 seconds (includes compilation)
- **JAR Mode**: 10-20 seconds (faster, no compilation)

Services are ready when you see:
```
Tomcat started on port(s): 808X (http) with context path ''
Started ServiceApplication in X.XXX seconds
```

---

## Development Workflow

### Using Maven (Recommended for Development)

Advantages:
- Code changes auto-compile and reload
- No need to rebuild JAR files
- Real-time development

```bash
# Make code changes
# Service automatically recompiles
# Test changes immediately
```

### Using JAR Files (For Testing/Production)

Advantages:
- Faster startup
- Consistent with production deployment
- Good for testing final builds

```bash
# Build once
mvn clean install

# Run from JAR multiple times
java -jar target/service-1.0.0.jar
```

---

## Next Steps

1. **Run all services using**: `run-all-services.bat`
2. **Test endpoints** using curl or Postman
3. **Check databases** using H2 console
4. **View logs** in the PowerShell windows
5. **Make code changes** and watch them auto-compile (Maven mode)

---

## Quick Reference

```bash
# Build all services
mvn clean install

# Run all services at once
run-all-services.bat

# Run one service
cd backend\user-service
mvn spring-boot:run

# Run from JAR
java -jar target/user-service-1.0.0.jar

# Clean all builds
mvn clean

# View help
mvn help:describe
```

---

**For more information**, see:
- [MICROSERVICES_GUIDE.md](backend/MICROSERVICES_GUIDE.md) - Complete API documentation
- [BUILD_VERIFICATION_REPORT.md](backend/BUILD_VERIFICATION_REPORT.md) - Build details
- [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) - Project status

---

**Last Updated**: April 2026  
**Status**: Ready to Run
