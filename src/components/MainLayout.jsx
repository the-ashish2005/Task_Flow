
import React, { useState } from "react";
import { MenuIcon } from "lucide-react";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MainLayout = ({ children, title, taskCount }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      
      <div className={cn(
        "flex-1 transition-all duration-300",
        sidebarCollapsed ? "ml-0" : "ml-[320px]"
      )}>
        <header className="bg-background h-16 flex items-center justify-between px-8 border-b border-border shadow-sm">
          {sidebarCollapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarCollapsed(false)}
              className="mr-4"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            {taskCount !== undefined && (
              <span className="ml-4 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                {taskCount}
              </span>
            )}
          </div>
          
          {/* <Button variant="ghost" size="icon">
            <span className="sr-only">Close</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 13.5H3.5V15.5H0z M8 13.5h3.5v2H8z M4 1.5h3.5v14H4z" transform="rotate(-45 7.5 7.5)" fill="currentColor"/>
            </svg>
          </Button> */}
        </header>
        
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
