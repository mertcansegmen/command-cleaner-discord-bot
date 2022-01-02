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
  if(message.author.bot) return;

  const isCommandChannel = message.channel.name === COMMAND_CHANNEL;
  const isMessageCommand = COMMAND_PREFIXES
    .some(pre => message.content.startsWith(pre));

  if(!isCommandChannel && isMessageCommand) {
    const replyText = "You can't post commands in this channel. Use bot-commands channel for that.";

    handleCommandInRegularChannel(message, replyText);
  }
  
  if(isCommandChannel && !isMessageCommand) {
    const replyText = "You can only post bot commands in this channel.";
    
    handleNonCommandInCommandChannel(message,replyText);
  }
});

const handleCommandInRegularChannel = async (message, replyText) => {
  const reply = await message.reply(replyText);
  
  await utils.sleep(REPLY_DELETION_IN_MS);

  const channel = message.channel;

  message.delete();
  reply.delete();

  channel.messages.cache.forEach(channelMessage => {
    const isMessageDeleted = !channel.messages.cache.get(channelMessage.id) 
      || channelMessage.id === message.id
      || channelMessage.id === reply.id;
    const isMessageAuthorBot = channelMessage.author.bot;

    if(!isMessageDeleted && isMessageAuthorBot) {
      channelMessage.delete()
    }
  });
}

const handleNonCommandInCommandChannel = async (message, replyText) => {
  const reply = await message.reply(replyText);
  
  await utils.sleep(REPLY_DELETION_IN_MS);

  message.delete();
  reply.delete();
}

keepAlive();
client.login(process.env['TOKEN']);
