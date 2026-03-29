# SonarQube KT — ByteEats Project

> Static code analysis setup using SonarQube (self-hosted via Docker).
> Share this doc with anyone who needs to run code quality checks locally.

---

## What is SonarQube?

SonarQube scans your source code and reports:
- **Security Hotspots** — code patterns that may introduce vulnerabilities
- **Code Smells** — maintainability issues (dead code, bad patterns)
- **Bugs** — logic errors detected statically
- **Duplications** — copy-pasted code blocks
- **Coverage** — test coverage % (once tests are added)

---

## Prerequisites

Install these before anything else:

| Tool | Check command | Install |
|------|--------------|---------|
| Docker | `docker --version` | https://docs.docker.com/engine/install/ubuntu/ |
| Docker Compose | `docker compose version` | Bundled with Docker Desktop |
| Node.js 18+ | `node --version` | https://nodejs.org |
| npm | `npm --version` | Bundled with Node.js |

---

## One-Time Setup (Do this only once per machine)

### Step 1 — Clone the repo and install packages

```bash
git clone <repo-url>
cd byteeats_finall
npm ci
```

> `npm ci` installs exact versions from `package-lock.json`. Always use this instead of `npm install` on a fresh clone.

### Step 2 — Increase virtual memory for SonarQube (Linux only)

SonarQube uses Elasticsearch internally which requires higher VM limits.
Run this once (survives until reboot):

```bash
sudo sysctl -w vm.max_map_count=262144
```

To make it permanent across reboots:

```bash
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

> **Mac/Windows Docker Desktop users:** No action needed — Docker Desktop handles this automatically.

### Step 3 — Start SonarQube

```bash
npm run sonar:up
```

This starts two Docker containers:
- `sonarqube` — the SonarQube web app (port 9000)
- `sonardb` — PostgreSQL database used by SonarQube

Wait ~60-90 seconds for it to boot. You can check if it's ready:

```bash
curl -s http://localhost:9000/api/system/status
# You should see: {"status":"UP", ...}
```

Or just open http://localhost:9000 in your browser — wait until the login page appears.

### Step 4 — Login to SonarQube

Open http://localhost:9000

```
Username: admin
Password: ByteEats@Admin2024
```

### Step 5 — Run the analysis

```bash
npm run sonar
```

This scans all source files and uploads results to your local SonarQube.
Takes about 30-60 seconds.

### Step 6 — View results

Open http://localhost:9000/dashboard?id=byteeats

You'll see:
- Overall quality gate status
- Security hotspots
- Code smells and bugs
- Duplication %

---

## Daily Workflow (After First Setup)

### Question: Do I need to start Docker every time?

**Yes — but only if your machine was restarted.**

Docker containers stop when your machine shuts down. Here's the decision flow:

```
Machine just restarted?
  YES → npm run sonar:up   (wait 60-90s)  → npm run sonar
  NO  → check if running   → npm run sonar
```

Check if containers are already running:

```bash
docker ps --filter "name=sonarqube" --filter "name=sonardb"
```

If you see both containers with `Up` status — skip `sonar:up` and go straight to `npm run sonar`.

### Cheat sheet for every day

```bash
# 1. Start SonarQube (only if not running / after reboot)
npm run sonar:up

# 2. Make your code changes...

# 3. Run analysis
npm run sonar

# 4. View results
#    http://localhost:9000/dashboard?id=byteeats

