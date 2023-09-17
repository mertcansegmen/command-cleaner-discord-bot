const Database = require("@replit/database");

const db = new Database();

const DB_VERSION = "1";

const KEY_DB_VERSION = "KEY_DB_VERSION";
const KEY_COMMAND_CHANNELS = "KEY_COMMAND_CHANNELS";

const updateDbIfNewerVersion = async () => {
  const existingDbVersion = await db.get(KEY_DB_VERSION);
  if (existingDbVersion !== DB_VERSION) {
    console.log(`Old DB Version: ${existingDbVersion || "0"}`);
    console.log(`New DB Version: ${DB_VERSION}`);

    await db.empty();
    await db.set(KEY_DB_VERSION, DB_VERSION);
  }
};

/**
 * Gets all command channels from database. If there isn't
 * any, it returns an empty array.
 * @return {Array<Object>} - All command channels
 */
const getAllCommandChannels = async () => {
  const commandChannels = await db.get(KEY_COMMAND_CHANNELS);

  return commandChannels || [];
};

/**
 * Returns the name of the command channel set for the guild. 
 * If a command channel was not set for the guild, it returns null.
 * @param {string} guildId - Id of the guild
 * @returns {string|null} - Name of the command channel
 */
const getCommandChannel = async (guildId) => {
  const commandChannels = await getAllCommandChannels();

  const commandChannel = commandChannels.find((cc) => cc.guildId === guildId);

  return commandChannel?.name;
};

/**
 * Sets the command channel of the guild.
 * @param {string} guildId - Id of the guild
 * @param {string} channelName - Name of the command channel
 */
const setCommandChannel = async (guildId, channelName) => {
  const commandChannels = await getAllCommandChannels();

  const guildHasEntry = commandChannels.some((cc) => cc.guildId === guildId);

  let updatedCommandChannels;
  if (guildHasEntry) {
    updatedCommandChannels = commandChannels.map((cc) => {
      return cc.guildId === guildId ? { guildId, name: channelName } : cc;
    });
  } else {
    updatedCommandChannels = [
      ...commandChannels,
      { guildId, name: channelName },
    ];
  }

  await db.set(KEY_COMMAND_CHANNELS, updatedCommandChannels);
};

/**
 * Removes the command channel set for a guild.
 * @param {string} guildId - Id of the guild
 */
const clearCommandChannel = async (guildId) => {
  const commandChannels = await getAllCommandChannels();

  const updatedCommandChannels = commandChannels.filter((cc) => {
    return cc.guildId !== guildId;
  });

  await db.set(KEY_COMMAND_CHANNELS, updatedCommandChannels);
};


module.exports = {
  updateDbIfNewerVersion,
  getCommandChannel,
  setCommandChannel,
  clearCommandChannel,
};
