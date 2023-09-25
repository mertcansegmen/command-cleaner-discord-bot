const {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  ApplicationCommandOptionType
} = require("discord.js");
const keepAlive = require("./server.js");
const utils = require("./utils.js");
const db = require("./db.js");
const commandRegistration = require("./commandRegistration");


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

  await commandRegistration.registerCommands(client.user.id, guild.id, process.env['TOKEN']);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand) {
    return;
  }

  console.log(interaction.commandName)

  if (interaction.commandName === "ping") {
    interaction.reply("I'm alive!")
  } else if (interaction.commandName === "command-channel-show") {
    const guildId = interaction.guild.id;

    const commandChannel = await db.getCommandChannel(guildId);

    let reply = "";
    if (!commandChannel) {
      reply = "No command channel was set. Use command-channel-set command for setting a command channel."
    } else {
      reply = "Command channel: " + commandChannel;
    }

    interaction.reply(reply);
  } else if (interaction.commandName === "command-channel-set") {
    const guildId = interaction.guild.id;
    const commandChannelName = interaction.options.get("command-channel").value;

    await db.setCommandChannel(guildId, commandChannelName);

    interaction.reply("Set " + commandChannelName + " as the command channel.");
  } else if (interaction.commandName === "command-channel-clear") {
    const guildId = interaction.guild.id;

    await db.clearCommandChannel(guildId);

    interaction.reply("Cleared the set command channel.");
  } else if (interaction.commandName === "user-tags-list") {
    const guildId = interaction.guild.id;

    const userTags = await db.getTargetUserTags(guildId);

    let reply = "";
    if (!userTags.length) {
      reply = "No target user tag found. Use user-tags-add command for adding new target user tags."
    } else {
      reply = "Target user tags: " + userTags.join(", ") + ".";
    }

    interaction.reply(reply);
  } else if (interaction.commandName === "user-tags-add") {
    const userTag = interaction.options.get("user-tag").value;
    const guildId = interaction.guild.id;

    try {
      await db.addTargetUserTag(guildId, userTag);

      interaction.reply("Added " + userTag + " to the target list.");
    } catch (err) {
      interaction.reply(err.message)
    }
  } else if (interaction.commandName === "user-tags-remove") {
    const userTag = interaction.options.get("user-tag").value;
    const guildId = interaction.guild.id;

    try {
      await db.removeTargetUserTag(guildId, userTag);

      interaction.reply("Removed " + userTag + " from the target list.");
    } catch (err) {
      interaction.reply(err.message)
    }
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

keepAlive();
client.login(process.env['TOKEN']);
