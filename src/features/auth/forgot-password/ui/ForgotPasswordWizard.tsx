"use client";

import { useState } from "react";
import RequestResetForm from "./RequestResetForm";
import ResetConfirmForm from "./ResetConfirmForm";
import { Card, Button } from "flowbite-react";
import { useForgotPasswordStore } from "../model/store";

type Step = "request" | "confirm";

const ForgotPasswordWizard = () => {
  const [step, setStep] = useState<Step>("request");
  const { email } = useForgotPasswordStore();

  const goToConfirm = () => setStep("confirm");
  const goToRequest = () => setStep("request");

  return (
    <div className="w-full flex justify-center items-center min-h-screen px-4">
    
        {step === "request" && <RequestResetForm onSuccess={goToConfirm} />}
        {step === "confirm" && (
          <ResetConfirmForm onBack={goToRequest} emailGuard={!email} />
        )}
      
    </div>
  );
};

export default ForgotPasswordWizard;
