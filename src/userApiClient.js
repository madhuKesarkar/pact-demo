const axios = require('axios');

class UserApiClient {
  constructor(baseUrl) { this.baseUrl = baseUrl; }

  async getUser(id) {
    const res = await axios.get(`${this.baseUrl}/users/${id}`, {
      headers: { Accept: 'application/json' },
    });
    return res.data;
  }

  async createPost(post) {
    const res = await axios.post(`${this.baseUrl}/posts`, post, {
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
    return { status: res.status, data: res.data };
  }
}
module.exports = { UserApiClient };