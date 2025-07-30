import React, { Suspense } from "react";
import ProjectAnalytics from "./ProjectAnalytics";
import CustomLoader from "@/components/CustomLoader";

const page = () => {
  return (
    <Suspense fallback={<CustomLoader />}>
      <ProjectAnalytics />
    </Suspense>
  );
};

export default page;
