import { Suspense } from "react";
import CreateProject from "./CreateProject";
import CustomLoader from "@/components/CustomLoader";

export default function CreateProjectPage() {
  return (
    <Suspense fallback={<CustomLoader />}>
      <CreateProject />
    </Suspense>
  );
}
