const JSONFileDatabase = require('./jsonFileDatabase');
const logger = require('./logger');
require('dotenv').config();

const db = new JSONFileDatabase(process.env.DB_FOLDER_PATH || '.db');

const DB_VERSION = '1';

const KEY_DB_VERSION = 'KEY_DB_VERSION';
const KEY_COMMAND_CHANNELS = 'KEY_COMMAND_CHANNELS';
const KEY_TARGET_USER_TAGS = 'KEY_TARGET_USER_TAGS';

const updateDbIfNewerVersion = async () => {
  const existingDbVersion = await db.get(KEY_DB_VERSION);
  if (existingDbVersion !== DB_VERSION) {
    logger.info(`Old DB Version: ${existingDbVersion || '0'}`);
    logger.info(`New DB Version: ${DB_VERSION}`);

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

/**
 * Gets all target user tags for guilds. If there are no entries, it returns an empty array.
 * @return {Array<Object>} - All target user tags for guilds
 */
const getAllTargetUserTags = async () => {
  const targetUserTags = await db.get(KEY_TARGET_USER_TAGS);
  return targetUserTags || [];
};

/**
 * Returns the target user tag list for a guild.
 * @param {string} guildId - Id of the guild
 * @returns {Array<string>} - List of target user tags
 */
const getTargetUserTags = async (guildId) => {
  const allTargetUserTags = await getAllTargetUserTags();
  const guildEntry = allTargetUserTags.find(
    (entry) => entry.guildId === guildId
  );
  return guildEntry ? guildEntry.targetUserTags : [];
};

/**
 * Adds a target user tag to a guild.
 * Throws an error if the target user tag already exists for the guild.
 * @param {string} guildId - Id of the guild
 * @param {string} targetUserTag - User tag to add
 */
const addTargetUserTag = async (guildId, targetUserTag) => {
  const allTargetUserTags = await getAllTargetUserTags();
  const guildEntryIndex = allTargetUserTags.findIndex(
    (entry) => entry.guildId === guildId
  );

  if (guildEntryIndex !== -1) {
    const targetUserTags = allTargetUserTags[guildEntryIndex].targetUserTags;
    if (targetUserTags.includes(targetUserTag)) {
      throw new Error(
        `Target user tag "${targetUserTag}" already exists for the guild.`
      );
    } else {
      // Target user tag does not exist, add it
      targetUserTags.push(targetUserTag);
    }
  } else {
    // Guild entry doesn't exist, create a new one with the target user tag
    allTargetUserTags.push({
      guildId,
      targetUserTags: [targetUserTag],
    });
  }

  await db.set(KEY_TARGET_USER_TAGS, allTargetUserTags);
};

/**
 * Removes a target user tag from a guild.
 * @param {string} guildId - Id of the guild
 * @param {string} targetUserTag - User tag to remove
 */
const removeTargetUserTag = async (guildId, targetUserTag) => {
  const allTargetUserTags = await getAllTargetUserTags();
  const guildEntryIndex = allTargetUserTags.findIndex(
    (entry) => entry.guildId === guildId
  );

  if (guildEntryIndex !== -1) {
    const targetUserTags = allTargetUserTags[guildEntryIndex].targetUserTags;
    const tagIndex = targetUserTags.indexOf(targetUserTag);

    if (tagIndex !== -1) {
      // User tag found, remove it
      targetUserTags.splice(tagIndex, 1);

      // If there are no more tags, remove the guild entry
      if (targetUserTags.length === 0) {
        allTargetUserTags.splice(guildEntryIndex, 1);
      }

      await db.set(KEY_TARGET_USER_TAGS, allTargetUserTags);
    } else {
      throw new Error(`Target user tag "${targetUserTag}" not found.`);
    }
  } else {
    throw new Error(`No target user exists for removal.`);
  }
};

/**
 * Removes all target user tags for a guild.
 * @param {string} guildId - Id of the guild
 */
const clearTargetUserTags = async (guildId) => {
  const allTargetUserTags = await getAllTargetUserTags();
  const filteredTargetUserTags = allTargetUserTags.filter(
    (entry) => entry.guildId !== guildId
  );

  await db.set(KEY_TARGET_USER_TAGS, filteredTargetUserTags);
};

module.exports = {
  updateDbIfNewerVersion,
  getCommandChannel,
  setCommandChannel,
  clearCommandChannel,
  getAllTargetUserTags,
  getTargetUserTags,
  addTargetUserTag,
  removeTargetUserTag,
  clearTargetUserTags,
};
