const db = require('./db');

const ping = async (interaction) => {
  interaction.reply("I'm alive!");
};

const commandChannelShow = async (interaction) => {
  const guildId = interaction.guild.id;

  const commandChannel = await db.getCommandChannel(guildId);

  let reply = '';
  if (!commandChannel) {
    reply =
      'No command channel was set. Use command-channel-set command for setting a command channel.';
  } else {
    reply = 'Command channel: ' + commandChannel;
  }

  interaction.reply(reply);
};

const commandChannelSet = async (interaction) => {
  const guildId = interaction.guild.id;
  const commandChannelName = interaction.options.get('command-channel').value;

  await db.setCommandChannel(guildId, commandChannelName);

  interaction.reply('Set ' + commandChannelName + ' as the command channel.');
};

const commandChannelClear = async (interaction) => {
  const guildId = interaction.guild.id;

  await db.clearCommandChannel(guildId);

  interaction.reply('Cleared the set command channel.');
};

const userTagsList = async (interaction) => {
  const guildId = interaction.guild.id;

  const userTags = await db.getTargetUserTags(guildId);

  let reply = '';
  if (!userTags.length) {
    reply =
      'No target user tag found. Use user-tags-add command for adding new target user tags.';
  } else {
    reply = 'Target user tags: ' + userTags.join(', ') + '.';
  }

  interaction.reply(reply);
};

const userTagsAdd = async (interaction) => {
  const userTag = interaction.options.get('user-tag').value;
  const guildId = interaction.guild.id;

  try {
    await db.addTargetUserTag(guildId, userTag);

    interaction.reply('Added ' + userTag + ' to the target list.');
  } catch (err) {
    interaction.reply(err.message);
  }
};

const userTagsRemove = async (interaction) => {
  const userTag = interaction.options.get('user-tag').value;
  const guildId = interaction.guild.id;

  try {
    await db.removeTargetUserTag(guildId, userTag);

    interaction.reply('Removed ' + userTag + ' from the target list.');
  } catch (err) {
    interaction.reply(err.message);
  }
};

module.exports = {
  ping,
  commandChannelShow,
  commandChannelSet,
  commandChannelClear,
  userTagsList,
  userTagsAdd,
  userTagsRemove,
};
