# Assignment 2: Static & Dynamic Application Security Testing (SAST & DAST)

## Overview
In this assignment, you will perform security testing on the RealWorld Conduit application using both Static Application Security Testing (SAST) and Dynamic Application Security Testing (DAST) tools. You'll learn to identify, analyze, and remediate security vulnerabilities.

## Learning Objectives
- Understand the difference between SAST and DAST
- Use industry-standard security testing tools (Snyk, SonarQube, OWASP ZAP)
- Identify common security vulnerabilities (OWASP Top 10)
- Analyze security findings and prioritize remediation
- Implement security fixes and verify improvements

---

## Part A: Static Application Security Testing (SAST)

### Prerequisites
- Both backend and frontend code accessible
- Docker installed (for SonarQube)
- npm/Node.js and Go installed

---

## Task 1: SAST with Snyk (50 points)

### 1.1 Setup Snyk

#### Installation
```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate (requires free Snyk account)
snyk auth
```

#### Create Snyk Account
1. Visit [https://snyk.io/](https://snyk.io/)
2. Sign up for a free account
3. Complete authentication in CLI

### 1.2 Backend Security Scan (Go)

#### Run Snyk on Backend
```bash
cd golang-gin-realworld-example-app

# Test for vulnerabilities
snyk test

# Test and generate JSON report
snyk test --json > snyk-backend-report.json

# Test for open source vulnerabilities
snyk test --all-projects

# Monitor project (uploads to Snyk dashboard)
snyk monitor
```

#### Analyze Findings

**Deliverable 1.2.1:** `snyk-backend-analysis.md`

Document the following:

1. **Vulnerability Summary**
   - Total number of vulnerabilities found
   - Breakdown by severity (Critical, High, Medium, Low)
   - List of affected dependencies

2. **Critical/High Severity Issues**
   - Detailed description of each critical/high issue
   - CVE numbers (if applicable)
   - Affected package and version
   - Vulnerability type (SQL Injection, XSS, etc.)
   - Exploit scenario
   - Recommended fix/upgrade path

3. **Dependency Analysis**
   - Direct vs transitive dependencies
   - Outdated dependencies
   - License issues (if any)

**Example Format:**
```markdown
## Vulnerability: SQL Injection in package X

- **Severity:** High
- **Package:** github.com/example/package
- **Version:** 1.2.3
- **CVE:** CVE-2023-12345
- **Description:** This package allows SQL injection through unsanitized input
- **Fix:** Upgrade to version 1.2.4
```

### 1.3 Frontend Security Scan (React)

#### Run Snyk on Frontend
```bash
cd react-redux-realworld-example-app

# Test for vulnerabilities
snyk test

# Generate JSON report
snyk test --json > snyk-frontend-report.json

# Test for code vulnerabilities (not just dependencies)
snyk code test

# Generate code analysis report
snyk code test --json > snyk-code-report.json

# Monitor project
snyk monitor
```

#### Analyze Findings

**Deliverable 1.3.1:** `snyk-frontend-analysis.md`

Document the following:

1. **Dependency Vulnerabilities**
   - Summary of vulnerable npm packages
   - Severity breakdown
   - Upgrade recommendations

2. **Code Vulnerabilities** (from `snyk code test`)
   - Security issues in your source code
   - XSS vulnerabilities
   - Hardcoded secrets
   - Insecure crypto usage
   - Other code-level issues

3. **React-Specific Issues**
   - Dangerous props (dangerouslySetInnerHTML)
   - Client-side security issues
   - Component security concerns

### 1.4 Remediation Plan

**Deliverable 1.4.1:** `snyk-remediation-plan.md`

Create a prioritized remediation plan:

1. **Critical Issues (Must Fix Immediately)**
   - List vulnerabilities with severity score > 7.0
   - Remediation steps
   - Estimated time to fix

2. **High Priority Issues**
   - Severity score 4.0-7.0
   - Remediation approach
   - Potential workarounds if upgrade not possible

3. **Medium/Low Priority Issues**
   - Document for future updates
   - Risk assessment

4. **Dependency Update Strategy**
   - Which packages to upgrade
   - Breaking changes to consider
   - Testing plan after upgrades

### 1.5 Implementation and Verification

**Required Actions:**
1. Fix at least 3 critical/high severity vulnerabilities
2. Update vulnerable dependencies
3. Run Snyk again to verify fixes
4. Document before/after comparison

**Deliverable 1.5.1:**
- Updated `package.json` / `go.mod` files
- `snyk-fixes-applied.md` documenting:
  - Issues fixed
  - Changes made
  - Before/after Snyk scan results
  - Screenshots of Snyk dashboard showing improvement

---

## Task 2: SAST with SonarQube (50 points)

### 2.1 Setup SonarQube

You are to setup Sonarqube via the cloud hosted method.

https://docs.sonarsource.com/sonarqube-cloud/getting-started/github

#### Analyze Results

**Deliverable 2.2.1:** `sonarqube-backend-analysis.md`

Document the following from SonarQube dashboard:

1. **Quality Gate Status**
   - Pass/Fail status
   - Conditions not met (if failed)

2. **Code Metrics**
   - Lines of code
   - Code duplications
   - Complexity (Cyclomatic Complexity)
   - Cognitive Complexity

3. **Issues by Category**
   - Bugs (count and breakdown)
   - Vulnerabilities (count and breakdown)
   - Code Smells (count and breakdown)
   - Security Hotspots

4. **Detailed Vulnerability Analysis**
   - Each security vulnerability found
   - OWASP category
   - CWE reference
   - Code location
   - Remediation guidance

5. **Code Quality Issues**
   - Maintainability rating
   - Reliability rating
   - Security rating
   - Technical debt estimation

**Screenshot Requirements:**
- Overall dashboard
- Issues list
- Security hotspots page
- Code coverage page

### 2.3 Frontend Analysis with SonarQube

#### Analyze Results

**Deliverable 2.3.1:** `sonarqube-frontend-analysis.md`

Document the following:

1. **Quality Gate Status**
2. **JavaScript/React Specific Issues**
   - React anti-patterns
   - JSX security issues
   - Console statements left in code
   - Unused variables/imports

3. **Security Vulnerabilities**
   - XSS vulnerabilities
   - Insecure randomness
   - Weak cryptography
   - Client-side security issues

4. **Code Smells**
   - Duplicated code blocks
   - Complex functions
   - Long parameter lists
   - Cognitive complexity hotspots

5. **Best Practices Violations**
   - Missing PropTypes/TypeScript types
   - Missing error handling
   - Component complexity

**Screenshot Requirements:**
- Overall dashboard
- Issues breakdown
- Security hotspots
- Code duplications

### 2.4 Security Hotspot Review

**Deliverable 2.4.1:** `security-hotspots-review.md`

For each security hotspot identified:

1. **Hotspot Description**
   - Location in code
   - OWASP category
   - Security impact

2. **Risk Assessment**
   - Is this a real vulnerability?
   - What's the exploit scenario?
   - Risk level (High/Medium/Low)

## Part B: Dynamic Application Security Testing (DAST)

## Task 3: DAST with OWASP ZAP (100 points)

### 3.1 Setup OWASP ZAP

#### Installation

**Option 1: Download Desktop App**
- Visit [https://www.zaproxy.org/download/](https://www.zaproxy.org/download/)
- Download for your OS
- Install and launch

**Option 2: Docker**
```bash
docker pull zaproxy/zap-stable
```

### 3.2 Prepare Application for Testing

#### Start Full Stack
```bash
# Terminal 1: Backend
cd golang-gin-realworld-example-app
go run hello.go

# Terminal 2: Frontend
cd react-redux-realworld-example-app
npm start
```

#### Create Test User
1. Navigate to `http://localhost:4100`
2. Register a test account: `security-test@example.com`
3. Create some sample articles
4. Document credentials for ZAP context

### 3.3 Passive Scan

#### Configure ZAP
1. Open OWASP ZAP
2. Select "Automated Scan"
3. URL: `http://localhost:4100`
4. Use traditional spider
5. Enable passive scan

#### Run Passive Scan
```bash
# Or use CLI
docker run -t zaproxy/zap-stable zap-baseline.py \
  -t http://localhost:4100 \
  -r zap-passive-report.html
```

**Deliverable 3.3.1:** `zap-passive-scan-analysis.md`

Document findings:

1. **Alerts Summary**
   - Total alerts
   - High/Medium/Low/Informational breakdown

2. **High Priority Findings**
   - Alert name
   - Risk level
   - URLs affected
   - Description
   - CWE/OWASP reference

3. **Common Issues Expected**
   - Missing security headers (CSP, X-Frame-Options, etc.)
   - Cookie security issues
   - Information disclosure
   - CORS misconfiguration

4. **Evidence**
   - Screenshots of findings
   - Export HTML report: `zap-passive-report.html`

### 3.4 Active Scan (Authenticated)

#### Configure Authentication Context

1. **Create Context in ZAP:**
   - Name: "Conduit Authenticated"
   - Include in context: `http://localhost:4100.*`
   - Include in context: `http://localhost:8080/api.*`

2. **Configure Authentication:**
   - Authentication method: JSON-based authentication
   - Login URL: `http://localhost:8080/api/users/login`
   - Login request body:
     ```json
     {
       "user": {
         "email": "security-test@example.com",
         "password": "SecurePass123!"
       }
     }
     ```
   - Extract token from response: `user.token`
   - Add to header: `Authorization: Token {token}`

3. **Configure User:**
   - Add user with test credentials
   - Enable user for context

4. **Configure Session Management:**
   - HTTP Authentication Header
   - Header name: `Authorization`
   - Header value pattern: `Token .*`

#### Run Active Scan
1. Spider with authenticated user
2. Run active scan on spidered URLs
3. Set scan policy to "OWASP Top 10"
4. Configure scan intensity (start with Medium)

**Warning:** Active scanning can take 30+ minutes. Start with fewer scan rules if needed.

**Deliverable 3.4.1:** `zap-active-scan-analysis.md`

Document findings:

1. **Vulnerability Summary**
   - Total vulnerabilities found
   - OWASP Top 10 mapping
   - Risk distribution

2. **Critical/High Severity Vulnerabilities**

   For each vulnerability:
   - **Vulnerability Name**
   - **Risk:** High/Critical
   - **URLs Affected:** List all endpoints
   - **CWE:** CWE number and description
   - **OWASP Category:** (e.g., A1:2017-Injection)
   - **Description:** What is the vulnerability?
   - **Attack Details:** How was it exploited?
   - **Evidence:** Request/response showing exploit
   - **Impact:** What could an attacker do?
   - **Remediation:** How to fix it?

3. **Expected Findings**

   Common issues to look for:
   - SQL Injection
   - Cross-Site Scripting (XSS)
   - Security Misconfiguration
   - Sensitive Data Exposure
   - Broken Authentication
   - Insecure Direct Object References
   - Missing Function Level Access Control
   - Cross-Site Request Forgery (CSRF)
   - Using Components with Known Vulnerabilities
   - Unvalidated Redirects

4. **API Security Issues**
   - Lack of rate limiting
   - Verbose error messages
   - Information disclosure
   - Authorization bypass
   - Mass assignment

5. **Frontend Security Issues**
   - XSS in article content
   - XSS in comments
   - DOM-based XSS
   - Insecure localStorage usage

**Export Reports:**
- HTML Report: `zap-active-report.html`
- XML Report: `zap-active-report.xml`
- JSON Report: `zap-active-report.json`

### 3.5 API Security Testing

#### Configure ZAP for API Testing

1. **Import OpenAPI/Swagger Spec** (if available) OR
2. **Manually test API endpoints:**

```
POST   /api/users                  # Register
POST   /api/users/login            # Login
GET    /api/user                   # Current user
PUT    /api/user                   # Update user
GET    /api/profiles/:username     # Get profile
POST   /api/profiles/:username/follow
GET    /api/articles               # List articles
POST   /api/articles               # Create article
GET    /api/articles/:slug         # Get article
PUT    /api/articles/:slug         # Update article
DELETE /api/articles/:slug         # Delete article
POST   /api/articles/:slug/favorite
DELETE /api/articles/:slug/favorite
GET    /api/articles/:slug/comments
POST   /api/articles/:slug/comments
DELETE /api/articles/:slug/comments/:id
GET    /api/tags
```

#### API-Specific Tests

Test for:
1. **Authentication Bypass**
   - Access protected endpoints without token
   - Use expired/invalid tokens
   - Token manipulation

2. **Authorization Flaws**
   - Access other users' articles
   - Modify/delete resources owned by others
   - Privilege escalation

3. **Input Validation**
   - SQL injection in parameters
   - XSS in article/comment content
   - XXE in request bodies
   - Command injection

4. **Rate Limiting**
   - Brute force login attempts
   - Mass article creation
   - Resource exhaustion

5. **Information Disclosure**
   - Verbose error messages
   - Stack traces
   - Debug information

**Deliverable 3.5.1:** `zap-api-security-analysis.md`

Document API-specific findings with:
- Endpoint URL and method
- Vulnerability description
- Proof of concept request/response
- Risk assessment



### 3.7 Security Headers Implementation

Implement the following security headers:

#### Backend (Go)
```go
// Add to hello.go
router.Use(func(c *gin.Context) {
    c.Header("X-Frame-Options", "DENY")
    c.Header("X-Content-Type-Options", "nosniff")
    c.Header("X-XSS-Protection", "1; mode=block")
    c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    c.Header("Content-Security-Policy", "default-src 'self'")
    c.Next()
})
```

#### Frontend
Configure security headers in build/deployment configuration.

**Deliverable 3.7.1:**
- Code implementing security headers
- Screenshot of ZAP showing headers present
- `security-headers-analysis.md` explaining each header

### 3.8 Final Verification Scan

After implementing all fixes:

1. Run full ZAP scan again (passive + active)
2. Compare before/after results
3. Verify critical/high issues resolved
4. Document remaining issues with justification

**Deliverable 3.8.1:** `final-security-assessment.md`

Include:
- Before/after vulnerability counts
- Risk score improvement
- Outstanding issues and mitigation plan
- Screenshots of final ZAP report
- Security posture assessment

---

## Submission Requirements

### What to Submit

1. **SAST Reports:**
   - `snyk-backend-analysis.md`
   - `snyk-frontend-analysis.md`
   - `snyk-remediation-plan.md`
   - `snyk-fixes-applied.md`
   - `snyk-backend-report.json`
   - `snyk-frontend-report.json`
   - `snyk-code-report.json`

2. **SonarQube Reports:**
   - `sonarqube-backend-analysis.md`
   - `sonarqube-frontend-analysis.md`
   - `security-hotspots-review.md`
   - `sonarqube-improvements.md`
   - Screenshots of dashboards

3. **DAST Reports:**
   - `zap-passive-scan-analysis.md`
   - `zap-active-scan-analysis.md`
   - `zap-api-security-analysis.md`
   - `zap-fixes-applied.md`
   - `security-headers-analysis.md`
   - `final-security-assessment.md`
   - All ZAP exported reports (HTML, XML, JSON)

4. **Code Changes:**
   - All files modified to fix security issues
   - Updated dependencies (`package.json`, `go.mod`)

5. **Summary Report:**
   - `ASSIGNMENT_2_REPORT.md` with:
     - Executive summary
     - Key findings across all tools
     - Remaining risks

### Grading Rubric

| Component | Points | Criteria |
|-----------|--------|----------|
| Snyk Backend Analysis | 8 | Thorough analysis, all vulnerabilities documented |
| Snyk Frontend Analysis | 8 | Code and dependency analysis complete |
| SonarQube Backend | 8 | Complete analysis of bugs, vulnerabilities, code smells |
| SonarQube Frontend | 8 | Quality and security issues identified |
| SonarQube Improvements | 10 | Code quality measurably improved |
| ZAP Passive Scan | 8 | Complete scan, findings documented |
| ZAP Active Scan | 15 | Authenticated scan, all vulnerabilities documented |
| ZAP API Testing | 10 | API-specific vulnerabilities identified |
| Security Fixes | 15 | Critical issues fixed and verified |
| Security Headers | 5 | All recommended headers implemented |
| Documentation | 5 | Clear, professional documentation and reporting |
| **Total** | **100** | |

### Common Pitfalls to Avoid

- Running scans without proper authentication
- Ignoring false positives without investigation
- Fixing symptoms instead of root causes
- Not testing fixes
- Upgrading dependencies without testing for breaking changes
- Applying fixes that break application functionality

### Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Snyk Documentation](https://docs.snyk.io/)
- [SonarQube Documentation](https://docs.sonarqube.org/)
- [OWASP ZAP Documentation](https://www.zaproxy.org/docs/)
- [CWE Database](https://cwe.mitre.org/)
- [Go Security Best Practices](https://go.dev/doc/security/best-practices)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

### Deadline
November 30, 2025, 11:59 PM

