// src/components/TaskForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const TaskForm = ({ taskToEdit, onTaskAdded, onTaskUpdated }) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('Not Started'); // New state for status
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || '');
      setDeadline(taskToEdit.deadline ? new Date(taskToEdit.deadline).toISOString().split('T')[0] : '');
      setStatus(taskToEdit.status || 'Not Started'); // Set status if editing an existing task
    }
  }, [taskToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError('You must be logged in to create or update tasks!');
      return;
    }

    const taskData = {
      title,
      description,
      priority,
      deadline: deadline ? new Date(deadline) : null,
      status, // Include status in the task data
    };

    if (taskToEdit) {
      onTaskUpdated(taskToEdit._id, taskData);
    } else {
      onTaskAdded(taskData);
    }

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('');
    setDeadline('');
    setStatus('Not Started'); // Reset status
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      {error && <p className="text-red-600">{error}</p>}
      <div>
        <label className="block text-gray-700 font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          required
          className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
      <div>
        <label className="block text-gray-700 font-medium">Deadline</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
          className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <button
        type="submit"
        className="mt-4 w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {taskToEdit ? 'Update Task' : 'Add Task'}
      </button>
    </form>
  );
};

export default TaskForm;
