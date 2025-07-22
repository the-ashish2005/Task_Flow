import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import TaskList from "@/components/TaskList";
// SubTask would be defined elsewhere if needed
import { 
  format, 
  isToday, 
  isTomorrow, 
  isThisWeek, 
  addDays,
  parseISO
} from "date-fns";
import { loadTasks, saveTasks } from "@/utils/taskUtils";

// Initialize with empty arrays instead of predefined tasks
const initialTodayTasks = [];
const initialTomorrowTasks = [];
const initialWeekTasks = [];
const initialOtherTasks = [];

// Create a global state storage for tasks that persists between component unmounts
let globalTaskState = {
  todayTasks: [...initialTodayTasks],
  tomorrowTasks: [...initialTomorrowTasks],
  weekTasks: [...initialWeekTasks],
  otherTasks: [...initialOtherTasks]
};

// Export getters and setters for the global state
export const getTodayTasks = () => [...globalTaskState.todayTasks];
export const getTomorrowTasks = () => [...globalTaskState.tomorrowTasks];
export const getWeekTasks = () => [...globalTaskState.weekTasks];
export const getOtherTasks = () => [...globalTaskState.otherTasks];

export const updateTodayTasks = (newTasks) => {
  globalTaskState.todayTasks = [...newTasks];
};

export const updateTomorrowTasks = (newTasks) => {
  globalTaskState.tomorrowTasks = [...newTasks];
};

export const updateWeekTasks = (newTasks) => {
  globalTaskState.weekTasks = [...newTasks];
};

export const updateOtherTasks = (newTasks) => {
  globalTaskState.otherTasks = [...newTasks];
};

// For backward compatibility
export let todayTasks = globalTaskState.todayTasks;
export let tomorrowTasks = globalTaskState.tomorrowTasks;
export let weekTasks = globalTaskState.weekTasks;
export let otherTasks = globalTaskState.otherTasks;

// Helper function to classify tasks by due date
export const classifyTaskByDate = (task) => {
  if (!task.dueDate) return 'other'; // Tasks without due date go to "Others" section
  
  const dueDate = parseISO(task.dueDate);
  
  if (isToday(dueDate)) return 'today';
  if (isTomorrow(dueDate)) return 'tomorrow';
  if (isThisWeek(dueDate) && !isToday(dueDate) && !isTomorrow(dueDate)) return 'week';
  return 'other';
};

