const { Client, GatewayIntentBits, Partials } = require("discord.js");
const keepAlive = require("./server.js");
const utils = require("./utils.js");

const TARGET_CHANNEL_NAME = 'bot-commands';
const USER_TAGS = ['Flow Music#6823', 'FredBoat♪♪#7284'];
const CLEAN_UP_DELAY_IN_MS = 10 * 1000;

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

client.on('messageCreate', async message => {
  const noCleaningNeeded = !USER_TAGS.includes(message.author.tag)
    || message.channel.name === TARGET_CHANNEL_NAME

  if (noCleaningNeeded) {
    return;
  }

  // wait for the bot to think
  await utils.sleep(CLEAN_UP_DELAY_IN_MS);

  const channel = client.channels.cache.find(c => c.name === TARGET_CHANNEL_NAME);

  if (message.content?.length) {
    await message.delete();
    await channel.send({ content: `Message from ${message.author}: ${content}` });
  }

  if (message.embeds?.length) {
    await message.delete();
    await channel.send({
      content: `Message from ${message.author}: ${content}`,
      embeds: message.embeds
    });
  }
});

keepAlive();
client.login(process.env['TOKEN']);
