# Tap-to-Earn Game for Telegram

## Project Description
Develop a simple Tap-to-Earn game for Telegram that uses Web3 technology to reward players with cryptocurrencies. The game is inspired by Shahnameh, where players must help Sohrab complete the seven trials to reach Rostam.

## Project Goal
Create an engaging Telegram game that integrates blockchain technology to provide cryptocurrency rewards to players.

## Key Features
1. **Telegram Bot:** A bot that allows users to participate in the game by sending commands.
2. **Web3 Integration:** Connect to a smart contract on the Ethereum network to handle rewards.
3. **Game Mechanics:**
    - Players can "tap" to collect points and tokens.
    - Each time a player "taps," they receive a token.
    - The game follows the story from Shahnameh, where players must help Sohrab through seven trials.

## Technology and Tools
- **Telegram API:** To create and manage the bot.
- **Web3.js or web3.py:** To interact with the Ethereum blockchain.
- **Smart Contract (ERC-20):** A simple smart contract to manage tokens for rewards.

## Specifications
- **Telegram Bot Token:** *removed. A token was previously committed here, so it must be revoked with @BotFather. The replacement token lives only in the server environment (`BOT_TOKEN`) and must never be committed or given a `VITE_` prefix.*
- **Blockchain Provider:** Infura (or equivalent)

## Example Commands
- **/start:** Starts the game and registers the user.
- **/tap:** The player "taps" to collect points and tokens.
- **/score:** Shows the player's points and tokens.

## Development Requirements
1. **Set up the Telegram bot:** Configure and implement the bot to respond to commands.
2. **Web3 Integration:** Create and connect to a smart contract that can send tokens to players.
3. **Handle Transactions:** Ensure tokens are sent correctly and handle any errors.
4. **User Interface:** A simple and user-friendly interface in Telegram to engage players.

## Project Running Guide
See [Running the game](#running-the-game) below. (`run_pro.txt` was never added to the repository.)

## Deployment
The project is deployed/hosted on Netlify. You can access it via https://t.me/Arshian_Pahlevan_Bot/FalconTapGAme ( telegram game )

https://falcomtaptapgame.netlify.app/ ( web app )

## Branch
Used branch: `final-version`

## Seven Levels Description

The seven labors (or trials) of Rostam, known as "Haft Khan-e-Rostam" in Persian, are a series of heroic challenges that the legendary hero Rostam undergoes to rescue King Kay Kavus from the White Demon. Here is a brief summary of each of the seven chapters:

1. **First Labor: The Lion**
   - **Challenge:** Rostam fights and kills a ferocious lion.
   - **Symbolism:** Represents courage and physical strength.

2. **Second Labor: The Desert**
   - **Challenge:** Rostam crosses a perilous desert.
   - **Symbolism:** Endurance and resilience.

3. **Third Labor: The Dragon**
   - **Challenge:** Rostam encounters and defeats a mighty dragon.
   - **Symbolism:** Heroic prowess and determination.

4. **Fourth Labor: The Sorceress**
   - **Challenge:** Rostam meets a deceitful enchantress who tries to kill him, but he overcomes her tricks and kills her.
   - **Symbolism:** Wisdom and vigilance against deceit.

5. **Fifth Labor: The Demon**
   - **Challenge:** Rostam battles with a powerful demon and emerges victorious.
   - **Symbolism:** Strength and valor in the face of dark forces.

6. **Sixth Labor: The Simurgh**
   - **Challenge:** Rostam fights against the White Demon, with the help of the magical Simurgh, a mythical bird.
   - **Symbolism:** The alliance between man and mythical creatures, and the importance of allies.

7. **Seventh Labor: The Rescue**
   - **Challenge:** Rostam finally defeats the White Demon and rescues King Kay Kavus and his men.
   - **Symbolism:** The ultimate triumph of good over evil and the fulfillment of his quest.

These seven labors can serve as different levels or stages in the game, where players must overcome various challenges to progress through the story. Incorporating these elements will add depth and context to the gameplay, making it more engaging and educational.

## Screenshots
Here is the designed start screen for the game inspired by Shahnameh. The screen features a Persian-themed background with illustrations of Sohrab and Rostam, and includes a welcoming message along with a 'Start' button. I hope your designer is a creative one ;)

