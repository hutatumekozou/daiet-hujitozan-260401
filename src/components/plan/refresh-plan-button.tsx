"use client";

import { LoaderCircle, RefreshCcw } from "lucide-react";
import { useFormStatus } from "react-dom";

export function RefreshPlanButton() {
  const { pending } = useFormStatus();

  return (
    <button className="secondary-button px-4 py-3" type="submit" disabled={pending}>
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
      {pending ? "再生成中..." : "再生成"}
    </button>
  );
}
