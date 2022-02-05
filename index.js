const { Client, Intents } = require('discord.js');
const keepAlive = require("./server.js");
const utils = require("./utils.js");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const COMMAND_CHANNEL = "bot-command";
const COMMAND_PREFIXES = ["#", "="];
const CLEAN_UP_DELAY_IN_MS = 5 * 1000;

const COMMAND_IN_REGULAR_CHANNEL_MESSAGE = "You can't post commands in this channel. Use bot-commands channel for that.";
const NON_COMMAND_IN_COMMAND_CHANNEL_MESSAGE = "You can only post bot commands in this channel.";

client.on("ready", () => {
  console.log("Logged in as " + client.user.tag);
});

client.on("messageCreate", async message => {
  if(message.author.bot) return;

  const isCommandChannel = message.channel.name === COMMAND_CHANNEL;
  const isMessageCommand = COMMAND_PREFIXES
    .some(pre => message.content.startsWith(pre));

  if(!isCommandChannel && isMessageCommand) {
    handleCommandInRegularChannel(message);
  }
  
  if(isCommandChannel && !isMessageCommand) {
    handleNonCommandInCommandChannel(message);
  }
});

const handleCommandInRegularChannel = async (message) => {
  const reply = await message.reply(COMMAND_IN_REGULAR_CHANNEL_MESSAGE);
  
  await utils.sleep(CLEAN_UP_DELAY_IN_MS);

  const channel = message.channel;
  
  const commandChannel = message.guild.channels.cache.find(
    eachChannel => eachChannel.name === COMMAND_CHANNEL
  )

  channel.messages.cache.forEach(async channelMessage => {
    let isInitialMessageReply = false;

    if(channelMessage.type === "REPLY") {
      let repliedMessage = await channelMessage.fetchReference();
        if(message.id === repliedMessage.id) {
          isInitialMessageReply = true;
        }
    }

    const isMessageFromMe = channelMessage.author.id === client.user.id;
    const isInitialMessage = channelMessage.id === message.id;

    const willDelete = isInitialMessage || isInitialMessageReply || isMessageFromMe;
    const willRepost = !isMessageFromMe && (isInitialMessage || isInitialMessageReply);

    const isMessageDeleted = await !channel.messages.cache.get(channelMessage.id);

    if(!isMessageDeleted && willRepost) {
      await commandChannel.send(`${channelMessage.author.username}: ${channelMessage.content} \n`);
    }

    if(!isMessageDeleted && willDelete) {
      await channelMessage.delete();
    }
  });;
}

const handleNonCommandInCommandChannel = async (message) => {
  const reply = await message.reply(NON_COMMAND_IN_COMMAND_CHANNEL_MESSAGE);
  
  await utils.sleep(CLEAN_UP_DELAY_IN_MS);

  await message.delete();
  await reply.delete();
}

keepAlive();
client.login(process.env['TOKEN']);
