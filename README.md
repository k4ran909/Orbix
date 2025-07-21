<h1 align="center">[Discord] - Orbix </h1>
<p align="center">
  <a href="https://github.com/k4ran909/Orbix/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-important">
  </a>
  <a href="https://github.com/k4ran909">
   <img alt="GitHub code size in bytes" src="https://img.shields.io/github/languages/code-size/k4ran909/Orbix">
  </a>
</p>

<p align="center">
  [Discord] SelfBot is a powerful, feature-rich Python script designed for Windows, Linux, and macOS. It offers a wide range of commands for automation, remote control, and interactive utilities.
</p>


---

## Features

<details>
  <summary>All Commands</summary>

`*orbix` - Show my social networks.  
`changeprefix <prefix>` - Change the bot's prefix.  
`shutdown` - Stop the selfbot.  
`*uptime` - Returns how long the selfbot has been running.  
`*remoteuser <@user>` - Authorize a user to execute commands remotely.  
`copycat ON|OFF <@user>` - Automatically reply with the same message whenever the mentioned user speaks.  
`*ping` - Returns the bot's latency.  
`*pingweb <url>` - Ping a website and return the HTTP status code (e.g., 200 if online).  
`*geoip <ip>` - Looks up the IP's location.  
`*tts <text>` - Converts text to speech and sends an audio file (.wav).  
`*qr <text>` - Generate a QR code from the provided text and send it as an image.  
`*hidemention <message>` - Hide messages inside other messages.  
`*edit <message>` - Move the position of the (edited) tag.  
`*reverse <message>` - Reverse the letters of a message.  
`*gentoken` - Generate an invalid but correctly patterned token.  
`*hypesquad <house>` - Change your HypeSquad badge.  
`*nitro` - Generate a fake Nitro code.  
`*whremove <webhook_url>` - Remove a webhook.  
`*purge <amount>` - Delete a specific number of messages.  
`clear` - Clear messages from a channel.  
`*cleardm <amount>` - Delete all DMs with a user.  
`*spam <amount> <message>` - Spams a message for a given amount of times.  
`*quickdelete <message>` - Send a message and delete it after 2 seconds.  
`*autoreply <ON|OFF>` - Enable or disable automatic replies.  
`*afk <ON/OFF>` - Enable or disable AFK mode. Sends a custom message when receiving a DM or being mentioned.  
`*fetchmembers` - Retrieve the list of all members in the server.  
`*dmall <message>` - Send a message to all members in the server.  
`firstmessage` - Get the link to the first message in the current channel.  
`sendall <message>` - Send a message to all channels in the server.  
`*guildicon` - Get the icon of the current server.  
`*usericon <@user>` - Get the profile picture of a user.  
`*guildbanner` - Get the banner of the current server.  
`*tokeninfo <token>` - Scrape info with a token.  
`*guildinfo` - Get information about the current server.  
`*guildrename <new_name>` - Rename the server.  
`playing <status>` - Set the bot's activity status as "Playing".  
`watching <status>` - Set the bot's activity status as "Watching".  
`stopactivity` - Reset the bot's activity status.  
`ascii <message>` - Convert a message to ASCII art.  
`*airplane` - Sends a 9/11 attack (warning: use responsibly).  
`*dick <@user>` - Show the "size" of a user's dick.  
`*minesweeper <width> <height>` - Play a game of Minesweeper with custom grid size.  
`*leetpeek <message>` - Speak like a hacker, replacing letters.  

</details>

---


## How To Setup/Install

1. **Update `config/config.json`**: Enter your bot token and preferred prefix.
2. **Installation**:
- **Automated**: Run `setup.bat`. Launch the new file created.

- **Manual**:
 ```bash
   git clone https://github.com/k4ran909/Orbix.git
   cd Orbix
   python -m pip install -r requirements.txt
   python main.py
  ```

- Create a virtual env in Linux:      
`virtualenv -p /usr/bin/python3 venv`
`. ./venv/bin/activate`