![image](https://github.com/akashch1512/host-/assets/138999370/e58ee03b-2673-4cf8-b6ad-e00adeddc91f)

## References
Consider these apps as inspiration for development:
- [App 1](https://t.me/hamster_kombat_Bot/start?startapp=kentId5629291605)
- App 2

## Backgrounds for the 7 Levels
Seven backgrounds for the seven levels will be provided upon request. Please ask Akash for these resources.

# Running the game

**Requirements:** Node.js 24 LTS (see `.nvmrc`; at least 22.18 is needed for `npm run simulate:economy`) and npm.

```bash
npm ci                    # install dependencies
npm run dev               # dev server at http://localhost:5173
npm run build             # type-check and build to dist/
npm run preview           # serve the production build
npm run lint              # ESLint, zero warnings allowed
npm test                  # unit tests (Vitest) for the game rules and save data
npm run simulate:economy  # 31-day economy simulation (see docs/economy.md)
```

In development, add `?debug` to the URL for a small debug panel that skips ahead to the next labor, adds coins, empties energy or simulates time away. It is never included in production builds.

## What works today

- **Tap loop:** each tap (mouse, finger or Space/Enter) scores once and spends 12 energy. Several fingers count as several taps. Energy regenerates at 10 per second, also while the game is closed.
- **Saving (guest mode):** progress is saved in the browser's `localStorage` under `falcon-tap:v1`. Bad or edited data is validated on load. Guest progress is never moved into a Telegram account.
- **Seven labors:** levels come from lifetime coins (1M to 1,300M), with a story chapter and educational facts for each labor (draft text in `src/content/shahnameh.ts`, pending review).
- **Boosts:** the energy limit can be raised 10 times with coins.
- **Mine:** Asia → Iran → Tehran cards from this README, with hourly profit and up to 3 hours of income while away. Regions, countries and cities without prices show as "Coming soon".
- **Layout:** full-screen on phones (safe areas respected), a centered phone-shaped frame on laptops.
- **Telegram:** inside Telegram the app expands, disables swipe-to-close, uses Telegram's back button, haptics and safe areas. It works the same in a normal browser.

**Not built yet:** the game server and accounts, the Telegram bot commands, Frens (invites), Earn (social tasks), token rewards and the 31-day season. The Frens and Earn tabs say so. See `Plan.md` for the roadmap.

## Project layout

```
shared/    pure game rules and every tunable number (economy.ts); used by the client and, later, the server
src/       React app: components/, screens/, game/ (store and saving), content/ (story), telegram.ts
scripts/   economy simulation
docs/      economy model and simulation results
```

**Secrets:** never put the bot token or any other secret in this repository, in client code or in a `VITE_` variable (Vite bundles those into the client). Server secrets will live only in the server's environment.

#new reqirment's
### Game Concept: Tap-to-Earn Based on Shahnameh

#### Overview
The game is a tap-to-earn style game where players progress through 7 levels inspired by the 7 labors of Rostam from Shahnameh. The player starts as a young warrior and progresses to become a wise old warrior, learning about Shahnameh along the way. The game is designed to be completed in 31 days.

#### Game Mechanics
- Tapping: Players tap to earn coins.
- Stamina: Players have a stamina limit that they can boost using coins.
- Inviting Friends: Players earn coins by inviting friends.
- Social Media: Players earn coins by following social media accounts.

#### Levels and Coins Required
1. Level 1: 1 million coins
2. Level 2: 10 million coins
3. Level 3: 200 million coins
4. Level 4: 300 million coins
5. Level 5: 500 million coins
6. Level 6: 800 million coins
7. Level 7: 1300 million coins

#### Time Allocation for Each Level
- Level 1: 1 day
- Level 2: 2 days
- Level 3: 6 days
- Level 4: 6 days
- Level 5: 6 days
- Level 6: 5 days
- Level 7: 5 days

#### Cards and Mining
- Regions: Players can unlock regions (Asia, Europe, Africa, Americas, Oceania).
- Countries: Each region has multiple countries (e.g., Iran, China, India, etc.).
- Cities: Each country has multiple cities (e.g., Tehran, Isfahan, etc.).
- Card Upgrades: Each city card can be upgraded to level 21.
- Earnings: Upgrading cards increases the hourly profit.

#### Example Cards
1. Regional Card: Asia
   - Cost: 1 million coins
   - Unlocks: Iran, China, India, Japan, South Korea

2. Country Card: Iran
   - Cost: 500,000 coins
   - Unlocks: Tehran, Isfahan, Shiraz, Mashhad, Tabriz

3. City Card: Tehran
   - Base Cost: 100,000 coins
   - Hourly Profit: Starts at 1,000 coins/hour
   - Upgrades: Each level increases profit by 10%
   - Max Level: 21

#### Design Elements
- Character Progression: From young warrior to wise old warrior.
- Level 1 Design: Character with a lion, traditional Persian background.
- Level 7 Design: Character as a wise warrior, battling the White Demon.

#### Visuals and UI
- Clean, minimal design inspired by Hamster Kombat.
- Vertical (portrait) layout.
- Buttons for boosting stamina, inviting friends, and social media follow at the bottom.
- Educational pop-ups about Shahnameh.

#### Technical Details
- Platform: Telegram bot with Web3 integration.
- Tools: React for front-end, Node.js for back-end.
- Package.json: Updated and compatible with Node.js v18.20.3 and npm v10.8.1.

### Next Steps
1. Implement Tapping Mechanics: Create the tap-to-earn functionality.
2. Stamina and Boosts: Develop the stamina system and boosting functionality.
3. Friend Invites and Social Media Integration: Implement coin rewards for social interactions.
4. Card System: Build the card purchasing and upgrading system.
5. UI/UX Design: Create a clean, minimal interface similar to Hamster Kombat.
6. Educational Content: Integrate educational elements about Shahnameh.

This should give your team a comprehensive overview of the game concept, mechanics, and design elements required to bring the game to life. If you need any additional details or further adjustments, please let me know!


## ☕ **Support My Journey! ✨**  

If you love my work, consider **buying me a coffee ☕**. Your support inspires creativity and keeps me going! 💛  

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=flat&logo=coffee&logoColor=black)](https://razorpay.me/@pycraftr)  

Every coffee counts! 🚀











