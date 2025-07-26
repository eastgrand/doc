"use client"

import React, { forwardRef, useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const Accordion = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const [openItem, setOpenItem] = useState<string | null>(null);

  const items = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        isOpen: child.props.value === openItem,
        onToggle: () => {
          console.log('Toggling:', child.props.value, 'Current:', openItem); // Debug
          setOpenItem(openItem === child.props.value ? null : child.props.value);
        }
      });
    }
    return child;
  });

  return <div {...props}>{items}</div>;
};

const AccordionItem = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; isOpen?: boolean; onToggle?: () => void }
>(({ className, children, isOpen, onToggle, value, ...props }, ref) => {
  const childrenArray = React.Children.toArray(children);
  const trigger = childrenArray[0];
  const content = childrenArray[1];

  return (
    <div 
      ref={ref} 
      className={cn("border rounded-md mb-2", className)} 
      {...props}
    >
      {React.isValidElement(trigger) && 
        React.cloneElement(trigger as React.ReactElement<any>, { 
          isOpen, 
          onClick: onToggle,
          className: "px-4 py-2 w-full flex justify-between items-center"
        })}
      <div className={cn(
        "overflow-hidden transition-all",
        isOpen ? "max-h-96" : "max-h-0"
      )}>
        {content}
      </div>
    </div>
  );
});
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { isOpen?: boolean }
>(({ className, children, isOpen, ...props }, ref) => (
  <button
    ref={ref}
    data-state={isOpen ? "open" : "closed"}
    className={cn(
      "flex w-full items-center justify-between py-2 text-xs font-medium transition-all hover:underline",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className={cn(
      "h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200",
      isOpen && "rotate-180"
    )} />
  </button>
));
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("overflow-hidden text-sm", className)}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </div>
))
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
