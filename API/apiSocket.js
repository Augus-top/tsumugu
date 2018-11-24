const net = require('net');
const clean = require('./apiCleaner');
const version = require('../package.json').version;

const wait = (duration) => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
};

class Courier extends net.Socket {

  constructor(parse) {
    super();
    this.eol = '\x04';
    this.parse = parse;
  }

  async awaitResponse(message) {
    let chunk = '';
    this.on('data', (data) => {
      chunk += data.toString();
      if (data.indexOf(this.eol) === -1) return;
      this.removeAllListeners('data');
      const response = this.splitResponse(chunk, message);
      const preparedResponse = await this.readResponse(message, response);
      return preparedResponse;
    });
    this.write(`${message}${this.eol}`);
  }

  async readResponse(message, response) {
    if (response.status === 'error') {
      if (response.id !== 'throttled') return response;
      await wait(response.fullwait * 1000);
      const delayedResponse = await this.awaitResponse(message);
      return delayedResponse;
    }
    if (this.parse === undefined || response.status === 'dbstats') {
      response.searchType = undefined;
      response.searchID = undefined;
      const json = JSON.parse(JSON.stringify(response));
      return json;

    }
    const cleanedResponse = clean.parse(response);
    return cleanedResponse;
  }

  contact(uri, port, encoding) {
    return new Promise((resolve, reject) => {
      this.once('error', () => reject('VNDB API: connection failed'));
      this.on('connect', () => {
        this.setEncoding(encoding);
        this.removeAllListeners('error');
        this.removeAllListeners('connect');
        resolve();
      });
      this.connect(port, uri);
    });
  }

  register(clientName) {
    return new Promise((resolve, reject) => {
      this.once('error', error => reject(error));
      let chunk = '';
      this.on('data', (data) => {
        chunk += data.toString();
        const response = chunk.substring(0, chunk.indexOf(this.eol));
        if (response === 'ok') {
          this.removeAllListeners('error');
          this.removeAllListeners('data');
          resolve();
        }
      });
      this.write(`login {"protocol":1,"client":"${clientName}","clientver":"${version}"}${this.eol}`);
    });
  }

  splitResponse(response, message) {
    const status = response.match(/(\S+) {/)[1];
    const body = JSON.parse(response.match(/{.+}/)[0]);
    if (status === 'error') {
      body.status = status;
      return body;
    }
    if (status === 'dbstats') {
      body.status = status;
      return body;
    }
    const searchType = message.substring(4, message.indexOf(' ', 4));
    if (searchType === 'votelist' || searchType === 'vnlist' || searchType === 'wishlist') {
      const id = message.match(/\(uid.+?(\d+)\)/)[1];
      body.status = status;
      body.searchID = id;
      body.searchType = searchType;
      return body;
    }
    body.status = status;
    body.searchType = searchType;
    return body;
  }
}

module.exports = Courier;
