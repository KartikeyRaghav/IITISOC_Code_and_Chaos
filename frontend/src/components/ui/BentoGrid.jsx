import { cn } from "@/lib/utils";

export const BentoGrid = ({
    className,
    children
}) => {
    return (
        <div
            className={cn(
                "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3",
                    className
        )}>
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon
}) => {
    return (
        <div
            className={cn(
                "group/bento shadow-input row-span-1 flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:shadow-xl dark:border-white/[0.1] dark:bg-zinc-900",
            className
        )}>
            {header && <div className="mb-2">{header}</div>}
        <div className="transition duration-200 group-hover/bento:translate-x-1">
            {icon && (
                <div
                    className="mb-4 flex items-center justify-start text-indigo-600">
                {icon}
                </div>
            )}         
            <div className="text-lg font-semibold text-[#a855f7]">
                {title}
            </div>

            <div className="mt-2 text-sm text-[#9ca3af] leading-relaxed">
                {description}
            </div>
        </div>
    </div>
    )}