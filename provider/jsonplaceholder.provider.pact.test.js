const path = require('path');
const { Verifier } = require('@pact-foundation/pact');

const PROVIDER_URL = process.env.PROVIDER_URL || 'https://jsonplaceholder.typicode.com';

describe('JSONPlaceholderAPI provider verification', () => {
  test('honours the UserWebApp contract', () => {
    return new Verifier({
      provider: 'JSONPlaceholderAPI',
      providerBaseUrl: PROVIDER_URL,
      pactUrls: [path.resolve(__dirname, '../pacts/UserWebApp-JSONPlaceholderAPI.json')],
      stateHandlers: {
        'user with id 1 exists': async () => {
          // Public API: user 1 always exists. With your own API you'd seed the DB here.
        },
      },
      logLevel: 'warn',
    }).verifyProvider().catch(() => { throw new Error('Pact verification failed – see report above'); });
  }, 60000);
});