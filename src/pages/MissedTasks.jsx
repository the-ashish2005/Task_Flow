import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import TaskList from "@/components/TaskList";
// SubTask would be defined elsewhere if needed
import { format, isBefore, parseISO, startOfDay } from "date-fns";
import { loadTasks, saveTasks } from "@/utils/taskUtils";

const MissedTasks = () => {
  // Filter to get only missed tasks (past due date and not completed)
  const getMissedTasks = () => {
    const allTasks = loadTasks();
    const today = startOfDay(new Date());
    
    return allTasks.filter(task => 
      !task.completed && 
      task.dueDate && 
      isBefore(parseISO(task.dueDate), today)
    );
  };
  
  // Create local state for missed tasks
  const [missedTasks, setMissedTasks] = useState(getMissedTasks());
  
  // Function to generate a unique ID
  const generateId = () => {
    return Date.now().toString();
  };
  
  // Helper function to update all tasks and emit event
  const updateAllTasks = (updatedTasks) => {
    saveTasks(updatedTasks);
    window.dispatchEvent(new CustomEvent('tasks-updated'));
  };
  
  // Add subtask to a task
  const addSubtask = (taskId, subtaskTitle) => {
    const newSubtask = {
      id: `sub-${generateId()}`,
      title: subtaskTitle,
      completed: false
    };
    
    const allTasks = loadTasks();
    const updatedTasks = allTasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: [...(task.subtasks || []), newSubtask]
        };
      }
      return task;
    });
    
    updateAllTasks(updatedTasks);
    setMissedTasks(getMissedTasks());
  };
  
  // Toggle task completion
  const toggleTaskComplete = (taskId, completed) => {
    const allTasks = loadTasks();
    const updatedTasks = allTasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          completed
        };
      }
      return task;
    });
    
    updateAllTasks(updatedTasks);
    setMissedTasks(getMissedTasks());
  };
  
  // Toggle subtask completion
  const toggleSubtaskComplete = (taskId, subtaskId, completed) => {
    const allTasks = loadTasks();
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
    
    updateAllTasks(updatedTasks);
    setMissedTasks(getMissedTasks());
  };
  
  // Delete a task
  const deleteTask = (taskId) => {
    const allTasks = loadTasks();
    const updatedTasks = allTasks.filter(task => task.id !== taskId);
    
    updateAllTasks(updatedTasks);
    setMissedTasks(getMissedTasks());
  };
  
  // Delete a subtask
  const deleteSubtask = (taskId, subtaskId) => {
    const allTasks = loadTasks();
    const updatedTasks = allTasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: (task.subtasks || []).filter(subtask => subtask.id !== subtaskId)
        };
      }
      return task;
    });
    
    updateAllTasks(updatedTasks);
    setMissedTasks(getMissedTasks());
  };
  
  // Update task tag
  const updateTaskTag = (taskId, tagName, tagColor) => {
    const allTasks = loadTasks();
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
    
    updateAllTasks(updatedTasks);
    setMissedTasks(getMissedTasks());
  };
  
  // Update task due date
  const updateTaskDate = (taskId, date) => {
    const allTasks = loadTasks();
    const updatedTasks = allTasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          dueDate: date
        };
      }
      return task;
    });
    
    updateAllTasks(updatedTasks);
    setMissedTasks(getMissedTasks());
  };
  
  // Effect to sync with global tasks when they change
  useEffect(() => {
    const refreshMissedTasks = () => {
      setMissedTasks(getMissedTasks());
    };
    
    // Listen for task updates from other components
    const handleTasksUpdated = () => {
      refreshMissedTasks();
    };
    
    window.addEventListener('tasks-updated', handleTasksUpdated);
    
    return () => {
      window.removeEventListener('tasks-updated', handleTasksUpdated);
    };
  }, []);
  
  return (
    <MainLayout title="Missed Tasks" taskCount={missedTasks.length}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            These tasks have passed their due date and need your attention. 
            Mark them as complete or reschedule them to a new date.
          </p>
        </div>
        <TaskList 
          title="Missed Tasks" 
          tasks={missedTasks}
          onAddTask={() => {}} // No add task functionality for missed tasks
          onAddSubtask={addSubtask}
          onToggleTaskComplete={toggleTaskComplete}
          onToggleSubtaskComplete={toggleSubtaskComplete}
          onDeleteTask={deleteTask}
          onDeleteSubtask={deleteSubtask}
          onUpdateTaskTag={updateTaskTag}
          onUpdateTaskDate={updateTaskDate}
          className="border-red-200 bg-red-50/30"
          titleClassName="text-red-600"
          disableAddTask={true}
        />
      </div>
    </MainLayout>
  );
};

export default MissedTasks;
