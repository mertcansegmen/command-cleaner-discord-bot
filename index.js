const {
  Client,
  GatewayIntentBits,
} = require("discord.js");
require('dotenv').config()
const utils = require("./utils.js");
const db = require("./db.js");
const commandRegistration = require("./commandRegistration");
const commandHandler = require("./commandHandler");

const CLEAN_UP_DELAY_IN_MS = 20 * 1000;

const client = new Client({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
  ],
});

client.on('ready', async () => {
  console.log('Logged in as ' + client.user.tag);
});

client.on('guildCreate', async guild => {
  console.log("Joined to a guild. id: ", guild.id, " name: ", guild.name);
  console.log("Registering the commands for guild ", guild.name);

  await commandRegistration.registerCommands(client.user.id, guild.id, process.env.TOKEN);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand) {
    return;
  }

  switch (interaction.commandName) {
    case "ping":
      commandHandler.ping(interaction);
      break;
    case "command-channel-show":
      commandHandler.commandChannelShow(interaction);
      break;
    case "command-channel-set":
      commandHandler.commandChannelSet(interaction);
      break;
    case "command-channel-clear":
      commandHandler.commandChannelClear(interaction);
      break;
    case "user-tags-list":
      commandHandler.userTagsList(interaction);
      break;
    case "user-tags-add":
      commandHandler.userTagsAdd(interaction);
      break;
    case "user-tags-remove":
      commandHandler.userTagsRemove(interaction);
      break;
    default:
      break;
  }

})

client.on('messageCreate', async message => {
  const targetUserTags = await db.getTargetUserTags(message.guild.id);
  const commandChannelName = await db.getCommandChannel(message.guild.id);

  const noCleaningNeeded = !targetUserTags.includes(message.author.tag)
    || message.channel.name === commandChannelName

  if (noCleaningNeeded) {
    return;
  }

  console.log(`Will clean the message from ${message.author.tag}...`)

  // wait for the bots response, it could take a couple of seconds
  await utils.sleep(CLEAN_UP_DELAY_IN_MS);

  const targetChannel = client.channels.cache.find(c => c.name === commandChannelName);

  if (message.content?.length) {
    await message.delete();
    await targetChannel.send({ content: `Message from ${message.author}: ${message.content}` });
  }

  if (message.embeds?.length) {
    await message.delete();
    await targetChannel.send({
      content: `Message from ${message.author}: ${message.content}`,
      embeds: message.embeds
    });
  }
});

client.login(process.env.TOKEN);
