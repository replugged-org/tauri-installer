import { Link } from "react-router-dom";
import { DiscordPlatform, PlatformData } from "../types";
import "./ChoosePlatform.css";
import "../App.css";
import { PLATFORM_LABELS } from "../util";
import { useState } from "react";

export function ChoosePlatform({
  platformData,
  action,
  platforms,
  setPlatforms,
  init,
  run,
}: {
  platformData: Record<DiscordPlatform, PlatformData> | null;
  action: "plug" | "unplug";
  platforms: DiscordPlatform[];
  setPlatforms: (platforms: DiscordPlatform[]) => void;
  init: (reset?: boolean) => Promise<void>;
  run: () => void;
}): React.ReactElement {
  const [isFetchingPlatforms, setIsFetchingPlatforms] = useState(false);

  const availablePlatforms = (
    platformData
      ? Object.entries(platformData)
          .filter(([, v]) => v.installed)
          .map((x) => x[0])
      : []
  ) as DiscordPlatform[];

  const pluggedPlatforms = (
    platformData
      ? Object.entries(platformData)
          .filter(([, v]) => v.plugged)
          .map((x) => x[0])
      : []
  ) as DiscordPlatform[];

  const hasAlreadyPluggedPlatform = platforms.some((platform) =>
    pluggedPlatforms.includes(platform),
  );

  const togglePlatform = (platform: DiscordPlatform): void => {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter((p) => p !== platform));
    } else {
      setPlatforms([...platforms, platform]);
    }
  };

  return (
    <div className="page platform-page">
      <div className="platform-page-header">Choose Platforms</div>
      {availablePlatforms.length ? (
        <>
          <div className="choose-platform">
            {availablePlatforms.map((platform) => (
              <label
                htmlFor={`checkbox-${platform}`}
                key={platform}
                className={`button platform-button ${
                  platforms.includes(platform) ? "platform-button-active" : ""
                }`}>
                <input
                  id={`checkbox-${platform}`}
                  type="checkbox"
                  name="platform"
                  value={platform}
                  checked={platforms.includes(platform)}
                  onChange={() => togglePlatform(platform)}
                />
                <span>{PLATFORM_LABELS[platform]}</span>
              </label>
            ))}
          </div>
          <div className="platform-note">Please quit Discord before continuing.</div>
          {action === "plug" && hasAlreadyPluggedPlatform && (
            <div className="platform-warning">
              One of the selected platforms is already plugged or has another client mod installed.
              Plugging it again will overwrite the existing mod.
            </div>
          )}
          <div className="platform-bottom">
            <Link to="/action" className="button button-secondary">
              Back
            </Link>
            <Link
              onClick={(e) => {
                if (platforms.length === 0) {
                  e.preventDefault();
                  return;
                }
                run();
              }}
              to="/progress"
              className={`button ${platforms.length === 0 ? "button-disabled" : ""}`}>
              Continue
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="platform-note platform-troubleshooting">
            {isFetchingPlatforms ? (
              <>Please wait...</>
            ) : (
              <>
                No platforms available. Please{" "}
                <a target="_blank" href="https://discord.com/download">
                  install Discord
                </a>{" "}
                and try again.
              </>
            )}
          </div>
          <div className="platform-bottom">
            <button
              onClick={async () => {
                if (isFetchingPlatforms) return;
                setIsFetchingPlatforms(true);
                await Promise.all([init, new Promise((resolve) => setTimeout(resolve, 1000))]);
                setIsFetchingPlatforms(false);
              }}
              className="button"
              disabled={isFetchingPlatforms}>
              Try again
            </button>
          </div>
        </>
      )}
    </div>
  );
}
