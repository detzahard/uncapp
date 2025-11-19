import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import "./TipsButton.css";
import { ToggleButton } from "./ToggleButton";
import { isCorsProxyEnabled, setCorsProxyEnabled } from "../utils/UrlUtilities";

export interface TipsButtonProps {
  onClick: () => void;
}

export function TipsButton({ onClick }: TipsButtonProps): React.ReactElement {
  const [corsEnabled, setCorsEnabled] = React.useState<boolean>(true);

  React.useEffect(() => {
    setCorsEnabled(isCorsProxyEnabled());
  }, []);

  const handleToggle = () => {
    const next = !corsEnabled;
    setCorsProxyEnabled(next);
    setCorsEnabled(next);
  };
  return (
    <div className="tips-button">
      <button className="button is-rounded is-primary is-outlined" onClick={onClick}>
        <span className="is-icon is-small">
          <FontAwesomeIcon icon={faQuestionCircle} />
        </span>
      </button>
      <div className="tips-toggle">
        <ToggleButton
          status={corsEnabled}
          onToggle={handleToggle}
          buttonText={(status) => (status ? "Proxy ON" : "Proxy OFF")}
          classes={"is-small"}
        />
      </div>
    </div>
  );
}
