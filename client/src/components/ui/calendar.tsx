import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * CALENDAR COMPONENT - AIRBNB STYLE (COMPACT & ELITE)
 * Rectificado para react-day-picker v9.11.1
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-4 bg-white", 
        "[--cell-size:38px] [--calendar-gap:0px]",
        className
      )}
      classNames={{
        ...defaultClassNames,
        root: cn("w-fit mx-auto", defaultClassNames.root),
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-2",
        caption_label: "text-sm font-bold text-gray-900 font-display",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 bg-transparent p-0 opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-full transition-all absolute left-1 z-10"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 bg-transparent p-0 opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-full transition-all absolute right-1 z-10"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex w-full mb-2",
        weekday: "text-gray-400 w-(--cell-size) font-medium text-[11px] uppercase tracking-tighter text-center",
        weeks: "flex flex-col",
        week: "flex w-full mt-0", 
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-(--cell-size) w-(--cell-size) p-0 font-normal aria-selected:opacity-100 rounded-full hover:bg-gray-100 transition-none relative"
        ),
        day_button: "h-full w-full flex items-center justify-center rounded-full",
        range_start: "rdp-day_range_start !bg-blue-700 !text-white !rounded-full shadow-lg z-10",
        range_end: "rdp-day_range_end !bg-blue-700 !text-white !rounded-full shadow-lg z-10",
        range_middle: "rdp-day_range_middle !bg-blue-50 !text-blue-900 !rounded-none",
        selected: "!bg-blue-700 !text-white",
        today: "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-blue-700 after:rounded-full",
        outside: "text-gray-300 opacity-50",
        disabled: "text-gray-300 opacity-30 cursor-not-allowed line-through",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          return orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          );
        },
        DayButton: CalendarDayButton,
      }}
      {...props}
    />
  );
}

/**
 * Sub-componente de botón de día con lógica de estilo Airbnb y Tipado Elite
 */
function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null);
  
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        "relative h-full w-full p-0 font-body text-sm transition-all rounded-full flex items-center justify-center",
        modifiers.range_middle && "rounded-none bg-blue-50 text-blue-900",
        modifiers.range_start && "bg-blue-700 text-white rounded-full z-10 shadow-md",
        modifiers.range_end && "bg-blue-700 text-white rounded-full z-10 shadow-md",
        modifiers.outside && "text-gray-400 opacity-50",
        modifiers.disabled && "text-gray-200 line-through",
        className
      )}
      {...props}
    >
      {day.date.getDate()}
    </Button>
  );
}

export { Calendar };