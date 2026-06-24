# Quick Note Sticky Board

A cross-platform desktop sticky notes app built with Electron. Create, color, drag, and organize your notes on a visual board.

## Features

- **Drag & Drop** -- Move notes anywhere on the board
- **Resize Notes** -- Drag the corner to resize
- **30 Preset Colors** -- Quick-select from a curated palette
- **Custom Color Picker** -- Pick any color with the native color wheel
- **Color Mixer** -- Blend two colors together with a slider
- **HSL Sliders** -- Fine-tune Hue, Saturation, and Lightness
- **Save Custom Colors** -- Save your favorite colors for quick access
- **Per-Note Colors** -- Change each note's color individually
- **Persistent Storage** -- Notes and settings saved in local storage
- **Keyboard Shortcuts** -- `Ctrl+N` to create a new note

## Install

```bash
npm install
```

## Run

```bash
npm start
```

## Build

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux

# All platforms
npm run build:all
```

Builds output to the `dist/` folder.

## Tech Stack

- Electron
- Vanilla HTML/CSS/JS
- No frameworks, no build tools

## License

MIT
