const express = require("express");
const bodyParser = require("body-parser");

const app = express();

//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // application/json
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

/* Add new routes here ... */
app.post("/varify", (req, res, next) => {
  const host = req.hostname;
  const ip = req.connection.remoteAddress;
  const licence_key = req.body.licence_key;
  const company_name = req.body.company_name;

  const request = {
    company_name: company_name,
    licence_key: licence_key,
    ip: ip,
    host: host,
  };
  //console.log(request);

  const licences = require("./licences.json");
  //console.log(licences);

  const used_licence = licences
    .filter((licence) => {
      if (
        licence.company_name === request.company_name &&
        licence.licence_key === request.licence_key &&
        licence.ip === request.ip &&
        licence.host === request.host
      ) {
        // console.log(licence.company_name === request.company_name);
        // console.log(licence.licence_key === request.licence_key);
        // console.log(licence.ip === request.ip);
        // console.log(licence.host === request.host);

        return licence;
      }
    })
    .pop();

  if (used_licence) {
    // console.log(
    //   used_licence.company_name,
    //   used_licence.host,
    //   used_licence.ip,
    //   used_licence.licence_key,
    //   used_licence.expiry_date
    // );
    // console.log(used_licence);

    let status = 0,
      message = "";

    if (Date.parse(used_licence.expiry_date) > Date.now()) {
      status = 1;
      message = "Your Licence is Valid";
    }

    const response_json = {
      Status: status,
      Message: message,
      ExpiryDate: used_licence.expiry_date,
      Type: used_licence.type,
    };

    res.status(200).json(response_json);
  } else {
    const response_json = {
      Status: 0,
      Message: "The Product is not Registered",
      ExpiryDate: "",
      Type: "",
    };

    res.status(403).json(response_json);
  }

  //   $response['Status'] = 1;
  //   $response['Message'] = "Your Licence is Valid";
  //   $response['ExpiryDate'] = $data['ExpiryDate'];
  //   $response['Type'] = $data['Type'];
  //   $response['LicenceProperties'] = $licenceproperties;
  //   Log::info(' LicenceProperties ' .print_r($response,true) );
  //   echo json_encode($response);
});

app.use((req, res, next) => {
  res.status(404).json({ message: "Invalid URL Found" });
  next();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log("server connected to port " + PORT);
});
