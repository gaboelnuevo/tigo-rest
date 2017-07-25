
var express = require('express');
var app = express();

var PORT = process.env.PORT || 3000;


var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var request = require("request");

var baseUrl = 'https://testapi.tigo.com.hn/mfsapi/';

app.post('/SalaryPaymentService', function(req, res){
  var url = baseUrl + 'SalaryPaymentService?WSDL';
  var args =  req.body.args || {};
  var options = req.body.options || {};
  var reqOptions = {
    method: 'POST',
    url: 'https://testapi.tigo.com.hn/mfsapi/SalaryPaymentService',
    qs: {
      WSDL: ''
    },
    headers: {
      'content-type': 'text/xml'
    },
    body: `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://xmlns.tigo.com/MFS/SalaryPaymentRequest/V1" xmlns:v3="http://xmlns.tigo.com/RequestHeader/V3" xmlns:v2="http://xmlns.tigo.com/ParameterType/V2">
       <soapenv:Header/>
       <soapenv:Body>
          <v1:SalaryPaymentRequest>
             <v3:RequestHeader>
                <v3:GeneralConsumerInformation>
                   ${
                     Object.keys(options).map(
                       key => {
                         return `<v3:${key}>${options[key]}</v3:${key}>`
                       }
                     ).join(' ')
                   }
                </v3:GeneralConsumerInformation>
             </v3:RequestHeader>
             <v1:requestBody>
                ${
                  Object.keys(args).map(
                    key => {
                      return `<v1:${key}>${args[key]}</v1:${key}>`
                    }
                  ).join(' ')
                }
             </v1:requestBody>
          </v1:SalaryPaymentRequest>
       </soapenv:Body>
    </soapenv:Envelope>`
  };

  console.log(reqOptions.body);
  request(reqOptions, function(error, response, body) {
    if (error) throw new Error(error);

    res.send(body);
  });
});

app.listen(PORT, function (){
   console.log(`App listening on port ${PORT}!`);
});
