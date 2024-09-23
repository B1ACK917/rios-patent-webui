const logger = require('./utils/log')
const global = require('./utils/global')
const app = require('./utils/router')
//const https = require('https')

// var privateKey = fs.readFileSync('cert/key.pem', 'utf8');
// var certificate = fs.readFileSync('cert/cert.pem', 'utf8');
// var credentials = { key: privateKey, cert: certificate };

// app.listen(global.port, () => { logger.info(`node backend listening on port ${global.port}`) })
//http.createServer(app).listen(global.port, () => { logger.info(`http node backend listening on port ${global.port}`) })
// https.createServer(credentials, app).listen(global.port, () => { logger.info(`https node backend listening on port ${global.port}`) })
const http = require('http')

// app.listen(global.port, () => { logger.info(`node backend listening on port ${global.port}`) })
http.createServer(app).listen(global.port, () => { logger.info(`http node backend listening on port ${global.port}`) })
// https.createServer(app).listen(global.port, () => { logger.info(`https node backend listening on port ${global.port}`) })
