import { useEffect, useState } from "react";
import "./Download.css";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import { DownloadEmitter } from "../inject/injector";

export function Download({
  onDownload,
  downloadEmitter,
}: {
  onDownload: () => void;
  downloadEmitter: DownloadEmitter | null;
}): React.ReactElement {
  const navigate = useNavigate();

  console.log("downloadEmitter", downloadEmitter);
  console.log("stage", downloadEmitter?.stage);
  const [stage, setStage] = useState(downloadEmitter?.stage?.text);
  const [isError, setIsError] = useState(false);

  const onStage = (text: string): void => {
    setStage(text);
    setIsError(false);
  };

  const onDone = (): void => {
    onDownload();
    setStage("Done!");
    setIsError(false);
    navigate("/action");
  };

  const onError = (): void => {
    setStage("Error!");
    setIsError(true);
  };

  useEffect(() => {
    if (!downloadEmitter) return;

    downloadEmitter.on("stage", onStage);
    downloadEmitter.on("done", onDone);
    downloadEmitter.on("error", onError);

    return () => {
      downloadEmitter.off("stage", onStage);
      downloadEmitter.off("done", onDone);
      downloadEmitter.off("error", onError);
    };
  }, [downloadEmitter]);

  return (
    <div className="page download-page">
      <div className="download-step">{stage || "Please Wait..."}</div>
      {isError ? (
        <div className="platform-bottom">
          <Link to="/" className="button button">
            Start Over
          </Link>
        </div>
      ) : null}
    </div>
  );
}
