const axios = require("axios");

module.exports = {
  cognitoChangeRoom: (req, res) => {
    try {
      const url = `${process.env.COGNITO_SERVER}/change-room`;
      const data = JSON.stringify(req.body.data);
      const token = JSON.parse(process.env.CREDENTIALS).access_token;
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Cookie': "JSESSIONID=72E4001E00486A7FA15AE33F62D5C06F",
        "Content-type": "application/json",
      };
      axios.patch(url,  data, { headers })
      .then(ans => { 
        res.status(200).send({ status:200, message: 'Ok'})
      })
      .catch(error => { 
        console.error('There was an error!', error);   
        res.status(200).send({ status: error.response.status, message: error.message});
      });   
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
  cognitoCheckout: (req, res) => {
    try {
      const data = JSON.stringify(req.body.data);
      const token = JSON.parse(process.env.CREDENTIALS).access_token;
      const url = `${process.env.COGNITO_SERVER}/check-out`; 
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Cookie': "JSESSIONID=72E4001E00486A7FA15AE33F62D5C06F",
        "Content-type": "application/json",
      };
      axios.post(url, data, { headers })
      .then(ans => { 
        res.status(200).send({ status:200, message: 'Ok'})
      })
      .catch(error => { 
        console.error('There was an error!', error);   
        res.status(200).send({ status: error.response.status, message: error.message});
    });  
    } catch (err) {
      res.status(err.statusCode || 500).send(err.message);
    }
  },
};
