const mysql = require("mysql2");

const options = {
  host: process.env.DB_HOST, // Host name for database connection:
  port: process.env.DB_PORT, // Port number for database connection:
  user: process.env.DB_USER, // Database user:
  password: process.env.DB_PW, // Password for the above database user:
  database: process.env.DB_NAME, // Database name:
  multipleStatements: true,
};

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(options); // Recreate the connection, since
  // the old one cannot be reused.

  connection.connect(function (err) {
    if (!err) {
      console.log("Database is connected successfully...");
    } // The server is either down or restarting (takes a while sometimes)
    if (err) { 
      console.log("Error when connecting to db:", err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    } // to avoid a hot loop, and to allow our node script to
  }); // process asynchronous requests in the meantime. 
  connection.on("error", function (err) {
    console.log("DB Connection error", err);
    if (!err.fatal) { 
      return;
    }
    if (err.code === "PROTOCOL_CONNECTION_LOST" ) {
      // Connection to the MySQL server is usually lost due to either server restart 
      handleDisconnect();  
    } else {
      // connnection idle timeout (the wait_timeout server variable configures this)
      throw err; 
    }
  });
}

function keepAlive() {
  console.log('Starting keep alive');
  connection.query("SELECT 1", (err, result) => {
    console.log('Keep alive', result);
    if (err) {
      console.log("QUERY ERROR: " + err);
      connection.end();
      throw err;
    }
  });
}

handleDisconnect();

// Consiste call to DB to avoid DB connection waittimeout
setInterval(keepAlive, 1800000);

module.exports = connection;
