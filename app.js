const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();


app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO 
        user (username, name, password, gender, location) 
      VALUES 
        (
          '${username}', 
          '${name}',
          '${hashedPassword}', 
          '${gender}',
          '${location}'
        )`;  // API 1 Scenario 3
    const dbResponse = await db.run(createUserQuery);
    const newUserId = dbResponse.lastID;
    response.status=200;
    response.send(`User created successfully`);
  } else {   // API 1 Scenario 1
    response.status = 400;
    response.send("User already exists");
  }
  // API 1 Scenario 2
   const selectPasswordLength=`SELECT * FROM user WHERE password = '${password}'`;
   if len(selectPasswordLength)<5{
   response.status=400;
   response.send("Password is too short")
   }
});


app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    // API 2 Scenario 1
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
        // API 2 Scenario 3
      response.send("Login Success!");
    } else {
      response.status(400);
      // API 2 Scenario 2
      response.send("Invalid Password");
    }
  }
});

app.post("/change-password", async (request, response) => {
  const { username, newPassword,oldPassword } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const oldPassword = await bcrypt.compare(oldPassword, dbUser.oldPassword);
    if (isPasswordMatched !== true) {
      response.send("Invalid current password");
    } else if len(newPassword)<5 {
      response.status(400);
      response.send("Password is too short");
    }
    else{
         const upatePassword = `
      INSERT INTO 
        user (newPassword ) 
      VALUES 
        (
          
          '${newPassword}'
        )`;
    const dbResponse = await db.run(upatePassword);
    const newUserId = dbResponse.lastID;
    response.send(`Password updated`);
    }
  }
});