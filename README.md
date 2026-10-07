<div align="center">

<img src="src/images/falcon-coin.webp" alt="Falcon coin" width="120" />

# Falcon Tap

**Tap. Power up. Follow Rostam through the Seven Labors of the Shahnameh.**

A mobile-first, Hamster Kombat-style tap-to-earn game for Telegram, built with React and TypeScript.

[![Play in Telegram](https://img.shields.io/badge/Play_in-Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/Arshian_Pahlevan_Bot/FalconTapGAme)
[![Play in your browser](https://img.shields.io/badge/Play_in-Browser-F3B92C?style=for-the-badge&logo=googlechrome&logoColor=white)](https://falcomtaptapgame.netlify.app/)

![React](https://img.shields.io/badge/React_18-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/Tested_with-Vitest-6E9F18?logo=vitest&logoColor=white)

<br />

<img src="docs/screenshots/intro.jpg" width="23%" alt="Intro screen with Rostam and Sohrab" />
<img src="docs/screenshots/tap.jpg" width="23%" alt="Tap screen with the Falcon coin" />
<img src="docs/screenshots/mine.jpg" width="23%" alt="Mine screen with city cards" />
<img src="docs/screenshots/story.jpg" width="23%" alt="Story screen with the Seven Labors" />

</div>

## ✨ Features

| | |
|---|---|
| 👆 **Tap to earn** | Every tap, click or key press counts exactly once. Multi-touch works too. |
| ⚡ **Energy** | Refills over time, even while the game is closed. Raise the limit with Boosts. |
| 🏛️ **Seven Labors** | Seven levels from Ferdowsi's *Shahnameh*, each unlocking a story chapter. |
| ⛏️ **Mine** | Buy and upgrade region, country and city cards that earn coins every hour. |
| 💾 **Auto-save** | Progress is saved on your device and validated when it loads. |
| 📱 **Any screen** | Full-screen on phones, a phone-shaped frame on laptops, at home inside Telegram. |

<details>
<summary>🖥️ <b>See it on a laptop</b></summary>
<br />
<img src="docs/screenshots/desktop.jpg" alt="The game shown as a centered phone frame on a laptop screen" />
</details>

## 🚀 Run it locally

You need [Node.js 24](https://nodejs.org/) (see `.nvmrc`).

```bash
npm ci        # install
npm run dev   # play at http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run build` | Type-check and build for production |
| `npm test` | Run the unit tests |
| `npm run lint` | Check the code style |
| `npm run simulate:economy` | Simulate 31 days of play ([results](docs/economy.md)) |

> 💡 In development, add `?debug` to the URL for shortcuts such as skipping to the next labor.

## 🗂️ Project layout

```
shared/   game rules and every tunable number (economy.ts)
src/      the React app: screens, components, saving, story text, Telegram glue
scripts/  economy simulation
docs/     economy notes, original requirements, screenshots
```

## 🗺️ Roadmap

- [x] Tap, energy and auto-save
- [x] Seven Labors with story chapters
- [x] Energy boosts and mining cards
- [ ] Game server and Telegram bot (`/start`, `/tap`, `/score`)
- [ ] Invite friends and social tasks
- [ ] Full card catalog and art for each level
- [ ] Token rewards

The full plan is in [Plan.md](Plan.md), and the original brief is in [docs/requirements.md](docs/requirements.md).

## ☕ Support

If you like this project, consider **buying me a coffee**. Your support keeps me going! 💛

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=flat&logo=coffee&logoColor=black)](https://razorpay.me/@pycraftr)
