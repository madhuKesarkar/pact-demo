const express = require('express');
const { randomUUID } = require('crypto');

// In-memory "database" of consents (same idea as the colleague's demo)
const consents = new Map();

function createApp() {
  const app = express();
  app.use(express.json());

  // Simple auth check: every request needs "Authorization: Bearer <token>"
  app.use((req, res, next) => {
    const auth = req.get('Authorization') || '';
    if (!/^Bearer .+/.test(auth)) {
      return res.status(401).json({ error: 'Unauthorised' });
    }
    next();
  });

  // READ -> 200
  app.get('/consents', (req, res) => {
    res.status(200).json([...consents.values()]);
  });

  // CREATE -> 201, or 400 if the payload is missing/invalid
  app.post('/consents', (req, res) => {
    const { customerId, scope } = req.body || {};
    if (!customerId || !scope) {
      return res.status(400).json({ error: 'customerId and scope are required' });
    }
    const consent = {
    consentId: randomUUID(),
      customerId,
      scope,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    consents.set(consent.consentId, consent);
    res.status(201).json(consent);
  });

  // DELETE -> 204
  app.delete('/consents/:id', (req, res) => {
    if (!consents.delete(req.params.id)) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  });

  return app;
}

module.exports = { createApp, consents };