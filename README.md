# Crowd Device Farm

A community-powered test farm for running automated tests on real and virtual devices contributed by individuals.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Docker & Docker Compose (optional)

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd crowd-device-farm
   npm install
   ```

2. **Set up the database:**
   ```bash
   # Start PostgreSQL (using Docker)
   docker-compose up postgres -d
   
   # Run migrations
   npm run db:migrate
   ```

3. **Start the development environment:**
   ```bash
   # Start all services
   docker-compose up
   
   # Or start individually:
   npm run dev  # Starts both control-plane and node-agent
   ```

4. **Test the CLI:**
   ```bash
   # Build the CLI
   cd packages/cli
   npm run build
   
   # Test a command
   ./dist/index.js --help
   ```

## 📁 Project Structure

```
crowd-device-farm/
├── packages/
│   ├── control-plane/     # REST API server
│   ├── node-agent/        # Agent for device nodes
│   └── cli/              # Command-line interface
├── .github/workflows/    # CI/CD pipelines
└── docker-compose.yml    # Development environment
```

## 🔧 Architecture

### Control Plane
- **REST API** with endpoints for jobs, nodes, and artifacts
- **PostgreSQL** database with proper schema
- **Node.js/TypeScript** with Express.js
- **Docker** containerization

### Node Agent
- **Device registration** with the control plane
- **Heartbeat mechanism** for health monitoring
- **Platform detection** (Android focus initially)
- **Capability reporting** (emulators, devices, etc.)

### CLI Tool
- **Job submission** with file uploads
- **Status monitoring** for running tests
- **Node management** and visibility
- **Cross-platform** support

## 📡 API Endpoints

### Jobs
- `POST /api/v1/jobs` - Create a new test job
- `GET /api/v1/jobs/:id` - Get job status
- `GET /api/v1/jobs` - List jobs

### Nodes
- `POST /api/v1/nodes/register` - Register a new node
- `GET /api/v1/nodes/:id` - Get node information
- `POST /api/v1/nodes/:id/heartbeat` - Send heartbeat
- `GET /api/v1/nodes` - List available nodes

## 🎯 Week 1 Goals ✅

- [x] **Repo + CI/CD setup** - Monorepo with GitHub Actions
- [x] **Control Plane skeleton** - REST API with all required endpoints
- [x] **Database setup** - PostgreSQL with jobs, nodes, artifacts, users tables
- [x] **Node Agent skeleton** - Registration and heartbeat functionality
- [x] **CLI skeleton** - `decentest run` command with file upload support

## 🚀 Usage Examples

### Running Tests via CLI

```bash
# Basic Android test
decentest run --apk my-app.apk --tests my-tests.apk --platform android

# With custom configuration
decentest run \
  --apk my-app.apk \
  --tests my-tests.apk \
  --name "Smoke Tests" \
  --description "Basic functionality tests" \
  --timeout 600 \
  --platform android
```

### Checking Status

```bash
# Check system health
decentest status --health

# Check specific job
decentest status --job-id <job-id>

# List recent jobs
decentest status --list
```

### Node Management

```bash
# List all nodes
decentest nodes --list

# Filter by platform
decentest nodes --platform android

# Filter by status
decentest nodes --status online
```

## 🐳 Docker Development

```bash
# Start full development environment
docker-compose up

# Start specific services
docker-compose up postgres control-plane
docker-compose up node-agent

# View logs
docker-compose logs -f control-plane
docker-compose logs -f node-agent
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests for specific package
npm test --workspace=@crowd-farm/control-plane
npm test --workspace=@crowd-farm/node-agent
npm test --workspace=@crowd-farm/cli

# Run with coverage
npm run test:coverage
```

## 🔧 Configuration

### Control Plane Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crowd_farm_dev
DB_USER=postgres
DB_PASSWORD=postgres

# Server
PORT=3000
NODE_ENV=development
```

### Node Agent Environment Variables

```bash
# Control Plane
CONTROL_PLANE_URL=http://localhost:3000

# Node Identity
NODE_NAME=my-android-device
NODE_PLATFORM=android
NODE_OS_VERSION=13.0
NODE_ARCHITECTURE=x64

# Heartbeat
HEARTBEAT_INTERVAL=30000
```

## 📈 Next Steps (Week 2+)

- [ ] **Android Emulator Integration** - Real device/emulator management
- [ ] **Test Execution Engine** - Execute actual test suites
- [ ] **Artifact Management** - Test results, logs, screenshots
- [ ] **Authentication** - User management and security
- [ ] **iOS Support** - Xcode simulator integration
- [ ] **Web Dashboard** - UI for job management
- [ ] **Load Balancing** - Job distribution across nodes
- [ ] **Monitoring** - Metrics and alerting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

[Add your license here]

## 🆘 Support

- **Issues**: [GitHub Issues](link-to-issues)
- **Discussions**: [GitHub Discussions](link-to-discussions)
- **Documentation**: [Wiki](link-to-wiki)