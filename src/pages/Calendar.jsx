
import React, { useState, useEffect } from "react";
import { format, addMonths, subMonths } from "date-fns";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import TaskList from "@/components/TaskList";
import CalendarGrid from "@/components/CalendarGrid";
import { loadTasks, saveTasks, getTasksForDate, getDatesWithTasks, getAllTasks } from "@/utils/taskUtils";
import { toast } from "@/components/ui/sonner";
import { 
  updateTodayTasks, 
  updateTomorrowTasks, 
  updateWeekTasks, 
  updateOtherTasks, 
  classifyTaskByDate 
} from "@/pages/Index";

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);

  // Load tasks from localStorage on initial render
  useEffect(() => {
    const allTasks = loadTasks();
    setTasks(allTasks);
    
    // Listen for task updates from other components
    const handleTasksUpdated = (event) => {
      setTasks(event.detail.tasks);
    };
    
    window.addEventListener('tasks-updated', handleTasksUpdated);
    
    return () => {
      window.removeEventListener('tasks-updated', handleTasksUpdated);
    };
  }, []);

  // Filter tasks for the selected date
  const tasksForSelectedDate = getTasksForDate(tasks, selectedDate);
  
  // Get dates that have tasks
  const datesWithTasks = getDatesWithTasks(tasks);

  // Handle month navigation
  const previousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };
  
  // Sync tasks with the Upcoming section
  const syncTasksWithUpcoming = (updatedTasks) => {
    // Classify and update tasks in the Upcoming view
    const today = [];
    const tomorrow = [];
    const week = [];
    const other = [];
    
    updatedTasks.forEach(task => {
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
  };

  // Handle task operations
  const handleAddTask = (title, dueDate) => {
    const newTask = {
      id: crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`,
      title,
      completed: false,
      dueDate: dueDate || format(selectedDate, "yyyy-MM-dd")
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    syncTasksWithUpcoming(updatedTasks);
    
    toast.success("Task created", {
      description: `"${title}" has been added to ${format(selectedDate, "MMM d, yyyy")}`
    });
  };

  const handleToggleTaskComplete = (taskId, completed) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    syncTasksWithUpcoming(updatedTasks);
  };

  const handleAddSubtask = (taskId, title) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            subtasks: [...(task.subtasks || []), { id: crypto.randomUUID ? crypto.randomUUID() : `subtask-${Date.now()}`, title, completed: false }] 
          } 
        : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    syncTasksWithUpcoming(updatedTasks);
  };

  const handleToggleSubtaskComplete = (taskId, subtaskId, completed) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId && task.subtasks 
        ? { 
            ...task, 
            subtasks: task.subtasks.map(subtask => 
              subtask.id === subtaskId ? { ...subtask, completed } : subtask
            )
          }
        : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    syncTasksWithUpcoming(updatedTasks);
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    syncTasksWithUpcoming(updatedTasks);
    
    toast.success("Task deleted", {
      description: "The task has been removed"
    });
  };

  const handleDeleteSubtask = (taskId, subtaskId) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId && task.subtasks 
        ? { 
            ...task, 
            subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId)
          }
        : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    syncTasksWithUpcoming(updatedTasks);
  };

  const handleUpdateTaskTag = (taskId, tagName, tagColor) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, tag: { name: tagName, color: tagColor } } 
        : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    syncTasksWithUpcoming(updatedTasks);
  };

  const handleUpdateTaskDate = (taskId, date) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, dueDate: date } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    syncTasksWithUpcoming(updatedTasks);
    
    toast.success("Due date updated", {
      description: `Task's due date has been updated`
    });
  };

  return (
    <MainLayout title="Calendar">
      <div className="max-w-7xl mx-auto p-4 flex flex-col lg:flex-row gap-6">
        {/* Calendar Section */}
        <Card className="w-full lg:w-3/5 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-medium">
                {format(currentMonth, "MMMM yyyy")}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setCurrentMonth(new Date());
                    setSelectedDate(new Date());
                  }}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CalendarGrid 
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              datesWithTasks={datesWithTasks}
              onSelectDate={setSelectedDate}
            />
          </CardContent>
        </Card>

        {/* Tasks Section */}
        <Card className="w-full lg:w-2/5 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-medium">
              Tasks for {format(selectedDate, "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaskList
              title=""
              tasks={tasksForSelectedDate}
              onAddTask={handleAddTask}
              onAddSubtask={handleAddSubtask}
              onToggleTaskComplete={handleToggleTaskComplete}
              onToggleSubtaskComplete={handleToggleSubtaskComplete}
              onDeleteTask={handleDeleteTask}
              onDeleteSubtask={handleDeleteSubtask}
              onUpdateTaskTag={handleUpdateTaskTag}
              onUpdateTaskDate={handleUpdateTaskDate}
              className="border-none p-0 mb-0 bg-transparent"
              titleClassName="hidden"
            />
            
            {tasksForSelectedDate.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="mb-2">No tasks scheduled for this day</p>
                <p className="text-sm">Add a new task to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CalendarPage;
