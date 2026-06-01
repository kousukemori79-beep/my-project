# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current State

This repository is a fresh scaffold. As of this writing it contains only a `README.md`
(holding the project title `my-project`) and a single "Initial commit" — there is no
source code, build system, dependency manifest, test suite, or tooling configuration yet.

There are therefore no build, lint, or test commands to document at this time. As the
codebase grows, this file should be updated to capture:

- **Commands** for building, running, testing (including how to run a single test), and linting.
- **Architecture** — the big-picture structure and the relationships between components
  that span multiple files, so future instances can become productive quickly.
- **Conventions** — any non-obvious project-specific patterns worth following.

## Notes for the first substantial change

When the first real code lands (e.g. a language/framework is chosen and a dependency
manifest is added), revisit this file and replace this section with concrete commands and
architecture notes derived from the actual code.
