import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import DashboardSection from '../components/DashboardSection';
import SettingsSection from '../components/SettingsSection';
import axios from 'axios';
import ProfilePicture from '../components/ProfilePicture'; // Assuming this is your ProfilePicture component

const Dashboard = () => {
  const { logout } = useAuth();
  const [content, setContent] = useState('Dashboard');
  const [taskView, setTaskView] = useState('List');
  const [isTaskExpanded, setIsTaskExpanded] = useState(false);
  const [tasks, setTasks] = useState([]); // Ensure tasks are initialized as an array
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [error, setError] = useState(null); // To manage error state
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Ensure response.data.tasks is an array before setting state
      if (Array.isArray(response.data.tasks)) {
        setTasks(response.data.tasks);
      } else {
        console.error('Fetched data is not an array:', response.data);
        setError('Failed to load tasks. Invalid data format.');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
    }
  };

  const handleAddTask = async (newTask) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const response = await axios.post(
        'http://localhost:5000/api/tasks',
        newTask,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks([...tasks, response.data]);
      setTaskView('List');
      setTaskToEdit(null);
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task. Please try again.');
    }
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setTaskView('Create');
  };

  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks(tasks.map((t) => (t._id === taskId ? response.data : t)));
      setTaskView('List');
      setTaskToEdit(null);
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      await axios.put(
        `http://localhost:5000/api/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Optimistic update
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error('Error changing task status:', error);
      setError('Failed to change task status. Please try again.');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const SidebarLink = ({ name, isExpandable = false }) => (
    <button
      onClick={() => {
        setContent(name);
        if (isExpandable) setIsTaskExpanded(!isTaskExpanded);
      }}
      className={`py-2 px-4 w-full text-left ${
        content === name ? 'bg-blue-500 text-white' : 'text-gray-700'
      } hover:bg-blue-400 hover:text-white transition`}
    >
      {name}
    </button>
  );

  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) {
      console.error('tasks is not an array:', tasks);
      return [];
    }
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-white shadow-md h-full flex flex-col">
        <h2 className="text-2xl font-bold text-center my-6 text-blue-600">TASK MANAGER</h2>
        <nav className="flex flex-col items-start space-y-2 px-4">
          <SidebarLink name="Dashboard" />
          <SidebarLink name="Task" isExpandable={true} />
          {isTaskExpanded && (
            <div className="ml-4 space-y-2">
              <button
                onClick={() => setTaskView('List')}
                className={`py-2 px-4 w-full text-left ${
                  taskView === 'List' ? 'bg-blue-500 text-white' : 'text-gray-700'
                } hover:bg-blue-400 hover:text-white transition`}
              >
                List
              </button>
              <button
                onClick={() => {
                  setTaskView('Create');
                  setTaskToEdit(null);
                }}
                className={`py-2 px-4 w-full text-left ${
                  taskView === 'Create' ? 'bg-blue-500 text-white' : 'text-gray-700'
                } hover:bg-blue-400 hover:text-white transition`}
              >
                Create
              </button>
            </div>
          )}
          <SidebarLink name="Settings" />
          <button
            onClick={handleLogout}
            className="mt-auto py-2 px-4 w-full text-left text-red-600 hover:bg-red-500 hover:text-white transition"
          >
            Logout
          </button>
        </nav>
      </div>

      <div className="flex-1 p-8">
        {error && <div className="text-red-600">{error}</div>} {/* Display error message */}
        {content === 'Dashboard' && <DashboardSection />}
        {content === 'Settings' && <SettingsSection />}
        {content === 'Task' && isTaskExpanded && (
          <div>
            {taskView === 'Create' ? (
              <>
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold mb-4">Create Task</h1>
                <ProfilePicture className="w-12 h-12 rounded-full" /> {/* Using ProfilePicture component */}
                </div>
                <TaskForm
                  taskToEdit={taskToEdit}
                  onTaskAdded={handleAddTask}
                  onTaskUpdated={handleUpdateTask}
                />
              </>
            ) : (
              <div className="mt-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold mb-4">Task List</h1>
                  <ProfilePicture className="w-12 h-12 rounded-full" /> {/* Using ProfilePicture component */}
                </div>

                <div className="flex space-x-4 mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="p-2 border rounded w-full"
                  />
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="p-2 border rounded"
                  >
                    <option value="All">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      onEdit={() => handleEditTask(task)}
                      onDelete={() => handleDeleteTask(task._id)}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                ) : (
                  <p>No tasks found.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
