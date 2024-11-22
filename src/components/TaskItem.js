import React from 'react';
import axios from 'axios';

const TaskItem = ({ task, onDelete, onEdit, onStatusChange }) => {
  const formattedDeadline = task.deadline
    ? new Date(task.deadline).toLocaleDateString()
    : 'No deadline';

  const priorityColor =
    task.priority === 'High' ? 'text-red-500' :
    task.priority === 'Medium' ? 'text-yellow-500' : 'text-green-500';

  const statusColor =
    task.status === 'Completed' ? 'text-green-500' :
    task.status === 'In Progress' ? 'text-yellow-500' : 'text-red-500';

  const handleMarkAsCompleted = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.put(
        `http://localhost:5000/api/tasks/${task._id}`,
        { status: 'Completed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 && typeof onStatusChange === 'function') {
        onStatusChange(task._id, 'Completed');
      }
    } catch (error) {
      console.error('Error marking task as completed:', error);
    }
  };

  return (
    <div className="task-item p-4 mb-4 bg-white shadow-md rounded-lg border border-gray-200 hover:shadow-lg transition duration-300">
      <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
      <p className="text-gray-600">{task.description}</p>

      <div className="mt-2">
        <span className="text-gray-500 font-medium">Priority: </span>
        <span className={priorityColor}>
          {task.priority}
        </span>
      </div>

      <div className="mt-2">
        <span className="text-gray-500 font-medium">Deadline: </span>
        <span className="text-gray-600">{formattedDeadline}</span>
      </div>

      <div className="mt-2">
        <span className="text-gray-500 font-medium">Status: </span>
        <span className={statusColor}>
          {task.status}
        </span>
      </div>

      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={() => onEdit(task)}
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-500 focus:outline-none"
        >
          Edit
        </button>

        {task.status !== 'Completed' && (
          <button
            onClick={handleMarkAsCompleted}
            className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-500 focus:outline-none"
          >
            Mark as Completed
          </button>
        )}

        <button
          onClick={() => onDelete(task._id)}
          className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-500 focus:outline-none"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
