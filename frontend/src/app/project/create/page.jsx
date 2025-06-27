import { Suspense } from "react";
import CreateProject from "./CreateProject";

export default function CreateProjectPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateProject />
    </Suspense>
  );
}
