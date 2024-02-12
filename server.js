const express = require('express');
const path = require('path');

const app = express();

var cors = require('cors');
var whitelist = ['http://192.168.0.147:8000', 'http://localhost:3000', 'http://localhost:4000', 'https://sweet-awfully-tomcat.ngrok-free.app' , 'http://localhost:8000' ]
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
      corsOptions = {origin: true} // reflect (enable) the requested origin in the CORS response
  } else {
      corsOptions = {origin: false} // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}


app.use(cors(corsOptionsDelegate))

app.use(express.static(__dirname + '/dist/order-angel'));

app.get('/*', (req, res) =>{
  res.sendFile(path.join(__dirname, '/dist/order-angel/index.html'));
});

app.listen(9000);