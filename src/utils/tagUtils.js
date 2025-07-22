
import { getTodayTasks, getTomorrowTasks, getWeekTasks, updateTodayTasks, updateTomorrowTasks, updateWeekTasks } from "../pages/Index";

// Define tag type

// Default system tags
export const defaultTags = [
  { name: "Personal", color: "tag-red" },
  { name: "Work", color: "tag-blue" },
  { name: "Default", color: "tag-yellow" }
];

// Key for storing custom tags in localStorage
const CUSTOM_TAGS_KEY = "taskflow_custom_tags";

// Get all tags (default + custom)
export const getAllTags = () => {
  const storedTags = localStorage.getItem(CUSTOM_TAGS_KEY);
  const customTags = storedTags ? JSON.parse(storedTags) : [];
  
  return [...defaultTags, ...customTags];
};

// Get only custom tags
export const getCustomTags = () => {
  const storedTags = localStorage.getItem(CUSTOM_TAGS_KEY);
  return storedTags ? JSON.parse(storedTags) : [];
};

// Add a new custom tag
export const addCustomTag = (name, color) => {
  const customTags = getCustomTags();
  
  // Check if tag with same name already exists
  if (defaultTags.some(tag => tag.name.toLowerCase() === name.toLowerCase()) || 
      customTags.some(tag => tag.name.toLowerCase() === name.toLowerCase())) {
    return false;
  }
  
  customTags.push({ name, color });
  localStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(customTags));
  return true;
};

// Delete a custom tag
export const deleteCustomTag = (name) => {
  // Default tags cannot be deleted
  if (defaultTags.some(tag => tag.name === name)) {
    return false;
  }
  
  const customTags = getCustomTags();
  const updatedTags = customTags.filter(tag => tag.name !== name);
  localStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(updatedTags));
  
  // Update all tasks that have this tag to use the "Default" tag
  updateTasksWithDeletedTag(name);
  
  return true;
};

// Helper function to update tasks when a tag is deleted
const updateTasksWithDeletedTag = (deletedTagName) => {
  const defaultTag = defaultTags.find(tag => tag.name === "Default");
  
  // Update today's tasks
  const todayTasks = getTodayTasks();
  const updatedTodayTasks = todayTasks.map(task => {
    if (task.tag?.name === deletedTagName) {
      return { ...task, tag: defaultTag };
    }
    return task;
  });
  updateTodayTasks(updatedTodayTasks);
  
  // Update tomorrow's tasks
  const tomorrowTasks = getTomorrowTasks();
  const updatedTomorrowTasks = tomorrowTasks.map(task => {
    if (task.tag?.name === deletedTagName) {
      return { ...task, tag: defaultTag };
    }
    return task;
  });
  updateTomorrowTasks(updatedTomorrowTasks);
  
  // Update week's tasks
  const weekTasks = getWeekTasks();
  const updatedWeekTasks = weekTasks.map(task => {
    if (task.tag?.name === deletedTagName) {
      return { ...task, tag: defaultTag };
    }
    return task;
  });
  updateWeekTasks(updatedWeekTasks);
};

// Get tag by name
export const getTagByName = (name) => {
  const allTags = getAllTags();
  return allTags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
};

// Convert tag name to URL-friendly format
export const tagNameToUrl = (name) => {
  return name.toLowerCase().replace(/\s+/g, '-');
};

// Convert URL format back to tag name
export const urlToTagName = (url) => {
  const allTags = getAllTags();
  const matchedTag = allTags.find(tag => 
    tagNameToUrl(tag.name) === url.toLowerCase()
  );
  return matchedTag?.name || url;
};
