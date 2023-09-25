const { Client, GatewayIntentBits, Partials } = require("discord.js");
const keepAlive = require("./server.js");
const utils = require("./utils.js");

const TARGET_CHANNEL_NAME = 'bot-commands';
const USER_TAGS = ['Flow Music#6823', 'FredBoat♪♪#7284'];
const CLEAN_UP_DELAY_IN_MS = 20 * 1000;

const client = new Client({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
  ],
});

client.on('ready', () => {
  console.log('Logged in as ' + client.user.tag);
});
client.on('guildCreate', async guild => {
  console.log("Joined to a guild. id: ", guild.id, " name: ", guild.name);
  console.log("Registering the commands for guild ", guild.name);

  await commandRegistration.registerCommands(client.user.id, guild.id, process.env['TOKEN']);
});

client.on('messageCreate', async message => {
  const noCleaningNeeded = !USER_TAGS.includes(message.author.tag)
    || message.channel.name === TARGET_CHANNEL_NAME

  if (noCleaningNeeded) {
    return;
  }

  console.log(`Will clean the message from ${message.author.tag}...`)

  // wait for the bots response, it could take a couple of seconds
  await utils.sleep(CLEAN_UP_DELAY_IN_MS);

  const targetChannel = client.channels.cache.find(c => c.name === TARGET_CHANNEL_NAME);

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

client.on('messageCreate', (message) => {
  if (message.content === '/test') {
    message.reply('Command received');
  }
});

keepAlive();
client.login(process.env['TOKEN']);
