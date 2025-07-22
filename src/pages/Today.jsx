import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import TaskList from "@/components/TaskList";
import { getTodayTasks, updateTodayTasks } from "./Index";
// SubTask would be defined elsewhere if needed
import { format, isToday } from "date-fns";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

const Today = () => {
  // Create local state that mirrors the global todayTasks
  const [localTodayTasks, setLocalTodayTasks] = useState(getTodayTasks());
  
  // Function to generate a unique ID
  const generateId = () => {
    return Date.now().toString();
  };
  
  const addTask = (title, dueDate) => {
    const newTask = {
      id: generateId(),
      title,
      completed: false,
      subtasks: [],
      // Use provided due date or default to today
      dueDate: dueDate || format(new Date(), "yyyy-MM-dd") 
    };
    
    const updatedTasks = [...localTodayTasks, newTask];
    setLocalTodayTasks(updatedTasks);
    
    // Update the shared todayTasks
    updateTodayTasks(updatedTasks);
  };
  
  const addSubtask = (taskId, subtaskTitle) => {
    const newSubtask = {
      id: `sub-${generateId()}`,
      title: subtaskTitle,
      completed: false
    };
    
    const updatedTasks = localTodayTasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: [...(task.subtasks || []), newSubtask]
        };
      }
      return task;
    });
    
    setLocalTodayTasks(updatedTasks);
    updateTodayTasks(updatedTasks);
  };
  
  const toggleTaskComplete = (taskId, completed) => {
    const updatedTasks = localTodayTasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          completed
        };
      }
      return task;
    });
    
    setLocalTodayTasks(updatedTasks);
    updateTodayTasks(updatedTasks);
  };
  
  const toggleSubtaskComplete = (taskId, subtaskId, completed) => {
    const updatedTasks = localTodayTasks.map(task => {
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
    
    setLocalTodayTasks(updatedTasks);
    updateTodayTasks(updatedTasks);
  };
  
  const deleteTask = (taskId) => {
    const updatedTasks = localTodayTasks.filter(task => task.id !== taskId);
    setLocalTodayTasks(updatedTasks);
    updateTodayTasks(updatedTasks);
  };
  
  const deleteSubtask = (taskId, subtaskId) => {
    const updatedTasks = localTodayTasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: (task.subtasks || []).filter(subtask => subtask.id !== subtaskId)
        };
      }
      return task;
    });
    
    setLocalTodayTasks(updatedTasks);
    updateTodayTasks(updatedTasks);
  };
  
  // New function to update task tag
  const updateTaskTag = (taskId, tagName, tagColor) => {
    const updatedTasks = localTodayTasks.map(task => {
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
    
    setLocalTodayTasks(updatedTasks);
    updateTodayTasks(updatedTasks);
  };
  
  // New function to update task due date
  const updateTaskDate = (taskId, date) => {
    const updatedTasks = localTodayTasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          dueDate: date
        };
      }
      return task;
    });
    
    setLocalTodayTasks(updatedTasks);
    updateTodayTasks(updatedTasks);
  };
  
  // Effect to sync with the global todayTasks when they change externally
  useEffect(() => {
    // Update local state from global state to ensure persistence
    setLocalTodayTasks(getTodayTasks());
    
    // Create an interval to check for external updates
    const intervalId = setInterval(() => {
      const currentGlobalTasks = getTodayTasks();
      if (JSON.stringify(localTodayTasks) !== JSON.stringify(currentGlobalTasks)) {
        setLocalTodayTasks(currentGlobalTasks);
      }
    }, 300);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <MainLayout title="Today" taskCount={localTodayTasks.length}>
      <div className="max-w-4xl mx-auto">
        <TaskList 
          title="Today" 
          tasks={localTodayTasks.filter(task => task.dueDate ? isToday(new Date(task.dueDate)) : true)} 
          onAddTask={addTask}
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

export default Today;
