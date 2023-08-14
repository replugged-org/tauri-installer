import { Route, MemoryRouter as Router, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import { ChooseAction, ChoosePlatform, Download, License, Progress } from "./steps/index.ts";
import logo from "/logo.png";
import { useEffect, useState } from "react";
import { DiscordPlatform, PlatformData } from "./types";
import { listInstallations, plug, unplug } from "./inject/index.ts";
import { DownloadEmitter, download } from "./inject/injector.ts";

function Header(): React.ReactElement {
  return (
    <div className="header">
      <img src={logo} alt="Replugged logo" className="header-logo" />
      <span className="header-name">Replugged Installer</span>
    </div>
  );
}

const fnForAction = {
  plug,
  unplug,
};

function Main(): React.ReactElement {
  const navigate = useNavigate();

  const [agreedToLicense, setAgreedToLicense] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [action, setAction] = useState<"plug" | "unplug">("plug");
  const [platforms, setPlatforms] = useState<DiscordPlatform[]>([]);
  const [platformData, setPlatformData] = useState<Record<DiscordPlatform, PlatformData> | null>(
    null,
  );
  const [downloadEmitter, setDownloadEmitter] = useState<DownloadEmitter | null>(null);
  const [done, setDone] = useState<DiscordPlatform[]>([]);
  const [error, setError] = useState<DiscordPlatform[]>([]);

  const init = async (reset = false): Promise<void> => {
    if (reset) {
      setAction("plug");
      setPlatforms([]);
      setPlatformData(null);
      setDone([]);
      setError([]);

      if (!agreedToLicense) {
        navigate("/");
      } else if (!downloaded) {
        navigate("/download");
      } else {
        navigate("/action");
      }
    }

    const data = await listInstallations();
    console.log("INSTALLATIONS:", data);
    setPlatformData(data);

    const unplugged = Object.entries(data)
      .filter(([, value]) => value.installed && !value.plugged)
      .map(([key]) => key as DiscordPlatform);

    setPlatforms(unplugged);
  };

  const run = (): void => {
    setDone([]);
    setError([]);

    platforms.forEach(async (platform) => {
      const fn = fnForAction[action];
      const res = await fn(platform);
      if (res) {
        setDone((prev) => [...prev, platform]);
      } else {
        setError((prev) => [...prev, platform]);
      }
    });
  };

  const downloadReplugged = (): void => {
    const emitter = download();
    setDownloadEmitter(emitter);
  };

  useEffect(() => {
    void init(true);
  }, []);

  return (
    <div className="wrapper">
      <Routes>
        <Route
          path="/"
          element={
            <License
              onAgree={() => {
                setAgreedToLicense(true);
                downloadReplugged();
              }}
            />
          }
        />
        <Route
          path="/download"
          element={
            <Download onDownload={() => setDownloaded(true)} downloadEmitter={downloadEmitter} />
          }
        />
        <Route path="/action" element={<ChooseAction action={action} setAction={setAction} />} />
        <Route
          path="/platform"
          element={
            <ChoosePlatform
              platformData={platformData}
              action={action}
              platforms={platforms}
              setPlatforms={setPlatforms}
              init={init}
              run={run}
            />
          }
        />
        <Route
          path="/progress"
          element={
            <Progress init={init} platforms={platforms} done={done} error={error} run={run} />
          }
        />
      </Routes>
    </div>
  );
}

export default function App(): React.ReactElement {
  return (
    <Router>
      <Header />
      <Main />
    </Router>
  );
}
