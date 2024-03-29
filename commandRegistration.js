const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');
const logger = require('./logger');

const registerCommands = async (clientId, guildId, token) => {
  const commands = [
    {
      name: 'ping',
      description: 'Tests the bot.',
    },
    {
      name: 'command-channel-show',
      description: 'Shows the set command channel.',
    },
    {
      name: 'command-channel-set',
      description: 'Sets the command channel.',
      options: [
        {
          name: 'command-channel',
          description: 'Name of the command channel.',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: 'command-channel-clear',
      description: 'Clears the set command channel.',
    },
    {
      name: 'user-tags-list',
      description: 'List saved Discord user tags.',
    },
    {
      name: 'user-tags-add',
      description: 'Add Discord user tags for automated actions.',
      options: [
        {
          name: 'user-tag',
          description: 'User tag to be added.',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: 'user-tags-remove',
      description: 'Remove Discord user tags from automation.',
      options: [
        {
          name: 'user-tag',
          description: 'User tag to be removed.',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
  ];

  const rest = new REST({ version: 10 }).setToken(token);

  try {
    logger.info(
      'Registering slash commands for guild with the guild id ' + guildId
    );

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });

    logger.info(
      'Slash commands registered for the guild with the guild id ' + guildId
    );
  } catch (err) {
    logger.error(
      'Error while registering the slash commands for the guild with the guild id ' +
        guildId +
        ': ' +
        err
    );
  }
};

module.exports = {
  registerCommands,
};
