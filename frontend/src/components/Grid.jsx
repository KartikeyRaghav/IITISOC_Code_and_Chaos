import React from "react";
import { BentoGrid, BentoGridItem } from "./ui/BentoGrid";
import { gridItems } from "@/constants";
import {RocketLaunchIcon, DocumentTextIcon, EyeIcon, GlobeAltIcon, ArrowPathIcon, ChartBarIcon} from "@heroicons/react/24/outline";

const icons = [
    <RocketLaunchIcon className="h-6 w-6" />,
    <DocumentTextIcon className="h-6 w-6" />,
    <EyeIcon className="h-6 w-6" />,
    <GlobeAltIcon className="h-6 w-6" />,
    <ArrowPathIcon className="h-6 w-6" />,
    <ChartBarIcon className="h-6 w-6" />,
];

const Grid = () => {
    return (
        <section id='about' className="px-4 sm:px-6 lg:px-8 py-12">
            <BentoGrid>
                {gridItems.map (({id, title, description, className}, index) => (
                    <BentoGridItem 
                        key={id}
                        title={title}
                        description={description}
                        className={className}
                        icon={icons[index]}
                    />
                ))}
            </BentoGrid>
        </section>
    )
}

export default Grid