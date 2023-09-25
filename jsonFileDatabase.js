const fs = require('fs');
const path = require('path');

class JSONFileDatabase {
  constructor(folderPath) {
    this.folderPath = folderPath;
  }

  async get(key) {
    const filePath = this.getFilePath(key);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData);
  }

  async set(key, value) {
    const filePath = this.getFilePath(key);
    const jsonData = JSON.stringify(value, null, 2);
    fs.writeFileSync(filePath, jsonData, 'utf8');
  }

  async delete(key) {
    const filePath = this.getFilePath(key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async empty() {
    fs.readdirSync(this.folderPath).forEach((file) => {
      const filePath = path.join(this.folderPath, file);
      fs.unlinkSync(filePath);
    });
  }

  getFilePath(key) {
    return path.join(this.folderPath, `${key}.json`);
  }
}

module.exports = JSONFileDatabase;
