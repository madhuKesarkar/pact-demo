const { createApp } = require('./app');
const port = process.env.PORT || 3001;
createApp().listen(port, () => console.log(`ConsentDomainAPI running on http://localhost:${port}`));
