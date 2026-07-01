# SECURITY INSTRUCTIONS FOR AI AGENT

## 1. System Boundaries & File Access
- You are only authorized to read and modify files inside the current workspace directory.
- DO NOT access system paths, global environments, or configuration directories (e.g., `~/*`, `/etc/*`).
- Never alter code within `node_modules/`, `.git/`, or built artifact distribution folders.

## 2. Secrets & Credential Protection
- NEVER hardcode API keys, passwords, bearer tokens, or private certificates into any source file.
- Always use environment variables for sensitive data. Reference them safely by name.
- If you generate any temporary configuration file containing private tokens, you must add it to `.gitignore` immediately.

## 3. Command Execution & Excessive Agency
- You must ask for explicit human confirmation before executing any commands that deploy code, alter production environments, or delete infrastructure resources.
- Do not download external assets or execute arbitrary networking scripts via `curl` or `wget` without prior approval.

## 4. Code Quality & Security Architecture
- Always sanitize data input. Use input verification layers before passing information to database queries or internal logic execution paths.
- Avoid using deprecated cryptographic standards or insecure random number generators.
- Implement robust error handling; do not leak verbose server error messages or stack traces back to client applications.