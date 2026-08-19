# Security Policy

## About Sikkanam

Sikkanam is an AI-powered travel planning and budgeting platform designed to help users plan affordable trips, initially focused on Tamil Nadu.

Security and responsible handling of user data are important parts of the project. This document explains the currently supported versions and how security vulnerabilities should be reported.

---

## Supported Versions

Security fixes are prioritized for the latest production version of Sikkanam.

| Version | Supported |
|---------|-----------|
| Latest production release | :white_check_mark: |
| Main branch | :white_check_mark: |
| Older releases | :x: |

Because Sikkanam is an actively evolving project, older versions may not receive security updates.

Users are encouraged to use the latest available version.

---

## Reporting a Vulnerability

If you discover a security vulnerability in Sikkanam, please report it privately rather than publicly disclosing the issue.

### Please report issues involving:

- Authentication or authorization bypasses
- Exposure of private user data
- Database access vulnerabilities
- API security issues
- Server-side vulnerabilities
- Cross-site scripting (XSS)
- Injection vulnerabilities
- Sensitive information exposure
- Insecure handling of authentication tokens
- Vulnerabilities that could allow unauthorized access to another user's data

### How to Report

Please report security vulnerabilities through GitHub's private security reporting mechanism for this repository, when available.

If private vulnerability reporting is unavailable, please contact the project maintainer directly through the GitHub repository and avoid posting sensitive vulnerability details in a public issue.

When reporting a vulnerability, please include:

1. A clear description of the vulnerability
2. The affected feature or component
3. Steps to reproduce the issue
4. The potential security impact
5. Screenshots, logs, or proof-of-concept information when safe to provide
6. Any suggested mitigation, if available

Please do not include passwords, API keys, authentication tokens, or other sensitive personal information in a report.

---

## Responsible Disclosure

Please allow reasonable time for the issue to be investigated and addressed before publicly disclosing the vulnerability.

Security researchers are encouraged to avoid:

- Accessing data belonging to other users
- Modifying or deleting user data
- Disrupting the availability of Sikkanam
- Performing denial-of-service attacks
- Social engineering attacks against users or project contributors
- Accessing credentials, tokens, or secrets that do not belong to them
- Testing against production systems in a way that may affect other users

If testing requires access to production functionality, please keep the testing minimal and limited to what is necessary to demonstrate the vulnerability.

---

## Data & Authentication

Sikkanam uses third-party services as part of its application architecture.

These currently include:

- **Firebase Authentication** for authentication and user sessions
- **Supabase / PostgreSQL** for structured application and itinerary data
- **MongoDB Atlas** for document-oriented data such as wishlist-related information
- **Vercel** for application hosting and serverless infrastructure

Access to these services is controlled through application credentials and environment variables.

Sensitive credentials must never be committed to this repository.

---

## Secrets Management

The following types of information must never be committed to the public repository:

- API keys
- Database credentials
- Firebase service credentials
- MongoDB connection strings
- Supabase service-role keys
- Authentication secrets
- Private tokens
- Environment files containing secrets

Environment-specific secrets should be stored using appropriate environment-variable or secret-management mechanisms.

If a secret is accidentally exposed:

1. Revoke or rotate the credential immediately.
2. Remove the exposed credential from the active configuration.
3. Review relevant logs and access activity where possible.
4. Update the affected deployment.
5. Avoid relying solely on deleting the secret from Git history.

---

## User Data

Sikkanam is designed to protect user-specific application data through authenticated access and backend authorization.

Users should only be able to access data that belongs to their authenticated account.

Security rules and authorization checks should be enforced at the backend/data-service level rather than relying solely on client-side restrictions.

---

## Third-Party Services

Sikkanam relies on external infrastructure and APIs.

Security issues originating entirely within a third-party service may need to be reported directly to the respective provider.

Examples include issues involving:

- Firebase
- Supabase
- MongoDB Atlas
- Vercel
- External APIs used by Sikkanam

However, if Sikkanam's implementation causes or exposes the vulnerability, please report it to the Sikkanam project as described above.

---

## AI & External APIs

Sikkanam uses AI and external APIs for parts of its travel-planning functionality.

Users should avoid intentionally submitting highly sensitive personal information that is not necessary for trip planning.

API credentials used by the application must remain server-side where required and must not be exposed through client-side code or public repositories.

---

## Security Best Practices for Contributors

Contributors should:

- Never commit secrets
- Use environment variables for credentials
- Validate user-controlled input
- Avoid trusting client-side authorization checks
- Apply proper authentication and authorization
- Keep dependencies reasonably up to date
- Review third-party packages before introducing them
- Avoid logging sensitive information
- Follow least-privilege principles
- Test security-sensitive changes before deployment

---

## Dependency Security

Sikkanam depends on third-party libraries and services.

Dependencies should be reviewed and updated periodically.

Known vulnerabilities in dependencies should be assessed based on whether the affected functionality is actually used by Sikkanam.

Security updates should be prioritized when they affect production functionality or user data.

---

## Scope

This security policy applies to the Sikkanam application and the code contained in this repository.

It does not automatically cover vulnerabilities in unrelated third-party services or infrastructure.

For vulnerabilities in third-party services, please follow the security reporting process provided by the respective service.

---

## Acknowledgements

We appreciate responsible security researchers and contributors who help make Sikkanam safer.

Security researchers who responsibly report valid vulnerabilities may be acknowledged in the project's security documentation, with their permission.

---

**Last Updated:** August 2026
