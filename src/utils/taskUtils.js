
import { format } from "date-fns";


// Local storage key for tasks
const TASKS_STORAGE_KEY = 'calendar_tasks';

// Load tasks from storage or return empty array
export const loadTasks = () => {
  try {
    const tasksString = localStorage.getItem(TASKS_STORAGE_KEY);
    return tasksString ? JSON.parse(tasksString) : [];
  } catch (error) {
    console.error('Failed to load tasks from storage:', error);
    return [];
  }
};

// Save tasks to storage
export const saveTasks = (tasks) => {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    
    // Dispatch a custom event to notify other components about task changes
    window.dispatchEvent(new CustomEvent('tasks-updated', { detail: { tasks } }));
  } catch (error) {
    console.error('Failed to save tasks to storage:', error);
  }
};

// Get tasks for a specific date
export const getTasksForDate = (tasks, date) => {
  const formattedDate = format(date, "yyyy-MM-dd");
  return tasks.filter(task => task.dueDate === formattedDate);
};

// Get all dates that have tasks
export const getDatesWithTasks = (tasks) => {
  return [...new Set(tasks.filter(task => task.dueDate).map(task => task.dueDate))];
};

// Add a new task
export const addTask = (tasks, title, date, tag) => {
  const newTask = {
    id: crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`,
    title,
    completed: false,
    dueDate: format(date, "yyyy-MM-dd"),
    tag
  };
  
  const updatedTasks = [...tasks, newTask];
  saveTasks(updatedTasks);
  return updatedTasks;
};

// Update an existing task
export const updateTask = (tasks, taskId, updates) => {
  const updatedTasks = tasks.map(task => 
    task.id === taskId ? { ...task, ...updates } : task
  );
  
  saveTasks(updatedTasks);
  return updatedTasks;
};

// Delete a task
export const deleteTask = (tasks, taskId) => {
  const updatedTasks = tasks.filter(task => task.id !== taskId);
  saveTasks(updatedTasks);
  return updatedTasks;
};

// Get all tasks (for global synchronization)
export const getAllTasks = () => {
  return loadTasks();
};

// Sync local tasks with global storage
export const syncWithGlobalTasks = (tasks) => {
  saveTasks(tasks);
};

