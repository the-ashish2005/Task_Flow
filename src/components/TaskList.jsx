import React, { useState } from "react";
import TaskItem from "./TaskItem";
import { Button } from "@/components/ui/button";
import { PlusIcon, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";


const TaskList = ({ 
  title, 
  tasks, 
  onAddTask, 
  onAddSubtask,
  onToggleTaskComplete,
  onToggleSubtaskComplete,
  onDeleteTask,
  onDeleteSubtask,
  onUpdateTaskTag,
  onUpdateTaskDate,
  className,
  titleClassName,
  disableAddTask = false
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showDateRequiredMessage, setShowDateRequiredMessage] = useState(false);
  
  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskTitle.trim() !== "") {
      // Check if this is "This Week" section and require a date
      const isThisWeekSection = title === "This Week";
      
      // If it's "This Week" section, only proceed if a date is selected
      if (isThisWeekSection && !selectedDate) {
        // Show the date required message
        setShowDateRequiredMessage(true);
        // Don't add the task, date is required for "This Week"
        return;
      }
      
      // Convert the selected date to a string format if it exists
      const dueDateString = selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined;
      onAddTask(newTaskTitle.trim(), dueDateString);
      setNewTaskTitle("");
      setSelectedDate(undefined);
      setShowDateRequiredMessage(false);
    }
  };

  // Check if this is the "Others" section or "This Week" section
  const isOthersSection = title === "Others";
  const isThisWeekSection = title === "This Week";

  return (
    <div className={cn("mb-10 p-6 bg-card rounded-lg border border-border", className)}>
      <h2 className={cn("text-xl font-semibold mb-4 text-card-foreground", titleClassName)}>
        {title} <span className="text-sm font-normal text-muted-foreground">({tasks.length})</span>
      </h2>
      
      <div className="space-y-1">
        {tasks.map((task) => (
          <TaskItem 
            key={task.id}
            id={task.id}
            title={task.title}
            completed={task.completed}
            subtasks={task.subtasks}
            // Only show dueDate if it was explicitly set (selected by user)
            dueDate={task.dueDate}
            tag={task.tag}
            onAddSubtask={onAddSubtask}
            onToggleTaskComplete={onToggleTaskComplete}
            onToggleSubtaskComplete={onToggleSubtaskComplete}
            onDeleteTask={onDeleteTask}
            onDeleteSubtask={onDeleteSubtask}
            onUpdateTaskTag={onUpdateTaskTag}
            onUpdateTaskDate={onUpdateTaskDate}
          />
        ))}
        
        {!disableAddTask && (
          <form onSubmit={handleAddTask} className="flex items-center space-x-2 mt-3 pl-10">
            <div className="flex-1 flex items-center">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => {
                  setNewTaskTitle(e.target.value);
                  if (showDateRequiredMessage) {
                    setShowDateRequiredMessage(false);
                  }
                }}
                placeholder="Add a new task..."
                className="flex-1 border-b border-dashed border-border bg-transparent py-2 text-sm focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground"
              />
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-full hover:bg-muted",
                      isThisWeekSection && showDateRequiredMessage && "ring-2 ring-destructive"
                    )}
                    type="button"
                    onClick={() => {
                      if (showDateRequiredMessage) {
                        setShowDateRequiredMessage(false);
                      }
                    }}
                  >
                    <CalendarIcon className={cn(
                      "h-4 w-4", 
                      selectedDate ? "text-primary" : (isThisWeekSection && showDateRequiredMessage) ? "text-destructive" : "text-muted-foreground"
                    )} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setDatePickerOpen(false);
                      setShowDateRequiredMessage(false);
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted"
              disabled={newTaskTitle.trim() === "" || (isThisWeekSection && !selectedDate)}
            >
              <PlusIcon className="h-5 w-5 text-primary" />
            </Button>
          </form>
        )}
        {isThisWeekSection && showDateRequiredMessage && (
          <div className="pl-10 mt-1 text-xs text-destructive">
            Date selection is required for This Week tasks
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
