
import React, { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns";


const CalendarGrid = ({
  currentMonth,
  selectedDate,
  datesWithTasks,
  onSelectDate
}) => {
  // Generate days for the current month view
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Weekday headers */}
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div 
          key={day}
          className="text-center py-2 text-sm font-medium text-muted-foreground"
        >
          {day}
        </div>
      ))}

      {/* Calendar days */}
      {days.map((day, dayIdx) => {
        const formattedDay = format(day, "yyyy-MM-dd");
        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate);
        const hasTask = datesWithTasks.includes(formattedDay);
        
        return (
          <div 
            key={dayIdx}
            className={`
              relative h-24 border border-border p-1 transition-all
              ${isToday ? "border-primary bg-primary/10" : ""}
              ${isSelected ? "ring-2 ring-primary" : ""}
              ${!isSameMonth(day, currentMonth) ? "opacity-40" : ""}
              hover:bg-muted cursor-pointer calendar-cell
            `}
            onClick={() => onSelectDate(day)}
          >
            <span className={`
              inline-flex h-6 w-6 items-center justify-center rounded-full text-sm
              ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}
            `}>
              {format(day, "d")}
            </span>
            
            {/* Task indicator */}
            {hasTask && (
              <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CalendarGrid;
