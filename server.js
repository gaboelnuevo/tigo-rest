
var express = require('express');
var app = express();

var PORT = process.env.PORT || 3000;


var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var request = require("request");
var xpath = require('xpath')
  , dom = require('xmldom').DOMParser
var parser = require('xml2json');

var baseUrl = 'https://testapi.tigo.com.hn/mfsapi/';


/* {
	"options": {
		"country": "HND",
		"correlationID": "?",
		"consumerID": "?",
		"transactionID": "?"
	}, 
	"args": {
		"masterAccount": "96531915",
		"pin": "2017",
		"account": "96531915",
		"amount": "10",
		"terminalID": "1000",
		"businessID": "PxxxPxxxxx-01",
		"businessReference": "10101010"
	}
} */

app.post('/SalaryPaymentService', function(req, res){
  var url = baseUrl + 'SalaryPaymentService?WSDL';
  var args =  req.body.args || {};
  var options = {
    correlationID: "",
    consumerID: "",
    transactionID: "",
  };

  Object.assign(options, (req.body.options || {}));
  
  var reqOptions = {
    method: 'POST',
    url: url,
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
                     ).join('\n')
                   }
                </v3:GeneralConsumerInformation>
             </v3:RequestHeader>
             <v1:requestBody>
                ${
                  Object.keys(args).map(
                    key => {
                      return `<v1:${key}>${args[key]}</v1:${key}>`
                    }
                  ).join('\n')
                }
                <!--Optional:-->
                <v1:additionalParameters>
                  <!--Zero or more repetitions:-->
                  <!--<v2:ParameterType>
                      <v2:parameterName>?</v2:parameterName>
                      <v2:parameterValue>?</v2:parameterValue>
                  </v2:ParameterType>-->
                </v1:additionalParameters>
             </v1:requestBody>
          </v1:SalaryPaymentRequest>
       </soapenv:Body>
    </soapenv:Envelope>`
  };

  request(reqOptions, function(error, response, body) {
    if (error) throw new Error(error);

    // remove namespace prefixs
    body = body ? body.replace(/<(\/?)\w+:(\w+\/?)(.*?(?=>))>/g, "<$1$2>") : '';
    var doc = new dom().parseFromString(body);
    var nodes = xpath.select("/Envelope/Body", doc);
    var _response = parser.toJson(nodes.toString(), { object: true });
    var ok = _response.Body && !_response.Body.Fault;
    console.log(JSON.stringify(_response));

    res.status(ok ? 200: 500).send(body);
  });

  //request(reqOptions).pipe(res);
});

app.listen(PORT, function (){
   console.log(`App listening on port ${PORT}!`);
});
