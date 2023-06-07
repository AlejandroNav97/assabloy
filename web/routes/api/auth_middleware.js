const config = require("../../config.json");
const UserPoolId = config.cognito.userPoolId;
const ClientId = config.cognito.clientId;
const pool_region = config.cognito.region;

const auth_middleware = {
  validate: (req, res, next) => {
    var token = req.headers["authorization"];
    request(
      {
        url: `https://cognito
        idp.${pool_region}.amazonaws.com/${UserPoolId}/.well-known/jwks.json`,
        json: true,
      },
      function (error, response, body) {
        if (!error && response.statusCode === 200) {
          pems = {};
          var keys = body["keys"];
          for (var i = 0; i < keys.length; i++) {
            var key_id = keys[i].kid;
            var modulus = keys[i].n;
            var exponent = keys[i].e;
            var key_type = keys[i].kty;
            var jwk = { kty: key_type, n: modulus, e: exponent };
            var pem = jwkToPem(jwk);
            pems[key_id] = pem;
          }
          var decodedJwt = jwt.decode(token, { complete: true });
          if (!decodedJwt) {
            console.log("Not a valid JWT token");
            res.status(401);
            return res.send("Invalid token");
          }
          var kid = decodedJwt.header.kid;
          var pem = pems[kid];
          if (!pem) {
            console.log("Invalid token");
            res.status(401);
            return res.send("Invalid token");
          }
          jwt.verify(token, pem, function (err, payload) {
            if (err) {
              console.log("Invalid Token.");
              res.status(401);
              return res.send("Invalid tokern");
            } else {
              console.log("Valid Token.");
              return next();
            }
          });
        } else {
          console.log("Error! Unable to download JWKs");
          res.status(500);
          return res.send("Error! Unable to download JWKs");
        }
      }
    );
  },
  renew: () => {
    const RefreshToken = new AmazonCognitoIdentity.CognitoRefreshToken({
      RefreshToken: process.env.credentials.refreshToken,
    });

    const userPool = new AmazonCognitoIdentity.CognitoUserPool({ UserPoolId, ClientId });

    const userData = {
        Username: 'poc-assabloy@test.com',
        Pool: userPool,
    };

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.refreshSession(RefreshToken, (err, session) => {
      if (err) {
        console.log(err);
      } else {
        let credentials = {
          access_token: session.accessToken.jwtToken,
          id_token: session.idToken.jwtToken,
          refresh_token: session.refreshToken.token,
        };
        process.env.credentials = credentials; 
      }
    });
  },
};

module.exports = auth_middleware;
