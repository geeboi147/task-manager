import axios from 'axios';

// Assuming token is stored in localStorage or a cookie
const token = localStorage.getItem('token');  // Or wherever you store your token

const createTask = async (taskData) => {
  try {
    const response = await axios.post('http://localhost:5000/tasks', taskData, {
      headers: {
        Authorization: `Bearer ${token}`  // Include the token in the header
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
  }
};

export default createTask;
