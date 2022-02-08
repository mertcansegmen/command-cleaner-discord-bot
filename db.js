const Database = require("@replit/database");

const db = new Database();

const KEY_COMMAND_CHANNEL = "KEY_COMMAND_CHANNEL";
const KEY_COMMAND_PREFIXES = "KEY_COMMAND_PREFIXES";

const getCommandChannel = async () => {
  const commandChannel = await db.get(KEY_COMMAND_CHANNEL);

  return commandChannel;
};

const setCommandChannel = async (channelName) => {
  await db.set(KEY_COMMAND_CHANNEL, channelName);
};

const getCommandPrefixes = async () => {
  const commandPrefixes = await db.get(KEY_COMMAND_PREFIXES);

  return commandPrefixes || [];
};

const addCommandPrefix = async (newCommandPrefix) => {
  const commandPrefixes = await getCommandPrefixes();

  const updatedCommandPrefixes = [...commandPrefixes, newCommandPrefix];

  await db.set(KEY_COMMAND_PREFIXES, updatedCommandPrefixes);
};

const removeCommandPrefix = async (commandPrefixToDelete) => {
  const commandPrefixes = await getCommandPrefixes();

  const updatedCommandPrefixes = commandPrefixes.filter((prefix) => {
    return prefix !== commandPrefixToDelete;
  });

  await db.set(KEY_COMMAND_PREFIXES, updatedCommandPrefixes);
};

module.exports = {
  getCommandChannel,
  setCommandChannel,
  getCommandPrefixes,
  addCommandPrefix,
  removeCommandPrefix,
};
