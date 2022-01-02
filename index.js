const { Client, Intents } = require('discord.js');
const keepAlive = require("./server.js");
const utils = require("./utils.js");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const COMMAND_CHANNEL = "bot-commands";
const COMMAND_PREFIXES = ["#"];
const REPLY_DELETION_IN_MS = 5 * 1000;

client.on("ready", () => {
  console.log("Logged in as " + client.user.tag);
});

client.on("messageCreate", async message => {
  const isAuthorBot = message.author.bot;

  if(isAuthorBot) return;

  const isCommandChannel = message.channel.name === COMMAND_CHANNEL;
  const isMessageCommand = COMMAND_PREFIXES
    .some(pre => message.content.startsWith(pre));

  if(!isCommandChannel && isMessageCommand) {
    const reply = await message
      .reply("You can't post commands in this channel. Use bot-commands channel for that.");

    await utils.sleep(REPLY_DELETION_IN_MS);
    message.delete();
    reply.delete();
  }
  
  if(isCommandChannel && !isMessageCommand) {
    const reply = await message
      .reply("You can only post bot commands in this channel.");

    await utils.sleep(REPLY_DELETION_IN_MS);
    message.delete();
    reply.delete();
  }
});

keepAlive();
client.login(process.env['TOKEN']);
