const path = require('path');
const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const { ConsentClient } = require('../src/consentClient');

const { eachLike, uuid, datetime, string, regex, like } = MatchersV3;

const provider = new PactV3({
  consumer: 'ChannelAPI',
  provider: 'ConsentDomainAPI',
  dir: path.resolve(__dirname, '../pacts'),
});

// Token: we check the FORMAT ("Bearer <something>"), never a real, expiring value
const AUTH = { Authorization: regex('^Bearer .+$', 'Bearer static-test-token') };
const ISO_TS = "yyyy-MM-dd'T'HH:mm:ss.SSSX";

const consentBody = {
  consentId: uuid('3f2c1a9e-8b7d-4c6e-9f10-2a3b4c5d6e7f'),
  customerId: string('CUST-1001'),
  scope: string('ACCOUNTS_READ'),
  status: regex('^(ACTIVE|REVOKED)$', 'ACTIVE'),
  createdAt: datetime(ISO_TS, '2026-11-02T10:15:30.000Z'),
};

describe('ChannelAPI -> ConsentDomainAPI contract', () => {
  test('GET /consents returns the customer consents (200)', () => {
    provider
      .given('consents exist')
      .uponReceiving('a request to list consents')
      .withRequest({ method: 'GET', path: '/consents', headers: { ...AUTH, Accept: 'application/json' } })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': regex('application/json.*', 'application/json; charset=utf-8') },
        body: eachLike(consentBody), // array with at least 1 item shaped like this
      });

    return provider.executeTest(async (mockServer) => {
      const client = new ConsentClient(mockServer.url, 'static-test-token');
      const consents = await client.getConsents();
      expect(consents[0].status).toBe('ACTIVE');
    });
  });

  test('POST /consents creates a consent (201)', () => {
    provider
      .given('no consents exist')
      .uponReceiving('a request to create a consent')
      .withRequest({
        method: 'POST',
        path: '/consents',
        headers: { ...AUTH, 'Content-Type': 'application/json' },
        body: { customerId: 'CUST-1001', scope: 'ACCOUNTS_READ' },
      })
      .willRespondWith({ status: 201, body: consentBody });

    return provider.executeTest(async (mockServer) => {
      const client = new ConsentClient(mockServer.url, 'static-test-token');
      const res = await client.createConsent({ customerId: 'CUST-1001', scope: 'ACCOUNTS_READ' });
      expect(res.status).toBe(201);
      expect(res.data.consentId).toBeDefined();
    });
  });

  test('POST /consents without a body is rejected (400)', () => {
    provider
      .given('no consents exist')
      .uponReceiving('a request to create a consent with no body')
      .withRequest({ method: 'POST', path: '/consents', headers: AUTH })
      .willRespondWith({ status: 400, body: { error: like('customerId and scope are required') } });

    return provider.executeTest(async (mockServer) => {
      const client = new ConsentClient(mockServer.url, 'static-test-token');
      await expect(client.createConsent(undefined)).rejects.toMatchObject({ response: { status: 400 } });
    });
  });
});