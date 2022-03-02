let express = require("express");
let sqlite3 = require("sqlite3");
let { open } = require("sqlite");
let path = require("path");
let bcrypt = require("bcrypt");
let app = express();

let dbpath = path.join(__dirname, "userData.db");
let db = null;
app.use(express.json());
let database = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("iam");
    });
  } catch (e) {
    console.log(`${e.message}`);
    process.exit(1);
  }
};
database();

app.post("/register", async (request, response) => {
  let body = request.body;
  let { username, name, password, gender, location } = body;
  let query1 = `SELECT * FROM user  WHERE username='${username}';`;
  let details = await db.get(query1);
  //console.log(details);
  //console.log(details=== undefined);
  if (details === undefined) {
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      let hashPassword = await bcrypt.hash(password, 10);

      let query2 = `INSERT INTO 
      user (username,name, password,gender,location) 
      VALUES ('${username}','${name}','${hashPassword}','${gender}','${location}');`;
      await db.run(query2);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

//login

app.post("/login", async (request, response) => {
  let body = request.body;
  let { username, password } = body;
  let query1 = `SELECT * FROM user  WHERE username='${username}';`;
  let details = await db.get(query1);
  //console.log(details.length === 0);
  if (details === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    let is_password = await bcrypt.compare(password, details.password);
    if (is_password === true) {
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

app.put("/change-password", async (request, response) => {
  let body = request.body;
  let { username, oldPassword, newPassword } = body;
  let query1 = `SELECT * FROM user  WHERE username='${username}';`;
  let details = await db.get(query1);
  //console.log(details);
  //console.log(details.length === 0);
  if (details === undefined) {
    response.send("Invalid user");
    response.status(400);
  } else {
    let is_password = await bcrypt.compare(oldPassword, details.password);
    if (is_password === true) {
      if (newPassword.length < 5) {
        response.status(400);
        response.send("Password is too short");
      } else {
        let new_password = await bcrypt.hash(newPassword, 12);
        let query2 = `UPDATE user SET password='${new_password}'
      WHERE username='${username}';`;
        await db.run(query2);
        response.status(200);
        response.send("Password updated");
      }
    } else {
      response.status(400);
      response.send("Invalid current password");
    }
  }
});

module.exports = app;
