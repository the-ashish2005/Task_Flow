import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import TaskList from "@/components/TaskList";

// SubTask would be defined elsewhere if needed
import { useToast } from "@/hooks/use-toast";
import { getAllTags, urlToTagName } from "../utils/tagUtils";
import { loadTasks, saveTasks } from "@/utils/taskUtils";
import { format } from "date-fns";

const TagList = () => {
  const { tagName } = useParams();
  const { toast } = useToast();
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [tagInfo, setTagInfo] = useState({ 
    displayName: "Default", 
    color: "tag-yellow" 
  });
  
  // Function to get the display name and color from the URL param
  useEffect(() => {
    const updateTagInfo = () => {
      if (!tagName) return;
      
      const decodedTagName = urlToTagName(tagName);
      const allTags = getAllTags();
      
      const foundTag = allTags.find(tag => 
        tag.name.toLowerCase() === decodedTagName.toLowerCase()
      );
      
      if (foundTag) {
        setTagInfo({
          displayName: foundTag.name,
          color: foundTag.color
        });
      } else {
        // Fallback to default if tag not found
        setTagInfo({
          displayName: "Default",
          color: "tag-yellow"
        });
      }
    };
    
    updateTagInfo();
  }, [tagName]);
  
  // Update filtered tasks based on tag
  useEffect(() => {
    const updateTaggedTasks = () => {
      if (!tagName) return;
      
      const decodedTagName = urlToTagName(tagName);
      
      // Get all tasks from localStorage instead of global state
      const allTasks = loadTasks();
      
      const filtered = allTasks.filter(task => 
        task.tag?.name.toLowerCase() === decodedTagName.toLowerCase()
      );
      
      setFilteredTasks(filtered);
    };
    
    updateTaggedTasks();
    
    // Listen for task updates from other components
    const handleTasksUpdated = () => {
      updateTaggedTasks();
    };
    
    window.addEventListener('tasks-updated', handleTasksUpdated);
    
    return () => {
      window.removeEventListener('tasks-updated', handleTasksUpdated);
    };
  }, [tagName]);

  // Function to generate a unique ID
  const generateId = () => {
    return Date.now().toString();
  };

  // Helper function to update localStorage and trigger global updates
  const updateAllTasks = (updatedTasks) => {
    saveTasks(updatedTasks);
    // Trigger update in the Index page by dispatching custom event
    window.dispatchEvent(new CustomEvent('tasks-updated', { detail: { tasks: updatedTasks } }));
  };

  // Add a new task with the current tag
  const addTask = (title) => {
    // By default, add to today's tasks with today's date
    const today = new Date();
    const newTask = {
      id: generateId(),
      title,
      completed: false,
      subtasks: [],
      dueDate: format(today, "yyyy-MM-dd"),
      tag: {
        name: tagInfo.displayName,
        color: tagInfo.color
      }
    };
    
    // Add to localStorage
    const allStoredTasks = loadTasks();
    const allUpdatedTasks = [...allStoredTasks, newTask];
    updateAllTasks(allUpdatedTasks);
    
    toast({
      title: "Task added",
      description: `"${title}" has been added to ${tagInfo.displayName} list`,
    });
  };

  // Operations for subtasks
  const addSubtask = (taskId, subtaskTitle) => {
    const newSubtask = {
      id: `sub-${generateId()}`,
      title: subtaskTitle,
      completed: false
    };
    
    const allStoredTasks = loadTasks();
    const updatedStoredTasks = allStoredTasks.map(task => 
      task.id === taskId 
        ? { ...task, subtasks: [...(task.subtasks || []), newSubtask] }
        : task
    );
    updateAllTasks(updatedStoredTasks);
  };

  const toggleTaskComplete = (taskId, completed) => {
    const allStoredTasks = loadTasks();
    const updatedStoredTasks = allStoredTasks.map(task => 
      task.id === taskId ? { ...task, completed } : task
    );
    updateAllTasks(updatedStoredTasks);
  };

  const toggleSubtaskComplete = (taskId, subtaskId, completed) => {
    const allStoredTasks = loadTasks();
    const updatedStoredTasks = allStoredTasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            subtasks: (task.subtasks || []).map(subtask => 
              subtask.id === subtaskId ? { ...subtask, completed } : subtask
            )
          }
        : task
    );
    updateAllTasks(updatedStoredTasks);
  };

  const deleteTask = (taskId) => {
    const allStoredTasks = loadTasks();
    const updatedStoredTasks = allStoredTasks.filter(task => task.id !== taskId);
    updateAllTasks(updatedStoredTasks);
    
    toast({
      title: "Task deleted",
      description: `Task has been removed from ${tagInfo.displayName} list`,
    });
  };

  const deleteSubtask = (taskId, subtaskId) => {
    const allStoredTasks = loadTasks();
    const updatedStoredTasks = allStoredTasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            subtasks: (task.subtasks || []).filter(subtask => subtask.id !== subtaskId)
          }
        : task
    );
    updateAllTasks(updatedStoredTasks);
  };

  // Update task tag
  const updateTaskTag = (taskId, tagName, tagColor) => {
    const allStoredTasks = loadTasks();
    const updatedStoredTasks = allStoredTasks.map(task => 
      task.id === taskId 
        ? { ...task, tag: { name: tagName, color: tagColor } }
        : task
    );
    updateAllTasks(updatedStoredTasks);
  };
  
  // Add the missing updateTaskDate function
  const updateTaskDate = (taskId, date) => {
    const allStoredTasks = loadTasks();
    const updatedStoredTasks = allStoredTasks.map(task => 
      task.id === taskId ? { ...task, dueDate: date } : task
    );
    updateAllTasks(updatedStoredTasks);
    
    toast({
      title: "Due date updated",
      description: `Due date for task set to ${format(new Date(date), "MMM dd, yyyy")}`,
    });
  };

  return (
    <MainLayout title={tagInfo.displayName} taskCount={filteredTasks.length}>
      <div className="max-w-4xl mx-auto">
        <TaskList 
          title={`${tagInfo.displayName} Tasks`} 
          tasks={filteredTasks} 
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

export default TagList;
