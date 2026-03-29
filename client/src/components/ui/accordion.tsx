import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { cn } from "@/lib/utils";
function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card flex w-full flex-col",
        className,
      )}
      {...props}
    />
  );
}
function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("data-open:bg-neutral-100 dark:data-open:bg-[#0f1112] not-last:border-b border-border", className)}
      {...props}
    />
  );
}
export const accordionTriggerStyle = "**:data-[slot=accordion-trigger-icon]:text-foreground gap-6 p-4 text-left text-sm font-medium underline-offset-4 dark:hover:bg-[#0f1112] hover:bg-neutral-200 decoration-[#222] dark:decoration-neutral-600 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 group/accordion-trigger relative flex flex-1 items-start justify-between border border-transparent outline-none disabled:pointer-events-none disabled:opacity-50";

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          accordionTriggerStyle,
          className,
        )}
        {...props}
      >
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}
function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="px-4 text-sm overflow-hidden h-(--accordion-panel-height) data-ending-style:h-0 data-starting-style:h-0 transition-[height] duration-300 ease-in-out"
      {...props}
    >
      <div
        className={cn(
          "pt-0 pb-4 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
