import { useEffect, useState } from "react";
import "./Download.css";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { download } from "../inject/injector";

export function Download({ onDownload }: { onDownload: () => void }): React.ReactElement {
  const navigate = useNavigate();

  const [step, setStep] = useState<"downloading" | "done" | "error">("downloading");

  useEffect(() => {
    download()
      .then(() => {
        onDownload();
        setStep("done");
        navigate("/action");
      })
      .catch((err) => {
        console.error("Error downloading", err);
        setStep("error");
      });
  }, []);

  return (
    <div className="page download-page">
      <div className="download-step">
        {step === "downloading" && `Downloading...`}
        {step === "done" && "Done!"}
        {step === "error" && "Error!"}
      </div>
    </div>
  );
}
