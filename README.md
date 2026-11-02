# Pact Contract Testing Demo (Consumer-Driven)

Consumer-driven contract testing with **Pact JS v17 + Jest**, using
[JSONPlaceholder](https://jsonplaceholder.typicode.com) as a live provider.

```
UserWebApp (consumer) ──► Pact mock server ──► pacts/*.json (contract)
                                                     │
JSONPlaceholderAPI (real API) ◄── Pact Verifier ◄────┘
```

| Interaction | Request | Expected response |
|---|---|---|
| Get user | `GET /users/1` (state: *user with id 1 exists*) | `200`, `{ id, name, username, email, address }` |
| Create post | `POST /posts` `{ title, body, userId }` | `201`, `{ id, title, body, userId }` |

## Run
```bash
npm install
npm run test:consumer   # runs client against Pact mock, writes pacts/UserWebApp-JSONPlaceholderAPI.json
npm run test:provider   # replays the contract against the real API and verifies responses
```

## Key concepts shown
- **Consumer-driven**: the contract lists only the fields the consumer uses.
- **Matchers** (`integer`, `string`, `like`, `regex`): verify type/format, not exact values.
- **Provider states** (`given(...)`) + `stateHandlers` for provider-side test data setup.
- **Breaking-change detection**: renaming `name` → `fullName` in the consumer passes consumer tests
  but fails provider verification with `Actual map is missing the following keys: fullName`.

## Next step
Publish pacts to a Pact Broker (PactFlow) and gate releases with `can-i-deploy`.
