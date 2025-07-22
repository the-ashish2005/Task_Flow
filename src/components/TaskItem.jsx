import React, { useState } from "react";
import { ChevronRight, ChevronDown, Plus, Trash2, Tag, Calendar } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { format, isBefore, startOfDay } from "date-fns";
import { getAllTags } from "@/utils/tagUtils";


const TaskItem = ({ 
  id,
  title, 
  completed = false,
  dueDate,
  subtasks = [],
  tag,
  className,
  onClick,
  onAddSubtask,
  onToggleTaskComplete,
  onToggleSubtaskComplete,
  onDeleteTask,
  onDeleteSubtask,
  onUpdateTaskTag,
  onUpdateTaskDate
}) => {
  const [isChecked, setIsChecked] = useState(completed);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [isSelectingTag, setIsSelectingTag] = useState(false);
  const [isSelectingDate, setIsSelectingDate] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const { toast } = useToast();
  
  // Get all available tags including custom ones
  const availableTags = getAllTags();

  const handleCheckChange = (checked) => {
    setIsChecked(checked);
    if (onToggleTaskComplete) {
      onToggleTaskComplete(id, checked);
      toast({
        title: checked ? "Task completed" : "Task marked as incomplete",
        description: `"${title}" has been ${checked ? "completed" : "marked as incomplete"}`,
      });
    }
  };

  const handleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleAddSubtaskClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingSubtask(true);
    // If task is not expanded, expand it when adding subtask
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleSubtaskSubmit = (e) => {
    e.preventDefault();
    
    if (newSubtaskTitle.trim() && onAddSubtask) {
      onAddSubtask(id, newSubtaskTitle.trim());
      setNewSubtaskTitle("");
      setIsAddingSubtask(false);
      toast({
        title: "Subtask added",
        description: `"${newSubtaskTitle}" has been added to "${title}"`,
      });
    } else {
      toast({
        title: "Error",
        description: "Subtask title cannot be empty",
        variant: "destructive",
      });
    }
  };

  const handleCancelSubtask = (e) => {
    e.stopPropagation();
    setNewSubtaskTitle("");
    setIsAddingSubtask(false);
  };

  const handleSubtaskCheckChange = (subtaskId, checked) => {
    if (onToggleSubtaskComplete) {
      onToggleSubtaskComplete(id, subtaskId, checked);
      
      const subtask = subtasks.find(st => st.id === subtaskId);
      if (subtask) {
        toast({
          title: checked ? "Subtask completed" : "Subtask marked as incomplete",
          description: `"${subtask.title}" has been ${checked ? "completed" : "marked as incomplete"}`,
        });
      }
    }
  };

  const handleDeleteTask = (e) => {
    e.stopPropagation();
    if (onDeleteTask) {
      onDeleteTask(id);
      toast({
        title: "Task deleted",
        description: `"${title}" has been deleted`,
      });
    }
  };

  const handleDeleteSubtask = (e, subtaskId) => {
    e.stopPropagation();
    if (onDeleteSubtask) {
      const subtask = subtasks.find(st => st.id === subtaskId);
      if (subtask) {
        onDeleteSubtask(id, subtaskId);
        toast({
          title: "Subtask deleted",
          description: `Subtask "${subtask.title}" has been deleted`,
        });
      }
    }
  };

  const handleTagChange = (tagValue) => {
    if (onUpdateTaskTag) {
      const selectedTag = availableTags.find(t => t.name.toLowerCase() === tagValue.toLowerCase());
      if (selectedTag) {
        onUpdateTaskTag(id, selectedTag.name, selectedTag.color);
        toast({
          title: "Tag updated",
          description: `Task "${title}" has been tagged as "${selectedTag.name}"`,
        });
      }
    }
  };

  const handleTagClick = (e) => {
    e.stopPropagation();
    setIsSelectingTag(!isSelectingTag);
    
    // If task is not expanded, expand it when adding tag
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };
  
  const handleDateClick = (e) => {
    e.stopPropagation();
    setIsSelectingDate(!isSelectingDate);
    
    // If task is not expanded, expand it when adding date
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };
  
  const handleDateSelect = (date) => {
    if (date && onUpdateTaskDate) {
      const formattedDate = format(date, "yyyy-MM-dd");
      onUpdateTaskDate(id, formattedDate);
      
      toast({
        title: "Due date updated",
        description: `Due date for "${title}" set to ${format(date, "MMM dd, yyyy")}`,
      });
      
      setIsSelectingDate(false);
    }
  };
  
  const subtaskCount = subtasks?.length || 0;

  const getTagColorStyle = (colorName) => {
    // Handle both legacy color names and new tag-* class names
    if (colorName.startsWith('tag-')) {
      return { backgroundColor: `var(--${colorName})` };
    }
    
    switch (colorName) {
      case 'personal': return { backgroundColor: 'var(--tag-red)' };
      case 'work': return { backgroundColor: 'var(--tag-blue)' };
      case 'default': return { backgroundColor: 'var(--tag-yellow)' };
      default: return { backgroundColor: colorName }; // for custom colors that already have the tag- prefix
    }
  };
  
  // Format the date for display
  const formattedDueDate = dueDate ? format(new Date(dueDate), "MMM dd, yyyy") : undefined;
  
  // Parse the dueDate string back to a Date for the calendar
  const parsedDueDate = dueDate ? new Date(dueDate) : undefined;

  // Create a function to disable dates before today
  const disablePastDates = (date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  return (
    <div className={cn("border-b border-border hover:bg-muted/50 transition-colors", className)}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div 
            className="flex items-center py-4 px-6 group cursor-pointer"
            onClick={onClick}
          >
            <div className="flex-1 flex items-center min-w-0">
              <Checkbox 
                checked={isChecked} 
                onCheckedChange={handleCheckChange}
                className="mr-4 h-5 w-5 rounded-full data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-input"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="mr-2 flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium text-foreground truncate",
                  isChecked && "line-through text-muted-foreground"
                )}>
                  {title}
                </p>
                
                {/* Updated metadata layout to prevent overlapping */}
                {(dueDate || subtaskCount > 0 || tag) && (
                  <div className="flex items-center mt-2 flex-wrap gap-2">
                    {dueDate && (
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formattedDueDate}
                        </span>
                      </div>
                    )}
                    {subtaskCount > 0 && (
                      <div className="flex items-center">
                        <span className="text-xs bg-primary/10 px-2 py-1 rounded-full text-primary font-medium">
                          {subtaskCount}
                        </span>
                      </div>
                    )}
                    {tag && (
                      <span 
                        className="px-2 py-1 text-xs rounded-full font-medium text-white"
                        style={getTagColorStyle(tag.color)}
                      >
                        {tag.name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Updated buttons layout to prevent overlapping */}
            <div className="flex items-center ml-2 space-x-1">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={handleDeleteTask}
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={handleTagClick}
                title="Add tag"
              >
                <Tag className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={handleDateClick}
                title="Set due date"
              >
                <Calendar className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleAddSubtaskClick}
              >
                <Plus className="w-4 h-4 text-muted-foreground" />
              </Button>
              <div onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }} className="p-1">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="pl-16 pr-6 pb-4">
            {/* Tag selector */}
            {isSelectingTag && (
              <div className="mb-4">
                <Select 
                  onValueChange={handleTagChange} 
                  defaultValue={tag ? tag.name.toLowerCase() : undefined}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags.map((tagOption) => (
                      <SelectItem key={tagOption.name} value={tagOption.name.toLowerCase()}>
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={getTagColorStyle(tagOption.color)}
                          ></div>
                          <span>{tagOption.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Date selector */}
            {isSelectingDate && (
              <div className="mb-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dueDate ? formattedDueDate : <span>No due date set</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={parsedDueDate}
                      onSelect={handleDateSelect}
                      disabled={disablePastDates}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Subtasks list - improved spacing */}
            {subtasks && subtasks.length > 0 && (
              <ul className="space-y-3 mb-4">
                {subtasks.map((subtask) => (
                  <li key={subtask.id} className="flex items-center gap-3 group">
                    <Checkbox 
                      checked={subtask.completed}
                      className="h-4 w-4 rounded-full data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-input"
                      onCheckedChange={(checked) => 
                        handleSubtaskCheckChange(subtask.id, checked)
                      }
                    />
                    <span className={cn(
                      "text-sm text-foreground flex-1",
                      subtask.completed && "line-through text-muted-foreground"
                    )}>
                      {subtask.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDeleteSubtask(e, subtask.id)}
                      title="Delete subtask"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            
            {/* Add subtask form */}
            {isAddingSubtask ? (
              <form onSubmit={handleSubtaskSubmit} className="mt-3">
                <div className="flex flex-col space-y-3">
                  <Input
                    placeholder="Subtask title"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    autoFocus
                    className="border-input rounded-md"
                  />
                  <div className="flex space-x-2 justify-end">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleCancelSubtask}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">Add Subtask</Button>
                  </div>
                </div>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center text-muted-foreground hover:bg-muted mt-2"
                onClick={handleAddSubtaskClick}
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="text-xs">Add Subtask</span>
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default TaskItem;
