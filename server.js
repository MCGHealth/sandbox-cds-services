const app = require('./index.js');

let port = process.env.PORT || 3000;
console.log(`Example app listening on port ${port}!`)
app.listen(port);
