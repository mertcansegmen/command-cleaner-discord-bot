const Database = require("@replit/database");

const db = new Database();

const DB_VERSION = "1";

const KEY_DB_VERSION = "KEY_DB_VERSION";
const KEY_COMMAND_CHANNELS = "KEY_COMMAND_CHANNELS";
const KEY_COMMAND_PREFIXES = "KEY_COMMAND_PREFIXES";

const updateDb = async () => {
  const existingDbVersion = await db.get(KEY_DB_VERSION);
  if (existingDbVersion !== DB_VERSION) {
    console.log(`Old DB Version: ${existingDbVersion || "0"}`);
    console.log(`New DB Version: ${DB_VERSION}`);

    await db.empty();
    await db.set(KEY_DB_VERSION, DB_VERSION);
  }
};

updateDb();

const getAllCommandChannels = async () => {
  const commandChannels = await db.get(KEY_COMMAND_CHANNELS);

  return commandChannels || [];
};

const getCommandChannel = async (guildId) => {
  const commandChannels = await getAllCommandChannels();

  const commandChannel = commandChannels.find((cc) => cc.guildId === guildId);

  return commandChannel?.name;
};

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

const clearCommandChannel = async (guildId) => {
  const commandChannels = await getAllCommandChannels();

  const updatedCommandChannels = commandChannels.filter((cc) => {
    return cc.guildId !== guildId;
  });

  await db.set(KEY_COMMAND_CHANNELS, updatedCommandChannels);
};

const getAllCommandPrefixes = async () => {
  const commandPrefixes = await db.get(KEY_COMMAND_PREFIXES);

  return commandPrefixes || [];
};

const guildHasCommandPrefixEntry = async (guildId) => {
  const commandPrefixes = await getAllCommandPrefixes();

  return commandPrefixes.some((cp) => cp.guildId === guildId);
};

const commandPrefixExists = async (guildId, commandPrefix) => {
  const commandPrefixes = await getAllCommandPrefixes();

  const guildHasEntry = await guildHasCommandPrefixEntry(guildId);

  if (!guildHasEntry) return false;

  return commandPrefixes
    .find((cp) => cp.guildId === guildId)
    .prefixes.includes(commandPrefix);
};

const getCommandPrefixes = async (guildId) => {
  const commandPrefixes = await getAllCommandPrefixes();

  const guildCommandPrefixes = commandPrefixes.find(
    (cp) => cp.guildId === guildId
  );

  return !guildCommandPrefixes || !guildCommandPrefixes.prefixes
    ? []
    : guildCommandPrefixes.prefixes;
};

const addCommandPrefix = async (guildId, newCommandPrefix) => {
  const commandPrefixes = await getAllCommandPrefixes();

  const guildHasEntry = await guildHasCommandPrefixEntry(
    guildId,
    newCommandPrefix
  );

  let updatedCommandPrefixes;

  if (guildHasEntry) {
    const prefixExists = await commandPrefixExists(guildId, newCommandPrefix);

    if (prefixExists) {
      throw new Error(
        `The command prefix "${commandPrefixToDelete}" already exists for server.`
      );
    }

    updatedCommandPrefixes = commandPrefixes.map((guildCommandPrefixInfo) => {
      if (guildCommandPrefixInfo.guildId !== guildId) {
        return guildCommandPrefixInfo;
      }

      const newCommandPrefixInfo = {
        guildId,
        prefixes: [...guildCommandPrefixInfo.prefixes, newCommandPrefix],
      };

      return newCommandPrefixInfo;
    });
  } else {
    const newCommandPrefixInfo = {
      guildId,
      prefixes: [newCommandPrefix],
    };

    updatedCommandPrefixes = [...commandPrefixes, newCommandPrefixInfo];
  }

  await db.set(KEY_COMMAND_PREFIXES, updatedCommandPrefixes);
};

const removeCommandPrefix = async (guildId, commandPrefixToDelete) => {
  const commandPrefixes = await getAllCommandPrefixes();

  const prefixExists = await commandPrefixExists(
    guildId,
    commandPrefixToDelete
  );

  if (!prefixExists) {
    throw new Error(
      `Can't remove the command prefix "${commandPrefixToDelete}" because it does not exist.`
    );
  }

  const updatedCommandPrefixes = commandPrefixes.map(
    (guildCommandPrefixInfo) => {
      if (guildCommandPrefixInfo.guildId !== guildId) {
        return guildCommandPrefixInfo;
      }

      const newCommandPrefixInfo = {
        guildId,
        prefixes: guildCommandPrefixInfo.prefixes.filter((prefix) => {
          return prefix !== commandPrefixToDelete;
        }),
      };

      return newCommandPrefixInfo;
    }
  );

  await db.set(KEY_COMMAND_PREFIXES, updatedCommandPrefixes);
};

module.exports = {
  getCommandChannel,
  setCommandChannel,
  clearCommandChannel,
  commandPrefixExists,
  getCommandPrefixes,
  addCommandPrefix,
  removeCommandPrefix,
};
