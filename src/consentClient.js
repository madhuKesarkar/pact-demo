const axios = require('axios');

// Channel API's client for the Consent Domain API
class ConsentClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
  }

  async getConsents() {
    const res = await axios.get(`${this.baseUrl}/consents`, { headers: this.headers });
    return res.data;
  }

  async createConsent(consent) {
    const res = await axios.post(`${this.baseUrl}/consents`, consent, {
      headers: { ...this.headers, 'Content-Type': 'application/json' },
    });
    return { status: res.status, data: res.data };
  }
}

module.exports = { ConsentClient };