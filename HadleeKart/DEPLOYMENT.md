# HadleeKart Deployment Guide

## Quick Start (Development)

```bash
cd HadleeKart
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Production Build

### 1. Build the Project

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### 2. Preview Production Build Locally

```bash
npm run preview
```

Opens the production build at http://localhost:4173

### 3. Deploy to Static Hosting

The `dist/` directory contains everything needed to deploy:

```
dist/
├── index.html
└── assets/
    ├── index-[hash].js      (582KB - minified game code)
    └── index-[hash].js.map  (3.2MB - source maps)
```

## Deployment Options

### GitHub Pages

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy `dist/` folder to `gh-pages` branch:
   ```bash
   npx gh-pages -d dist
   ```

3. Enable GitHub Pages in repository settings

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Node version: 18+

Drop the `dist` folder into Netlify or connect your GitHub repo.

### Vercel

1. Import GitHub repository
2. Framework: Vite
3. Build command: `npm run build`
4. Output directory: `dist`

### Static Host (Any)

Simply upload the contents of `dist/` to any static web server:
- Apache
- Nginx  
- Amazon S3
- Cloudflare Pages
- Firebase Hosting
- etc.

## Requirements

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features
- WebGL 1.0
- ES2020 JavaScript
- localStorage API

## Performance Recommendations

### For Best Performance
1. Serve files with gzip/brotli compression (bundle reduces to ~151KB gzipped)
2. Set proper cache headers for assets
3. Use CDN for faster delivery
4. Enable HTTP/2

### Optimization
The build is already optimized with:
- Minified JavaScript (582KB)
- Tree-shaking to remove unused code
- Efficient bundling with Vite
- Source maps for debugging (can be removed in production)

### Remove Source Maps (Optional)
To reduce deployment size, delete `*.map` files:
```bash
rm dist/assets/*.map
```

This reduces deployed size from 3.8MB to ~600KB.

## Environment Configuration

No environment variables needed - game runs entirely client-side.

## Monitoring

The game logs to console:
- Initialization messages
- Audio events (stub)
- Errors (if any)

Monitor browser console for any issues.

## Troubleshooting

### Build Fails
- Ensure Node.js 18+ is installed
- Run `npm install` to install dependencies
- Check for TypeScript errors: `npx tsc --noEmit`

### Game Won't Load
- Check browser console for errors
- Verify WebGL is supported: about:gpu (Chrome)
- Clear browser cache
- Try different browser

### Poor Performance
- Lower shadow quality (code change in RaceScene.ts)
- Reduce pixel ratio (code change in GameEngine.ts)
- Close other tabs/applications
- Use hardware acceleration

## Security

The game runs entirely in the browser with no backend. Data is stored in localStorage only.

### localStorage Usage
- Game progress
- Unlocked tracks
- Story state

No personal data or analytics are collected.

## Updates

To update the deployed game:

1. Pull latest changes
2. Run `npm install` (if dependencies changed)
3. Run `npm run build`
4. Deploy new `dist/` folder

## License

MIT - See repository root for details

---

**The game is ready for deployment!** 🚀
