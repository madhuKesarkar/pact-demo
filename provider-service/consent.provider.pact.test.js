const path = require('path');
const { Verifier } = require('@pact-foundation/pact');
const { createApp, consents } = require('../provider-service/app');

let server;
let baseUrl;

beforeAll((done) => {
  server = createApp().listen(0, () => {        // port 0 = any free port
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    done();
  });
});
afterAll(() => server.close());

// Where to get the contracts from: the broker (CI / team setup) or the local file (demo)
const useBroker = !!process.env.PACT_BROKER_BASE_URL;
const pactSource = useBroker
  ? {
      pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
      pactBrokerToken: process.env.PACT_BROKER_TOKEN,
      consumerVersionSelectors: [{ mainBranch: true }, { deployedOrReleased: true }],
      publishVerificationResult: process.env.CI === 'true',
      providerVersion: process.env.GIT_COMMIT || '1.0.0',
      providerVersionBranch: process.env.GIT_BRANCH || 'main',
    }
  : { pactUrls: [path.resolve(__dirname, '../pacts/ChannelAPI-ConsentDomainAPI.json')] };

describe('ConsentDomainAPI provider verification', () => {
  test('honours all ChannelAPI expectations', () => {
    return new Verifier({
      provider: 'ConsentDomainAPI',
      providerBaseUrl: baseUrl,
      ...pactSource,

      // Provider states: put the provider's data in the state each interaction expects
      stateHandlers: {
        'consents exist': async () => {
          consents.clear();
          consents.set('3f2c1a9e-8b7d-4c6e-9f10-2a3b4c5d6e7f', {
            consentId: '3f2c1a9e-8b7d-4c6e-9f10-2a3b4c5d6e7f',
            customerId: 'CUST-1001',
            scope: 'ACCOUNTS_READ',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
          });
        },
        'no consents exist': async () => consents.clear(),
      },

      // Real tokens expire, so swap in a fresh valid one just before each replayed request
      requestFilter: (req, res, next) => {
        if (req.headers.authorization) {
          req.headers.authorization = 'Bearer provider-generated-valid-token';
        }
        next();
      },
      logLevel: 'warn',
    })
      .verifyProvider()
      .catch(() => { throw new Error('Pact verification failed – see report above'); });
  }, 60000);
});