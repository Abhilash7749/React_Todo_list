import React, { useEffect, useState } from 'react'
import './TodoList.css'
let API = 'http://localhost:5000/tasks'

const TodoList = () => {

    const [newTask, setNewTask] = useState('');
    const [tasks, setTasks] = useState([]);
    const [editId, setEditId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const limit = 5

    function inputTask(e) {
        setNewTask(e.target.value)
    }

    useEffect(() => {
        async function loadTask() {
            try {
                let res = await fetch(`${API}?page=${currentPage}&limit=${limit}`)
                let data = await res.json()
                setTasks(data.tasks)
                setTotalPages(data.totalPages)
            } catch (err) {
                console.log('Error fetching todos', err)
            }
        }
        loadTask()

    }, [currentPage])

    const addTask = async () => {
        if (newTask.trim() === '') return false
        if (editId !== null) {
            let res = await fetch(`${API}/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newTask, completed:false })
            })
            let data = await res.json()
            setTasks(tasks.map((task) =>
                task.id === editId ? { ...task, text: data.text } : task))
            setEditId(null)
        } else {
            let res = await fetch(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newTask, completed: false })
            })
            let data = await res.json()
            setTasks([...tasks, data])
        }
        setNewTask('')
    }
    const isCompleted = async (id, completed, text) => {
        let res = await fetch(`${API}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({text, completed : !completed })
        })
        let data = await res.json()
        setTasks(tasks.map((task)=> task.id === id ? {...task,completed:data.completed} : task ))
    }
    const deleteTask = async (id) => {
        await fetch(`${API}/${id}`,{method : 'DELETE'})
        setTasks(tasks.filter((task) => task.id !== id))
    }

    function prevBtn() {
        if(currentPage > 1)  setCurrentPage(currentPage - 1)
    }
    function nextBtn() {
        if(currentPage < totalPages)  setCurrentPage(currentPage + 1)
    }

    const completeCount = tasks.filter(task=> task.completed).length
    const unCompleteCount = tasks.length - completeCount



    return (
        <div className='container'>
            <h1>To Do List</h1>
            <div className="input-list">
                <input type="text" className='input-task' value={newTask} onChange={inputTask} />
                <button className='addBtn' onClick={addTask} >{editId !== null ? 'Update' : 'Add'}</button>
            </div>
            <div className="todo-list">
                <ul>
                    {tasks.map((task) =>
                        <li key={task.id}>
                            <div className='task'>
                                <input type="checkbox" checked={task.completed} onChange={() => isCompleted(task.id, task.completed, task.text)} />
                                <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>{task.text}</span>
                            </div>
                            <div className='btn'>
                                <button style={{ display: task.completed ? 'none' : '' }} onClick={() => { setNewTask(task.text); setEditId(task.id) }}>Edit</button>
                                <button onClick={() => deleteTask(task.id)}>Delete</button>
                            </div>
                        </li>
                    )}
                </ul>
                <hr />
                <div className="para">
                    <p>Completed : {completeCount} </p>
                    <p>Uncompleted : {unCompleteCount}</p>
                </div>
                <div className="pagination">
                    <button className='prev' onClick={prevBtn}>⬅</button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button className='prev' onClick={nextBtn}>➡</button>
                </div>
            </div>
        </div>

    )
}

export default TodoList