const Index = () => {
  // Use state to track all tasks
  const [allTasks, setAllTasks] = useState([]);
  
  // Load tasks from localStorage on component mount
  useEffect(() => {
    const storedTasks = loadTasks();
    setAllTasks(storedTasks);
    
    // Classify and update the global task state
    const today = [];
    const tomorrow = [];
    const week = [];
    const other = [];
    
    storedTasks.forEach(task => {
      const category = classifyTaskByDate(task);
      if (category === 'today') today.push(task);
      else if (category === 'tomorrow') tomorrow.push(task);
      else if (category === 'week') week.push(task);
      else other.push(task);
    });
    
    updateTodayTasks(today);
    updateTomorrowTasks(tomorrow);
    updateWeekTasks(week);
    updateOtherTasks(other);
    
    // Listen for task updates from Calendar page
    const handleTasksUpdated = (event) => {
      const updatedTasks = event.detail.tasks;
      setAllTasks(updatedTasks);
      
      // Reclassify tasks
      const updatedToday = [];
      const updatedTomorrow = [];
      const updatedWeek = [];
      const updatedOther = [];
      
      updatedTasks.forEach(task => {
        const category = classifyTaskByDate(task);
        if (category === 'today') updatedToday.push(task);
        else if (category === 'tomorrow') updatedTomorrow.push(task);
        else if (category === 'week') updatedWeek.push(task);
        else updatedOther.push(task);
      });
      
      updateTodayTasks(updatedToday);
      updateTomorrowTasks(updatedTomorrow);
      updateWeekTasks(updatedWeek);
      updateOtherTasks(updatedOther);
    };
    
    window.addEventListener('tasks-updated', handleTasksUpdated);
    
    return () => {
      window.removeEventListener('tasks-updated', handleTasksUpdated);
    };
  }, []);
  
  // Classify tasks by their dates
  const todayTasksFiltered = allTasks.filter(task => classifyTaskByDate(task) === 'today');
  const tomorrowTasksFiltered = allTasks.filter(task => classifyTaskByDate(task) === 'tomorrow');
  const weekTasksFiltered = allTasks.filter(task => classifyTaskByDate(task) === 'week');
  const otherTasksFiltered = allTasks.filter(task => classifyTaskByDate(task) === 'other');
  
  // Function to generate a unique ID
  const generateId = () => {
    return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
  };
  
  // Update all global task arrays based on current classification
  const updateGlobalTasks = (tasks) => {
    const today = [];
    const tomorrow = [];
    const week = [];
    const other = [];
    
    tasks.forEach(task => {
      const category = classifyTaskByDate(task);
      if (category === 'today') today.push(task);
      else if (category === 'tomorrow') tomorrow.push(task);
      else if (category === 'week') week.push(task);
      else other.push(task);
    });
    
    updateTodayTasks(today);
    updateTomorrowTasks(tomorrow);
    updateWeekTasks(week);
    updateOtherTasks(other);
    
    todayTasks = today;
    tomorrowTasks = tomorrow;
    weekTasks = week;
    otherTasks = other;
    
    // Save to local storage for Calendar page
    saveTasks(tasks);
  };
  
  // Add task functions
  const addTodayTask = (title, dueDate) => {
    const newTask = {
      id: generateId(),
      title,
      completed: false,
      subtasks: [],
      dueDate: dueDate || format(new Date(), "yyyy-MM-dd") // Today's date if not provided
    };
    
    const updatedTasks = [...allTasks, newTask];
    setAllTasks(updatedTasks);
    updateGlobalTasks(updatedTasks);
  };
  
  const addTomorrowTask = (title, dueDate) => {
    const newTask = {
      id: generateId(),
      title,
      completed: false,
      subtasks: [],
      dueDate: dueDate || format(addDays(new Date(), 1), "yyyy-MM-dd") // Tomorrow's date if not provided
    };
    
    const updatedTasks = [...allTasks, newTask];
    setAllTasks(updatedTasks);
    updateGlobalTasks(updatedTasks);
  };
  
  const addWeekTask = (title, dueDate) => {
    const newTask = {
      id: generateId(),
      title,
      completed: false,
      subtasks: [],
      dueDate: dueDate || format(addDays(new Date(), 3), "yyyy-MM-dd") // 3 days from now if not provided
    };
    
    const updatedTasks = [...allTasks, newTask];
    setAllTasks(updatedTasks);
    updateGlobalTasks(updatedTasks);
  };
  
  const addOtherTask = (title, dueDate) => {
    // For Other tasks, only set the due date if it was explicitly provided by the user
    const newTask = {
      id: generateId(),
      title,
      completed: false,
      subtasks: [],
      dueDate: dueDate || undefined // Only set due date if explicitly provided
    };
    
    const updatedTasks = [...allTasks, newTask];
    setAllTasks(updatedTasks);
    updateGlobalTasks(updatedTasks);
  };

  // Common function to add subtask to any task
  const addSubtask = (taskId, subtaskTitle) => {
    const newSubtask = {
      id: `sub-${generateId()}`,
      title: subtaskTitle,
      completed: false
    };

    const updatedTasks = allTasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: [...(task.subtasks || []), newSubtask]
        };
      }
      return task;
    });

    setAllTasks(updatedTasks);
    updateGlobalTasks(updatedTasks);
  };

  // Common function to toggle task completion
  const toggleTaskComplete = (taskId, completed) => {
    const updatedTasks = allTasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          completed
        };
      }
      return task;
    });
    
    setAllTasks(updatedTasks);
    updateGlobalTasks(updatedTasks);
  };

  // Common function to toggle subtask completion
  const toggleSubtaskComplete = (taskId, subtaskId, completed) => {
    const updatedTasks = allTasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: (task.subtasks || []).map(subtask => 
            subtask.id === subtaskId
              ? { ...subtask, completed }
              : subtask
          )
        };
      }
      return task;
    });
    
    setAllTasks(updatedTasks);
    updateGlobalTasks(updatedTasks);
  };

  // Common function to delete any task
  const deleteTask = (taskId) => {
    const updatedTasks = allTasks.filter(task => task.id !== taskId);
    setAllTasks(updatedTasks);
    updateGlobalTasks(updatedTasks);
  };

  // Common function to delete any subtask
  const deleteSubtask = (taskId, subtaskId) => {
    const updatedTasks = allTasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: (task.subtasks || []).filter(subtask => subtask.id !== subtaskId)
        };
      }
      return task;
    });
    
    setAllTasks(updatedTasks);
    updateGlobalTasks(updatedTasks);
  };

  // Common function to update task tag
  const updateTaskTag = (taskId, tagName, tagColor) => {
    const updatedTasks = allTasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          tag: {
            name: tagName,
            color: tagColor
          }
        };
      }
      return task;
    });
    
    setAllTasks(updatedTasks);
    updateGlobalTasks(updatedTasks);
  };
  
  // Function to update task due date
  const updateTaskDate = (taskId, date) => {
    const updatedTasks = allTasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          dueDate: date
        };
      }
      return task;
    });
    
    setAllTasks(updatedTasks);
    updateGlobalTasks(updatedTasks);
  };

  return (
    <MainLayout 
      title="Upcoming" 
      taskCount={allTasks.length}
    >
      <div className="max-w-4xl mx-auto">
        <TaskList 
          title="Today" 
          tasks={todayTasksFiltered}
          onAddTask={addTodayTask}
          onAddSubtask={addSubtask}
          onToggleTaskComplete={toggleTaskComplete}
          onToggleSubtaskComplete={toggleSubtaskComplete}
          onDeleteTask={deleteTask}
          onDeleteSubtask={deleteSubtask}
          onUpdateTaskTag={updateTaskTag}
          onUpdateTaskDate={updateTaskDate}
        />
        <TaskList 
          title="Tomorrow" 
          tasks={tomorrowTasksFiltered}
          onAddTask={addTomorrowTask}
          onAddSubtask={addSubtask}
          onToggleTaskComplete={toggleTaskComplete}
          onToggleSubtaskComplete={toggleSubtaskComplete}
          onDeleteTask={deleteTask}
          onDeleteSubtask={deleteSubtask}
          onUpdateTaskTag={updateTaskTag}
          onUpdateTaskDate={updateTaskDate}
        />
        <TaskList 
          title="This Week" 
          tasks={weekTasksFiltered}
          onAddTask={addWeekTask}
          onAddSubtask={addSubtask}
          onToggleTaskComplete={toggleTaskComplete}
          onToggleSubtaskComplete={toggleSubtaskComplete}
          onDeleteTask={deleteTask}
          onDeleteSubtask={deleteSubtask}
          onUpdateTaskTag={updateTaskTag}
          onUpdateTaskDate={updateTaskDate}
        />
        <TaskList 
          title="Others" 
          tasks={otherTasksFiltered}
          onAddTask={addOtherTask}
          onAddSubtask={addSubtask}
          onToggleTaskComplete={toggleTaskComplete}
          onToggleSubtaskComplete={toggleSubtaskComplete}
          onDeleteTask={deleteTask}
          onDeleteSubtask={deleteSubtask}
          onUpdateTaskTag={updateTaskTag}
          onUpdateTaskDate={updateTaskDate}
        />
      </div>
    </MainLayout>
  );
};

export default Index;
