# Legion

Angular Material client for Legendary, the self-hosted quiz-show server.

## Requirements

- Node **22.22.3** or newer compatible with Angular 22
- npm

## Local development

```bash
npm ci
npm start
```

The home screen connects to a Legendary server. The browser-only **Bộ biên tập** works without a server connection and keeps its drafts/media in the browser's private local storage until you export a `.legion` archive.

## Build

```bash
npm run build
```

The production browser bundle is emitted to `dist/Legion` and is intended to be hosted by Legendary.

## Automation and releases

- Pull requests and `main` pushes run a locked dependency install and production build. The project follows a build-only policy; CI does not run tests.
1. Update both `package.json` versions to the same SemVer and merge them to `main`.
2. Run **Legendary Release Tag**, then **Legion Release Tag**, with that version (for example `2.1.0`).
3. Run **Cut Legion Release** from Legion `main`. It builds both tagged projects, packages the self-hosted Legendary distribution, and publishes the generated notes and archive to the [Legion GitHub Releases](https://github.com/HuyenThoaiVuaHung/Legion/releases) page.

## License

GPLv3. See `LICENSE`.
