import { cn } from "@/lib/utils";
import React from "react";

export function GridBackground({ className, children }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#404040_1px,transparent_1px),linear-gradient(to_bottom,#404040_1px,transparent_1px)]"
        )}
      />

      <div
        className="pointer-events-none absolute inset-0 
        [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_0%,black_70%,black_100%)]
        [mask-size:120%_120%]
        [mask-position:center_center]"
      ></div>

      {children}
    </div>
  );
}
