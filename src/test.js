var request = require("request");

var options = { method: 'GET',
  url: 'https://koinex.in/api/ticker',
  headers: 
   { 'postman-token': 'a2dd4344-54d0-98fe-668f-591929b37dd7',
     'cache-control': 'no-cache' } };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
