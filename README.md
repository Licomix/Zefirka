<!-- PROJECT LOGO -->
<br />
<div style="text-align: center;">
  <h2>Zefirka</h2>
  <p align="center">
    <img src=".github/assets/shiro.png" alt="Shiro from Sewayaki Kitsune No Senko-San">
  </p>
  <p align="center">
    Zefirka is a powerful and user-friendly music bot for Discord, designed to bring your server's music experience to the next level. Built with Kazagumo and Shoukaku, Zefirka ensures high-quality audio playback and seamless integration.
    <br />
    <br />
    <a href="https://github.com/Licomix/Zefirka/issues">Report Bug</a>
    ·
    <a href="https://github.com/Licomix/Zefirka/issues">Request Feature</a>
  </p>
</div>


<!-- NOTICE -->
### <img src="https://cdn.discordapp.com/emojis/1055803759831294013.png" width="20px" height="20px"> 》Notice 

> Zefirka is a multipurpose Discord bot base in [Discord.js](https://github.com/Discordjs/discordjs)
If you like this repository, feel free to leave a star ⭐ to motivate me improve!


[![Readme Card](https://github-readme-stats.vercel.app/api/pin/?username=Licomix&repo=Zefirka&theme=tokyonight)](https://github.com/Licomix/Zefirka)
## <img src="https://cdn.discordapp.com/emojis/852881450667081728.gif" width="20px" height="20px">》Features
- [x] Slash Commands 
- [x] Music Commands
- [x] Easy to use
- [x] Customizable
- [x] Supports many music services
- [x] Fast as flash

<!-- REQUIREMENTS -->
## <img src="https://cdn.discordapp.com/emojis/1009754836314628146.gif" width="25px" height="25px">》Requirements
- NodeJS v17+
- Java v13+ for lavalink server.
- Discord Token. Get it from [Discord Developers Portal](https://discord.com/developers/applications)
- ClientID `for loading slash commands.` [Discord Developers Portal](https://discord.com/developers/applications)
- Spotify client ID `for Spotify support` [Click here to get](https://developer.spotify.com/dashboard/login)
- Spotify client Secret `for Spotify support` [Click here to get](https://developer.spotify.com/dashboard/login)
- Apple Music API Token `for Apple Music support`
- Deezer Decryption Key `for Deezer support`
- Yandex Music Access Token `for Yandex Music support`

<!-- INSTALLATION GUIDE -->
## <img src="https://cdn.discordapp.com/emojis/814216203466965052.png" width="25px" height="25px">》Installation Guide

### <img src="https://cdn.discordapp.com/emojis/1028680849195020308.png" width="15px" height="15px"> Installing via [Docker](https://www.docker.com/) (Recommended)
[Install Docker on your system](https://www.docker.com/get-started/)  <br>
Clone the repo by running
```bash
git clone https://github.com/Licomix/Zefirka.git
```
### <img src="https://cdn.discordapp.com/emojis/1028680849195020308.png" width="15px" height="15px"> Configuration
- Fill your lavalink info in `config/lavalink.ts` (only if you have your own lavalink)<br>
- Change basic bot configurations in `config/playback.ts` (optional)
- Fill your tokens in `applitication.yml`
### <img src="https://cdn.discordapp.com/emojis/1028680849195020308.png" width="15px" height="15px"> Start bot
For start bot just use:
```bash
docker compose up -d
```
### or
if you use your lavalink server:
```bash
npm install
npm run build
```
And start bot:
```bash
npm run start
```
<!-- SUPPORT SERVER -->
## <img src="https://cdn.discordapp.com/emojis/1036083490292244493.png" width="15px" height="15px">》Support Server
[![DiscordBanner](https://invidget.switchblade.xyz/77keb7smna)](https://discord.gg/77keb7smna)

[Support Server](https://discord.gg/77keb7smna) - Zefirka's Support Server Invite
