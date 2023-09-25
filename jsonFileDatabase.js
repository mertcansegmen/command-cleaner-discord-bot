const fs = require('fs');
const path = require('path');

/**
 * A simple JSON file-based database.
 */
class JSONFileDatabase {
  /**
   * Creates a new instance of the JSONFileDatabase.
   * @param {string} folderPath - The path to the folder where JSON files will be stored.
   */
  constructor(folderPath) {
    this.folderPath = folderPath;
  }

  /**
   * Gets the value associated with a key from the database.
   * @param {string} key - The key to retrieve data for.
   * @returns {Promise<any|null>} - The value associated with the key, or null if not found.
   */
  async get(key) {
    const filePath = this.getFilePath(key);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData);
  }

  /**
   * Sets the value associated with a key in the database.
   * @param {string} key - The key to set data for.
   * @param {any} value - The value to set.
   */
  async set(key, value) {
    const filePath = this.getFilePath(key);
    const jsonData = JSON.stringify(value, null, 0);
    fs.writeFileSync(filePath, jsonData, 'utf8');
  }

  /**
   * Deletes the value associated with a key from the database.
   * @param {string} key - The key to delete data for.
   */
  async delete(key) {
    const filePath = this.getFilePath(key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Empties the entire database by deleting all files.
   */
  async empty() {
    fs.readdirSync(this.folderPath).forEach((file) => {
      const filePath = path.join(this.folderPath, file);
      fs.unlinkSync(filePath);
    });
  }

  /**
   * Gets the file path for a given key.
   * @param {string} key - The key for which to generate the file path.
   * @returns {string} - The file path.
   */
  getFilePath(key) {
    return path.join(this.folderPath, `${key}.json`);
  }
}

module.exports = JSONFileDatabase;
