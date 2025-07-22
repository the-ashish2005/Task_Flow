import React, { useState, useEffect } from "react";
import { 
  Search, 
  ChevronRight, 
  List, 
  Calendar, 
  StickyNote, 
  Plus, 
  Settings, 
  LogOut,
  Menu as MenuIcon,
  Tag,
  Edit,
  AlarmClock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
// Task type would be defined elsewhere
import { loadTasks } from "@/utils/taskUtils";
import { classifyTaskByDate } from "../pages/Index";
import TagManagementModal from "./TagManagementModal";
import { getAllTags, addCustomTag, deleteCustomTag, tagNameToUrl } from "../utils/tagUtils";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { isBefore, parseISO, startOfDay } from "date-fns";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// SidebarProps: { isCollapsed: boolean, setIsCollapsed: function }

// Helper function to get tasks by tag
const getTasksByTag = (tagName) => {
  const allTasks = loadTasks();
  
  return allTasks.filter(task => 
    task.tag?.name.toLowerCase() === tagName.toLowerCase()
  );
};

// Helper function to get missed tasks (past due date and not completed)
const getMissedTasks = () => {
  const allTasks = loadTasks();
  const today = startOfDay(new Date());
  
  return allTasks.filter(task => 
    !task.completed && 
    task.dueDate && 
    isBefore(parseISO(task.dueDate), today)
  );
};

// Helper function to get today's tasks
const getTodayTasksFromStorage = () => {
  const allTasks = loadTasks();
  return allTasks.filter(task => classifyTaskByDate(task) === 'today');
};

// Helper function to get tag color CSS
const getTagColorStyle = (colorValue) => {
  // Handle tag-* format (convert to CSS variable)
  if (colorValue.startsWith('tag-')) {
    return { backgroundColor: `var(--${colorValue})` };
  }
  
  // Handle legacy color names
  switch (colorValue) {
    case 'personal': return { backgroundColor: 'var(--tag-red)' };
    case 'work': return { backgroundColor: 'var(--tag-blue)' };
    case 'default': return { backgroundColor: 'var(--tag-yellow)' };
    default: return { backgroundColor: colorValue }; // Direct color value
  }
};

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const { toast } = useToast();
  const [tagCounts, setTagCounts] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [missedTasksCount, setMissedTasksCount] = useState(0);
  
  // Update task counts based on tags and missed tasks
  useEffect(() => {
    const updateTagCounts = () => {
      const allTags = getAllTags();
      setTags(allTags);
      
      const counts = {};
      allTags.forEach(tag => {
        counts[tag.name] = getTasksByTag(tag.name).length;
      });
      
      setTagCounts(counts);
      
      // Update missed tasks count
      setMissedTasksCount(getMissedTasks().length);
    };
    
    updateTagCounts();
    
    // Listen for task updates from other components
    const handleTasksUpdated = () => {
      updateTagCounts();
    };
    
    window.addEventListener('tasks-updated', handleTasksUpdated);
    
    return () => {
      window.removeEventListener('tasks-updated', handleTasksUpdated);
    };
  }, []);
  
  // Handle adding a new tag
  const handleAddTag = (name, color) => {
    const success = addCustomTag(name, color);
    if (success) {
      // Update the tags state
      setTags(getAllTags());
    }
  };
  
  // Handle deleting a tag
  const handleDeleteTag = (name) => {
    const success = deleteCustomTag(name);
    if (success) {
      // Update the tags state
      setTags(getAllTags());
      toast({
        title: "Tag deleted",
        description: `The tag "${name}" has been deleted and its tasks reassigned to Default`
      });
    }
  };
  
  return (
    <div className={cn(
      "bg-background h-screen transition-all duration-300 border-r border-border shadow-sm fixed top-0 left-0 z-30 flex flex-col",
      isCollapsed ? "w-0 overflow-hidden" : "w-[320px]"
    )}>
      <div className="p-5 flex items-center justify-between border-b border-border">
        <h1 className="text-xl font-bold text-primary">TaskFlow</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(true)}
          className="h-8 w-8 rounded-full hover:bg-muted"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full rounded-md border border-input pl-9 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring bg-muted text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        {/* Tasks Section */}
        <div className="p-4">
          <h2 className="text-xs font-semibold text-muted-foreground mb-3 px-3">TASKS</h2>
          <div className="space-y-1">
            <SidebarItem 
              to="/" 
              icon={<ChevronRight className="w-4 h-4" />} 
              label="Upcoming" 
              count={loadTasks().length} 
              active={location.pathname === '/'} 
            />
            <SidebarItem 
              to="/today" 
              icon={<List className="w-4 h-4" />} 
              label="Today" 
              count={getTodayTasksFromStorage().length} 
              active={location.pathname === '/today'}
            />
            {/* Missed Tasks section */}
            <SidebarItem 
              to="/missed-tasks" 
              icon={<AlarmClock className="w-4 h-4" />} 
              label="Missed Tasks" 
              count={missedTasksCount} 
              active={location.pathname === '/missed-tasks'}
              className={missedTasksCount > 0 ? "text-red-600" : ""}
            />
            <SidebarItem 
              to="/calendar" 
              icon={<Calendar className="w-4 h-4" />} 
              label="Calendar" 
              active={location.pathname === '/calendar'}
            />
            <SidebarItem 
              to="/sticky-wall" 
              icon={<StickyNote className="w-4 h-4" />} 
              label="Sticky Wall" 
              active={location.pathname === '/sticky-wall'}
            />
          </div>
        </div>
        
        {/* Lists Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3 px-3">
            <h2 className="text-xs font-semibold text-muted-foreground">LISTS</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 hover:bg-muted rounded-full"
                >
                  <Edit className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Manage Lists</DialogTitle>
                </DialogHeader>
                <TagManagementModal 
                  isOpen={isDialogOpen}
                  onClose={() => setIsDialogOpen(false)}
                  onAddTag={handleAddTag}
                  onDeleteTag={handleDeleteTag}
                  existingTags={tags}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-1">
            {tags.map(tag => (
              <SidebarItem 
                key={tag.name}
                to={`/list/${tagNameToUrl(tag.name)}`} 
                icon={<div className="w-3 h-3 rounded-sm" style={getTagColorStyle(tag.color)} />} 
                label={tag.name} 
                count={tagCounts[tag.name] || 0}
                active={location.pathname === `/list/${tagNameToUrl(tag.name)}`}
                tagColor={tag.color}
              />
            ))}
            <button 
              className="flex items-center space-x-2 w-full py-2 px-3 hover:bg-muted rounded-md transition-colors text-primary"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-4 w-4" />
              <span className="text-sm">Add New List</span>
            </button>
          </div>
        </div>

        {/* Tags Section */}
        <div className="p-4">
          <h2 className="text-xs font-semibold text-muted-foreground mb-3 px-3">TAGS</h2>
          <div className="flex flex-wrap gap-2 px-3">
            {tags.map(tag => (
              <Link 
                key={tag.name}
                to={`/list/${tagNameToUrl(tag.name)}`}
                style={getTagColorStyle(tag.color)}
                className="px-3 py-1 text-sm rounded-full flex items-center gap-1 text-foreground"
              >
                <Tag size={12} />
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Bottom Menu */}
      <div className="p-4 space-y-2 border-t border-border bg-background">
        <Link 
          to="/settings" 
          className="flex items-center space-x-3 w-full py-2 px-3 hover:bg-muted rounded-md transition-colors"
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Settings</span>
        </Link>
        <button className="flex items-center space-x-3 w-full py-2 px-3 hover:bg-muted rounded-md transition-colors">
          <LogOut className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Sign out</span>
        </button>
      </div>
    </div>
  );
};

// SidebarItemProps: { icon, label, count?, active?, to?, tagColor?, className? }

const SidebarItem = ({ icon, label, count, active, to, tagColor, className }) => {
  // This helps render the proper tag color in the sidebar
  const getTagIcon = () => {
    if (!tagColor) return icon;
    
    // Use getTagColorStyle helper for consistent styling
    return <div className="w-3 h-3 rounded-sm" style={getTagColorStyle(tagColor)} />;
  };
  
  const content = (
    <div className={cn(
      "flex items-center justify-between w-full py-2 px-3 rounded-md transition-all",
      active ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground",
      className
    )}>
      <div className="flex items-center space-x-3">
        {getTagIcon()}
        <span className={cn(
          "text-sm", 
          active ? "font-medium" : ""
        )}>
          {label}
        </span>
      </div>
      {count !== undefined && (
        <span className={cn(
          "text-xs py-0.5 px-2 rounded-full", 
          active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
          label === "Missed Tasks" && count > 0 ? "bg-destructive/20 text-destructive" : ""
        )}>
          {count}
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className={cn("block", className)}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("cursor-pointer", className)}>
      {content}
    </div>
  );
};

export default Sidebar;
