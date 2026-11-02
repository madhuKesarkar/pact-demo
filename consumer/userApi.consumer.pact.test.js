const path = require('path');
const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const { UserApiClient } = require('../src/userApiClient');
const { like, integer, string, regex } = MatchersV3;

const provider = new PactV3({
  consumer: 'UserWebApp',
  provider: 'JSONPlaceholderAPI',
  dir: path.resolve(__dirname, '../pacts'),
});

describe('UserWebApp -> JSONPlaceholderAPI contract', () => {
  test('GET /users/1 returns a user', () => {
    provider
      .given('user with id 1 exists')                 // provider state
      .uponReceiving('a request for user 1')           // interaction name
      .withRequest({
        method: 'GET',
        path: '/users/1',
        headers: { Accept: 'application/json' },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': regex('application/json.*', 'application/json; charset=utf-8') },
        body: {
          id: integer(1),
          name: string('Leanne Graham'),
          username: string('Bret'),
          email: regex('.+@.+\\..+', 'Sincere@april.biz'),
          address: like({ city: 'Gwenborough', zipcode: '92998-3874' }),
        },
      });

    return provider.executeTest(async (mockServer) => {
      const client = new UserApiClient(mockServer.url);
      const user = await client.getUser(1);
      expect(user.id).toBe(1);
      expect(user.name).toBe('Leanne Graham');
    });
  });

  test('POST /posts creates a post', () => {
    const newPost = { title: 'Pact demo', body: 'Contract testing', userId: 1 };

    provider
      .uponReceiving('a request to create a post')
      .withRequest({
        method: 'POST',
        path: '/posts',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: newPost,
      })
      .willRespondWith({
        status: 201,
        body: {
          id: integer(101),
          title: string('Pact demo'),
          body: string('Contract testing'),
          userId: integer(1),
        },
      });

    return provider.executeTest(async (mockServer) => {
      const client = new UserApiClient(mockServer.url);
      const res = await client.createPost(newPost);
      expect(res.status).toBe(201);
      expect(res.data.id).toBeDefined();
    });
  });
});