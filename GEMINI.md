# Project Instructions

## Git & GitHub Workflow
- **Automatic Sync:** After every successful code modification or bug fix, you MUST automatically push the changes to the GitHub repository.
- **Target Remote:** Use the `target` remote for all pushes.
- **Branch Strategy:** Push the current development branch to the `main` branch on the remote using `git push target <current-branch>:main --force` (unless otherwise directed).
- **Authentication:** Use the configured HTTPS URL with the Personal Access Token for authentication. Do NOT log or expose the token in commit messages or documentation.

## Development Standards
- **Sandbox Stability:** Ensure all generated components (especially `Testimonials.tsx`) have correctly escaped quotes to prevent build failures in the sandbox environment.
