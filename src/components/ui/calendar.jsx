
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// CalendarProps would be React.ComponentProps<typeof DayPicker> in TypeScript

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-4",
        caption: "flex justify-between items-center h-14 px-6 bg-background rounded-t-lg",
        caption_label: "text-lg font-semibold text-foreground",
        nav: "flex items-center",
        nav_button: cn(
          "h-9 w-9 flex items-center justify-center rounded-md p-0 opacity-70 hover:opacity-100 bg-transparent hover:bg-blue-50 transition-colors"
        ),
        table: "w-full border-collapse",
        head_row: "flex w-full",
        head_cell: "text-muted-foreground flex-1 font-medium py-4 text-sm",
        row: "flex w-full mt-2",
        cell: "relative flex-1 p-0 text-center focus-within:relative focus-within:z-20 h-12",
        day: cn(
          "h-10 w-10 mx-auto flex items-center justify-center rounded-full text-sm font-normal hover:bg-muted transition-colors"
        ),
        day_today: "bg-primary/10 text-primary",
        day_outside: "text-muted-foreground/50",
        day_disabled: "text-muted-foreground/30",
        day_selected: "bg-primary/20 !text-primary font-medium",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5" {...props} />,
        IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5" {...props} />,
        Caption: ({ displayMonth }) => (
          <div className="flex justify-between items-center px-2 w-full">
            <button onClick={() => props.onMonthChange?.(
              new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1)
            )}
            className="h-9 w-9 flex items-center justify-center rounded-md p-0 opacity-70 hover:opacity-100 bg-transparent hover:bg-muted transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-medium text-foreground">
              {format(displayMonth, "MMMM yyyy")}
            </h2>
            <button onClick={() => props.onMonthChange?.(
              new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1)
            )}
            className="h-9 w-9 flex items-center justify-center rounded-md p-0 opacity-70 hover:opacity-100 bg-transparent hover:bg-muted transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
