import "./ChooseAction.css";
import "../App.css";
import { Link } from "react-router-dom";

export function ChooseAction({
  action,
  setAction,
}: {
  action: "plug" | "unplug";
  setAction: (action: "plug" | "unplug") => void;
}): React.ReactElement {
  return (
    <div className="page action-page">
      <div className="action-page-header">Choose Action</div>
      <div className="choose-action">
        <label
          htmlFor="radio-plug"
          className={`button action-button ${action === "plug" ? "action-button-active" : ""}`}>
          <input
            id="radio-plug"
            type="radio"
            name="action"
            value="plug"
            checked={action === "plug"}
            onChange={() => setAction("plug")}
          />
          <span>Plug</span>
        </label>
        <label
          htmlFor="radio-unplug"
          className={`button action-button ${action === "unplug" ? "action-button-active" : ""}`}>
          <input
            id="radio-unplug"
            type="radio"
            name="action"
            value="unplug"
            checked={action === "unplug"}
            onChange={() => setAction("unplug")}
          />
          <span>Unplug</span>
        </label>
      </div>
      <div className="action-bottom">
        <Link to="/platform" className="button">
          Continue
        </Link>
      </div>
    </div>
  );
}
