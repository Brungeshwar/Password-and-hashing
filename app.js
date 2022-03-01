let express = require("express");
let sqlite3 = require("sqlite3");
let { open } = require("sqlite");
let path = require("path");
let app = express();

let dbpath = path.join(__dirname, "todoApplication.db");
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
    proccess.exit(1);
  }
};
database();

app.get("/todos/", async (request, response) => {
  try {
    let { priority, status, search_q = "" } = request.query;
    let query = "";
    if (priority !== undefined && status !== undefined) {
      query = `SELECT * FROM todo
        WHERE priority='${priority}' AND status='${status}' AND todo LIKE '%${search_q}%';`;
    } else if (priority === undefined && status !== undefined) {
      query = `SELECT * FROM todo
        WHERE status='${status}' AND todo LIKE '%${search_q}%';`;
    } else if (priority !== undefined && status === undefined) {
      query = `SELECT * FROM todo
        WHERE priority='${priority}' AND todo LIKE '%${search_q}%';`;
    } else {
      query = `SELECT * FROM todo
        WHERE todo LIKE '%${search_q}%';`;
    }
    let ans = await db.all(query);

    response.send(ans);
  } catch (e) {
    console.log(e.message);
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  try {
    let paraId = request.params;
    //console.log(paraId);
    let query = `SELECT * FROM todo
        WHERE id=${paraId.todoId};`;
    let ans = await db.get(query);
    response.send(ans);
  } catch (e) {
    console.log(e.message);
  }
});

app.post("/todos/", async (request, response) => {
  try {
    let body = request.body;
    let { id, todo, priority, status } = body;
    //console.log(paraId);
    let query = `INSERT INTO todo ( id,todo,priority,status)
     VALUES (${id},'${todo}','${priority}','${status}')`;
    let ans = await db.run(query);
    response.send("Todo Successfully Added");
  } catch (e) {
    console.log(e.message);
  }
});

app.put("/todos/:todoId/", async (request, response) => {
  try {
    let paraId = request.params;
    let { status, priority, todo = "" } = request.body;
    //console.log(request.body);
    //console.log(paraId);
    let query = "";
    if (priority !== undefined && status !== undefined) {
      query = `UPDATE todo
        SET priority='${priority}',
            status='${status}',
            todo = '${status}'
        WHERE id=${paraId.todoId};`;
      await db.run(query);
      response.send("Updated");
    } else if (priority === undefined && status !== undefined) {
      query = `UPDATE todo
        SET status='${status}',
            todo ='${todo}'
        WHERE id=${paraId.todoId};`;
      await db.run(query);
      response.send("Status Updated");
    } else if (priority !== undefined && status === undefined) {
      query = `UPDATE todo
        SET priority='${priority}',
            todo= '${todo}'
        WHERE id=${paraId.todoId};`;
      await db.run(query);
      response.send("Priority Updated");
    } else {
      query = `UPDATE todo
        SET todo = '${todo}'
        WHERE id=${paraId.todoId};`;
      await db.run(query);
      response.send("Todo Updated");
    }
  } catch (e) {
    console.log(e.message);
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  try {
    let paraId = request.params;
    //console.log(paraId);
    let query = `DELETE FROM todo
        WHERE id=${paraId.todoId};`;
    await db.run(query);
    response.send("Todo Deleted");
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = app;
