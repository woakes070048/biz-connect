const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const DBConnection = require("./lib/DBConnection");
const app = express();

const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));


app.use(function(req, res, next) {
    // console.log(`${req.method} request for '${req.url}' - ${JSON.stringify(req.body)}`);
    next();
});


app.use(express.static("./public"));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));


app.get("/api/owner/:id", function(req, res) {

    const connection = DBConnection();

    connection.connect();

    const query = `SELECT * FROM owner O,business B
					WHERE O.id=${req.params.id} AND O.id = B.owner_id`;


    connection.query(query, function(err, rows, fields) {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err)
            res.json(err)
        }
    });

    connection.end();

});

app.post("/api/notify", function(req, res) {

    const connection = DBConnection();

    connection.connect();

    const query = `SELECT * FROM business_customer BC,customer C
				WHERE  BC.business_id = ${req.body.business_id}
				AND BC.customer_id = C.id AND BC.active=1`;


    connection.query(query, function(err, rows, fields) {
        if (!err) {

            //get day of week
            const today = weekdays[new Date().getDay()];
            //for each subscribed customer, send SMS if applicable
            for (let customer of rows) {
                //if customer has not opted for alerts today, skip
                if (customer[today] == 0) break;
                //format the customer phone number with country code
                const phone = `+${customer.country_code}${customer.mobile}`;
                //notify the customer
                console.log(`Attempting to send SMS to ${phone}`);
                notifyCustomer(phone, req.body.text);
            }
            res.json('success');
        } else {
            console.log(err)
            res.json(err)
        }
    });

    connection.end();

});


app.listen(3000);

console.log("Express app running on port 3000");

module.exports = app;



function notifyCustomer(phone, msg) {
    // Twilio Credentials
    const accountSid = '<accountSid>';
    const authToken = '<authToken>';
    //require the Twilio module and create a REST client
    const client = require('twilio')(accountSid, authToken);
    client.messages.create({
        to: phone,
        from: "+<number>",
        body: msg
    }, function(err, message) {
        if (err) {
            console.log(err);
        } else {
            console.log(`Message sent: ${message.sid}`);
        }

    });

}
