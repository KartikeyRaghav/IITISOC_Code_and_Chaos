import React, { Suspense } from "react";
import ResetPasswordPage from "./ResetPassword";
import CustomLoader from "@/components/CustomLoader";

const page = () => {
  return (
    <Suspense fallback={<CustomLoader />}>
      <ResetPasswordPage />
    </Suspense>
  );
};

export default page;
