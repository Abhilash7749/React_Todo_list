require('dotenv').config();
let express = require('express');
let mySql = require('mysql2');
let bodyParser = require('body-parser');
let cors = require('cors');

let app = express();
app.use(cors());
app.use(bodyParser.json());

let db = mySql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'abhilash@7749',
    database: 'todo_list_db'
})

db.connect(err => {
    if (err) throw err
    console.log('Database Was Connected...')
})

app.get('/tasks', (req, res) => {
    let page = parseInt(req.query.page) || 1
    let limit = parseInt(req.query.limit) || 5
    let offset = (page - 1) * limit
    let totalTasksQuery = 'SELECT COUNT(*) AS total FROM tasks'
    db.query(totalTasksQuery, (err, countResult) => {
        if (err) throw err
        let totalTasks = countResult[0].total

        let sql = 'SELECT * FROM tasks LIMIT ? OFFSET ?'
        db.query(sql, [limit, offset], (err, result) => {
            if (err) throw err
            res.json({ tasks: result, currentPage: page, totalPages: Math.ceil(totalTasks / limit), totalTasks })
        })
    })
})

app.post('/tasks', (req, res) => {
    let { text } = req.body
    let sql = 'INSERT INTO tasks (text, completed) VALUE (?, ?)'
    db.query(sql, [text,false], (err, result) => {
        if (err) throw err
        res.json({
            id: result.insertId,
            text,
            completed: false
        })
    })
})

app.put('/tasks/:id', (req, res) => {
    let id = req.params.id
    let { text, completed } = req.body
    let sql = 'UPDATE tasks SET text = ?, completed = ? WHERE id = ? '
    db.query(sql, [text, completed, id], (err) => {
        if (err) throw err
        res.json({ id, text, completed })
    })
})

app.delete('/tasks/:id', (req, res) => {
    let id = req.params.id
    let sql = 'DELETE FROM tasks WHERE id = ?'
    db.query(sql, [id], (err) => {
        if (err) throw err
        res.json({messege : 'Task deleted'})
    })
})

let port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server listening on Port : ${port}`)
})