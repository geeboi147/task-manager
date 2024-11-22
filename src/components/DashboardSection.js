import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DashboardSection = () => {
  const { currentUser } = useAuth();
  const [taskCount, setTaskCount] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [latestTask, setLatestTask] = useState(null);
  const [taskNearDeadline, setTaskNearDeadline] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Fetch task data and summarize
  const fetchTaskSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedTasks = response.data.tasks; // Ensure you're accessing the tasks array
      setTasks(fetchedTasks);

      // Recalculate counts after task update
      setTaskCount(fetchedTasks.length);
      setCompletedTasks(fetchedTasks.filter(task => task.status === 'Completed').length);
      setPendingTasks(fetchedTasks.filter(task => task.status !== 'Completed').length);

      if (fetchedTasks.length > 0) {
        // Find the latest task
        setLatestTask(fetchedTasks[0]);  // Assuming the first task in the list is the latest one

        // Find the task nearing deadline (the one with the closest upcoming deadline)
        const nearestDeadlineTask = fetchedTasks
          .filter(task => task.deadline)  // Ensure deadline exists
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];  // Sort tasks by deadline
        setTaskNearDeadline(nearestDeadlineTask);
      } else {
        setLatestTask(null);
        setTaskNearDeadline(null);
      }
    } catch (error) {
      console.error('Error fetching task summary:', error);
    }
  };

  // Trigger fetch when component mounts
  useEffect(() => {
    fetchTaskSummary();
  }, []); // No dependencies here to avoid unnecessary re-renders

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistically update the task status locally
    const updatedTasks = tasks.map((task) =>
      task._id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);

    // Update counts directly after status change
    setCompletedTasks(updatedTasks.filter(task => task.status === 'Completed').length);
    setPendingTasks(updatedTasks.filter(task => task.status !== 'Completed').length);

    // Update the status on the server
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.put(
        `http://localhost:5000/api/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Fetch latest data after a successful update to ensure accuracy
      fetchTaskSummary();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-100 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-700">Total Tasks</h3>
          <p className="text-3xl font-bold text-blue-600">{taskCount}</p>
        </div>

        <div className="bg-green-100 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-700">Completed Tasks</h3>
          <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
        </div>

        <div className="bg-yellow-100 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-700">Pending Tasks</h3>
          <p className="text-3xl font-bold text-yellow-600">{pendingTasks}</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-700">
          Welcome Back, {currentUser?.username || 'User'}!
        </h3>
        <p className="mt-2 text-gray-600">
          Keep up the good work! Here’s a summary of your tasks so far.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-700">Latest Task</h3>
          {latestTask ? (
            <>
              <p className="text-gray-600 mt-2">Title: {latestTask.title}</p>
              <p className="text-gray-600 mt-1">Status: {latestTask.status}</p>
              <button
                onClick={() => handleStatusChange(latestTask._id, latestTask.status === 'Completed' ? 'Pending' : 'Completed')}
                className="mt-2 text-blue-600"
              >
                Mark as {latestTask.status === 'Completed' ? 'Pending' : 'Completed'}
              </button>
            </>
          ) : (
            <p>No tasks available.</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-700">Task Nearing Deadline</h3>
          {taskNearDeadline ? (
            <>
              <p className="text-gray-600 mt-2">Title: {taskNearDeadline.title}</p>
              <p className="text-gray-600 mt-1">Deadline: {new Date(taskNearDeadline.deadline).toLocaleDateString()}</p>
            </>
          ) : (
            <p>No tasks near the deadline.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;
