const { Client } = require('pg'); 
const client = new Client({ user: 'postgres', password: 'admin', host: 'localhost', port: 5432, database: 'workspot_db' }); 
client.connect().then(() => client.query('SELECT id, name, images, "pendingData" FROM cafes WHERE status=\'pending\''))
.then(res => { console.log(JSON.stringify(res.rows, null, 2)); process.exit(0); }).catch(console.error);
