# Command Cleaner Discord Bot

## Introduction

This README documentation provides an overview of the Command Cleaner, a Discord.js bot implemented in Node.js. The bot is designed to keep text channels clean by moving unwanted messages, particularly those from Discord bots, to a specific text channel. Below, you will find information about the bot's functionality, its setup, and how to extend it to suit your specific needs.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Database Structure](#database-structure)
  - [Command Channels](#command-channels)
  - [Target User Tags](#target-user-tags)
- [Notes](#notes)
- [TODOs](#todos)

## Prerequisites

Before setting up and running the Command Cleaner bot, ensure that you have the following prerequisites installed:

- Node.js and npm
- A Discord Bot Token (obtained by creating a bot on the Discord Developer Portal)

## Setup Instructions

To set up and run the Command Cleaner Discord.js bot, follow these steps:

1. Clone the repository to your local machine.

   ```shell
   git clone https://github.com/mertcansegmen/command-cleaner-discord-bot.git
   ```

1. Navigate to the project directory.

   ```shell
   cd command-cleaner-discord-bot
   ```

1. Install the required Node.js packages.

   ```shell
   npm i
   ```

1. Create a .env file in the project directory and add the following configuration.

   ```shell
   TOKEN="YOUR_DISCORD_BOT_TOKEN"
   DB_FOLDER_PATH="YOUR_DB_FOLDER_PATH"   // optional
   LOG_LEVEL="info"                       // optional
   ERROR_LOG_PATH=".logs\\app-error.log"  // optional
   INFO_LOG_PATH=".logs\\app-info.log"    // optional
   ```

   Replace YOUR_DISCORD_BOT_TOKEN with the token you obtained from the Discord Developer Portal and YOUR_DB_FOLDER_PATH with the path to the folder where you want to store your JSON database files.

1. Start the bot by running the following command.

   ```shell
   node index.js
   ```

At this point, Command Cleaner bot should now be up and running.

## Database Structure

The Command Cleaner bot utilizes a JSON file-based database to store information related to command channels and target user tags. Understanding the database structure is essential for customizing and extending the bot's functionality.

### Command Channels

The "command channels" document(table) stores information about the designated command channels for each guild (Discord server). Here's an example structure:

```json
[
  {
    "guildId": "730883139081339050",
    "name": "bot-commands"
  },
  {
    "guildId": "1076933533328752700",
    "name": "command-channel"
  }
]
```

Each entry in the "command channels" array corresponds to a guild and the associated command channel where the bot should move the commands into from other text channels.

- `guildId`: The unique identifier for the guild (Discord server).
- `name`: The name of the designated command channel for the guild.

### Target User Tags

The "target user tags" document(table) stores a list of Discord user tags that the bot monitors for automated actions. Here's an example structure:

```json
[
  {
    "guildId": "730883139081339050",
    "targetUserTags": [
      "FredBoat♪♪#7284",
      "FlowMusic#2351",
      "Command Cleaner#8139"
    ]
  },
  {
    "guildId": "1076933533328752700",
    "targetUserTags": ["FredBoat♪♪#7284"]
  }
]
```

- `guildId`: The unique identifier for the guild (Discord server).
- `targetUserTags`: An array of Discord user tags to be monitored by the bot for automated actions.

## Notes

- The word guild seen in the code and in the comments is basically referring to a discord server.

## TODOs

- add error handling with custom error objects