# 5. Stop SonarQube when done for the day (optional — saves RAM)
npm run sonar:down
```

---

## Project Files Reference

| File | Purpose |
|------|---------|
| `docker-compose.sonar.yml` | Defines SonarQube + PostgreSQL containers |
| `sonar-project.properties` | SonarQube project config (key, sources, exclusions, token) |
| `package.json` scripts | `sonar`, `sonar:up`, `sonar:down` shortcuts |

### sonar-project.properties explained

```properties
sonar.projectKey=byteeats          # Unique ID in SonarQube
sonar.projectName=ByteEats...      # Display name
sonar.sources=.                    # Scan from root
sonar.language=js                  # JavaScript project
sonar.exclusions=node_modules/**,  # Don't scan these folders
  uploads/**,logs/**,...

sonar.host.url=http://localhost:9000        # Local SonarQube
sonar.token=sqa_5dda0a...                  # Auth token (pre-configured)
```

---

## Troubleshooting

### SonarQube takes too long to start / stays on STARTING

```bash
# Check container logs
docker logs sonarqube --tail 50

# Most common fix on Linux — increase vm.max_map_count
sudo sysctl -w vm.max_map_count=262144
docker compose -f docker-compose.sonar.yml restart
```

### Port 9000 already in use

```bash
# Find what's using port 9000
sudo lsof -i :9000

# Or change the port in docker-compose.sonar.yml
# Change "9000:9000" to "9001:9000" and access via localhost:9001
```

### `npm run sonar` points to sonarcloud.io instead of localhost

Make sure `sonar-project.properties` has these lines uncommented:
```properties
sonar.host.url=http://localhost:9000
sonar.token=sqa_5dda0a3412e46cfc6105c87ff7bf083b51a2e4f2
```

### Container conflict on `sonar:up`

```bash
# Remove stale containers and restart
docker rm -f sonarqube sonardb
npm run sonar:up
```

### Data persists between runs?

**Yes.** SonarQube uses Docker named volumes (`sonarqube_data`, `sonardb_data`).
Your analysis history, config, and settings survive container restarts.

To fully wipe and start fresh:
```bash
npm run sonar:down
docker volume rm byteeats_finall_sonarqube_data byteeats_finall_sonarqube_extensions byteeats_finall_sonarqube_logs byteeats_finall_sonardb_data
npm run sonar:up
```

---

## Current Issues Found (First Scan)

Here's what SonarQube found in the ByteEats codebase as a starting baseline:

### Security Hotspots (14)

| Severity | File | Issue |
|----------|------|-------|
| HIGH | `controllers/user/authController.js` (×6) | Potentially hard-coded password strings |
| HIGH | `controllers/admin/userController.js:90` | Potentially hard-coded password |
| MEDIUM | `controllers/user/authController.js:245,288,413` | Weak PRNG (`Math.random()`) used for OTP |
| MEDIUM | `services/upload.js:20` | File upload size limit not enforced (DoS risk) |
| LOW | `config/session.js:14` | Session cookie missing `secure: true` flag |
| LOW | `services/mailService.js:4` | HTTP instead of HTTPS |
| LOW | `index.js:15` | Express version disclosure (`X-Powered-By` header) |

### Code Smells (45 total — top ones)

| Severity | File | Issue |
|----------|------|-------|
| MAJOR | `controllers/admin/userController.js` | Multiple blocks of commented-out code |
| MAJOR | `controllers/admin/foodItemController.js` | Commented-out code |
| MAJOR | `controllers/user/googleAuthController.js:28,55` | Useless variable assignments |
| MAJOR | `controllers/user/authController.js:227` | Use optional chaining (`?.`) |
| MAJOR | `index.js:54` | Prefer top-level `await` over `.then()` chain |
| MINOR | `config/logger.js:3` | Use `node:fs` instead of `fs` |

---

## Adding Tests + Coverage (Next Step)

Currently coverage shows 0% because there are no tests. When tests are added:

1. Install Jest: `npm install --save-dev jest`
2. Configure coverage output: add `--coverage` to test script
3. Uncomment in `sonar-project.properties`:
   ```properties
   sonar.tests=tests
   sonar.javascript.lcov.reportPaths=coverage/lcov.info
   ```
4. Run tests before scan: `npm test && npm run sonar`

---

## Quick Reference Card

```
START SONARQUBE    →  npm run sonar:up
RUN ANALYSIS       →  npm run sonar
VIEW DASHBOARD     →  http://localhost:9000/dashboard?id=byteeats
LOGIN              →  admin / ByteEats@Admin2024
STOP SONARQUBE     →  npm run sonar:down
```
