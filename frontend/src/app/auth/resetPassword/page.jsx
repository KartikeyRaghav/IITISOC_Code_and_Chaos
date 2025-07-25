import React, { Suspense } from "react";
import ResetPasswordPage from "./ResetPassword";

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
};

export default page;
