const { Client, Intents } = require('discord.js');
const keepAlive = require("./server.js");
const utils = require("./utils.js");
const db = require("./db.js");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const CLEAN_UP_DELAY_IN_MS = 5 * 1000;

client.on("ready", () => {
  console.log("Logged in as " + client.user.tag);
});

// TODO: add prettier
// TODO: make command channel name in the warning dynamic from database 
// TODO: change isInitialMessage to isReceivedMessage
client.on("messageCreate", async receivedMessage => {
  if(receivedMessage.author.bot) return;

  const isCCCommand = receivedMessage.content.startsWith("!!");

  if(isCCCommand) {
    await handleCCCommand(receivedMessage);
  }

  await checkIfCommandChannelDeleted(receivedMessage);

  const commandChannelName = await db.getCommandChannel();
  const commandPrefixes = await db.getCommandPrefixes();

  const isCommandChannelSet = !!commandChannelName;
  const isCommandPrefixesEmpty = !commandPrefixes || commandPrefixes.length < 1;

  if(!isCommandChannelSet || isCommandPrefixesEmpty) {
    return;
  }

  const isCommandChannel = receivedMessage.channel.name === commandChannelName;
  const isMessageCommand = commandPrefixes.some(pre => receivedMessage.content.startsWith(pre));

  if(!isCommandChannel && isMessageCommand) {
    handleCommandInRegularChannel(receivedMessage);
  }
});

const handleCCCommand = async (receivedMessage) => {
  if (receivedMessage.content === "!!info") {
    await handleInfoCommand(receivedMessage);
  } else if (receivedMessage.content ==="!!mark") {
    await handleMarkCommand(receivedMessage);
  } else if (receivedMessage.content.startsWith("!!add ")) {
    await handleAddCommand(receivedMessage);
  } else if (receivedMessage.content.startsWith("!!remove ")) {
    await handleRemoveCommand(receivedMessage);
  } else if (receivedMessage.content === "!!list") {
    await handleListCommand(receivedMessage);
  } else {
    await receivedMessage.reply("Invalid command. Use **!!info** command to see all commands you can use.");
  }
}

const handleInfoCommand = async (receivedMessage) => {
  let replyText = "**!!mark**: Marks the channel as command channel. The commands that are posted to other channels will be moved to this channel.\n";
  replyText += "**!!add [command prefix]**: Adds new command prefix. The messages that start with the prefix will be moved to command channel.\n"
  replyText += "**!!remove [command prefix]**: Removes command prefix.\n";
  replyText += "**!!list**: List all command prefixes.";

  receivedMessage.reply(replyText);
}

const handleMarkCommand = async (receivedMessage) => {
  const commandChannel = receivedMessage.channel.name;
  await db.setCommandChannel(commandChannel);

  await receivedMessage.reply(`The channel "${commandChannel}" is now set as the command channel.`);
}

const handleAddCommand = async (receivedMessage) => {
  const commandPrefix = receivedMessage.content.slice(6);

  await db.addCommandPrefix(commandPrefix);

  await receivedMessage.reply(`Added the command prefix "${commandPrefix}".`);
}

const handleRemoveCommand = async (receivedMessage) => {
  const commandPrefixes = await db.getCommandPrefixes();
  
  const commandPrefix = receivedMessage.content.slice(9);

  if(!commandPrefixes.includes(commandPrefix)) {
    const replyText = `Can't remove "${commandPrefix}" because it does not exist. `;

    await receivedMessage.reply(replyText);

    return;
  }

  await db.removeCommandPrefix(commandPrefix);

  await receivedMessage.reply(`Removed the command prefix ${commandPrefix}`);
}

const handleListCommand = async (receivedMessage) => {
  const commandPrefixes = await db.getCommandPrefixes();

  let replyText = "";
  if(!commandPrefixes.length) {
    replyText = "You do not have any command yet. Use **!!add [command name]** to add a new command";
  } else {
    replyText = commandPrefixes.map(p => `- ${p}`).join("\n");
  }

  await receivedMessage.reply(replyText);
}

const handleCommandInRegularChannel = async (receivedMessage) => {
  await receivedMessage.reply("You can't post commands in this channel. Use bot-commands channel for that.");
  
  await utils.sleep(CLEAN_UP_DELAY_IN_MS);
  
  const commandChannelName = await db.getCommandChannel();
  const currentChannel = receivedMessage.channel;
  
  const commandChannel = receivedMessage.guild.channels.cache.find(
    eachChannel => eachChannel.name === commandChannelName
  )

  currentChannel.messages.cache.forEach(async channelMessage => {
    let isReplyToReceivedMessage = false;

    if(channelMessage.type === "REPLY") {
      let repliedMessage = await channelMessage.fetchReference();
        if(receivedMessage.id === repliedMessage.id) {
          isReplyToReceivedMessage = true;
        }
    }

    const isMessageFromMe = channelMessage.author.id === client.user.id;
    const isInitialMessage = channelMessage.id === receivedMessage.id;

    const willDelete = isInitialMessage || isReplyToReceivedMessage || isMessageFromMe;
    const willRepost = !isMessageFromMe && (isInitialMessage || isReplyToReceivedMessage);

    const isMessageDeleted = await !currentChannel.messages.cache.get(channelMessage.id);

    if(!isMessageDeleted && willRepost) {
      await commandChannel.send(`${channelMessage.author.username}: ${channelMessage.content} \n`);
    }

    if(!isMessageDeleted && willDelete) {
      await channelMessage.delete();
    }
  });;
}

const checkIfCommandChannelDeleted = async (receivedMessage) => {
  const commandChannelName = await db.getCommandChannel();

  if(!commandChannelName) {
    return;
  }

  const commandChannel = receivedMessage.guild.channels.cache.find(
    eachChannel => eachChannel.name === commandChannelName
  );

  if(!commandChannel) {
    await db.setCommandChannel(null);
  }
}

keepAlive();
client.login(process.env['TOKEN']);
