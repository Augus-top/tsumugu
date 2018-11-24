// original => https://www.npmjs.com/package/vndbjs

const genericPool = require('generic-pool');
const shortid = require('shortid');
const RateLimiter = require('limiter').RateLimiter;
const defaults = require('defaults-shallow');
const Courier = require('../API/apiSocket');

const defaultSettings = {
  uri: 'api.vndb.org',
  port: 19534,
  encoding: 'utf8',
  queryLimit: 20,
  queryInterval: 60000,
  parse: true,
  pool: true,
  poolMin: 1,
  poolMax: 10,
  poolTimeout: 30000
};

class APIController {

  constructor(options) {
    defaults(options, defaultSettings);
    this.options = options;
    this.limiter = new RateLimiter(options.queryLimit, options.queryInterval);
    if (this.options.pool === true) {
      createPool(this.options);
    }
  }

  async createPool(options) {
    this.connectionPool = genericPool.createPool({
      create: () => {
        const client = new Courier(this.options.parse);
        await client.contact(this.options.uri, this.options.port, this.options.encoding);
        client.register(`${this.options.clientName}-${shortid.generate()}`);
        return client;
      },
      destroy: (client) => {
        client.end();
      }
    }, {
      min: this.options.poolMin,
      max: this.options.poolMax,
      idleTimeoutMillis: this.options.poolTimeout
    });
  }

  query(message) {
    this.limiter.removeTokens(1, () => {
      if (this.options.pool === true) {
        const client = await this.connectionPool.acquire();
        const response = await client.awaitResponse(message);
        this.connectionPool.release(client);
        return response;
      }
      const client = new Courier(this.options.parse);
      await client.contact(this.options.uri, this.options.port, this.options.encoding);
      await client.register(`${this.options.clientName}-${shortid.generate()}`);
      const response = await client.awaitResponse(message);
      client.destroy();
      return response;
    });
  }

  async stats() {
    const response = await this.query('dbstats');
    return response;
  }
}

module.exports = APIController;
