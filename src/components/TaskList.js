// src/components/TaskList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TaskList = () => {
    const [tasks, setTasks] = useState([]); // State to hold tasks
    const [task, setTask] = useState({ title: '', description: '', priority: '', deadline: '' }); // Task form state

    // Fetch tasks from backend when component mounts
    useEffect(() => {
        axios.get('http://localhost:5000/api/tasks')
            .then(response => {
                setTasks(response.data); // Set tasks in state
            })
            .catch(err => {
                console.error('Error fetching tasks:', err);
            });
    }, []); // Empty dependency array ensures it runs once on mount

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Send task to backend
            await axios.post('http://localhost:5000/api/tasks', task);
            alert('Task added successfully');
            setTask({ title: '', description: '', priority: '', deadline: '' });  // Clear the form
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Error adding task: ' + error.response?.data?.message);
        }
    };

    return (
        <div>
            <h1>Task List</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Title"
                    value={task.title}
                    onChange={(e) => setTask({ ...task, title: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={task.description}
                    onChange={(e) => setTask({ ...task, description: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Priority"
                    value={task.priority}
                    onChange={(e) => setTask({ ...task, priority: e.target.value })}
                />
                <input
                    type="date"
                    placeholder="Deadline"
                    value={task.deadline}
                    onChange={(e) => setTask({ ...task, deadline: e.target.value })}
                />
                <button type="submit">Add Task</button>
            </form>

            <ul>
                {tasks.map((task) => (
                    <li key={task._id}>
                        {task.title} - Priority: {task.priority}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskList;
