# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language Settings

**重要**: このリポジトリで作業する際は、ユーザーへの応答は基本的に日本語で行ってください。ただし、コード、コマンド、技術用語は英語のままで構いません。

## Project Overview

This is a Docusaurus-based documentation website for 東北IT物産展 (Tohoku IT Product Exhibition) hands-on materials. The site is automatically deployed to GitHub Pages via GitHub Actions.

## Commands

### Development
```bash
cd website
npm install        # Install dependencies
npm start          # Start dev server at http://localhost:3000
```

### Build & Type Check
```bash
cd website
npm run build      # Build static site to website/build/
npm run typecheck  # Run TypeScript type checking
```

### Other Commands
```bash
cd website
npm run clear      # Clear Docusaurus cache
npm run serve      # Serve built site locally
```

## Architecture

- **Framework**: Docusaurus v3.8.1 with TypeScript support
- **Structure**: All website code is in the `website/` directory
- **Content**: 
  - Documentation pages in `website/docs/`
  - Blog posts in `website/blog/`
  - Custom React components in `website/src/components/`
  - Custom styles in `website/src/css/`
- **Configuration**: Main config in `website/docusaurus.config.ts`
- **Deployment**: GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically deploys to GitHub Pages on push to main branch
- **URL**: https://heptagon-inc.github.io/touhoku-it-2025-hands-on/

## Key Configuration Details

- Base URL: `/touhoku-it-2025-hands-on/`
- Default locale: `jp` (Japanese)
- Node.js requirement: >= 18.0
- Uses npm (not yarn, despite README mentioning yarn)