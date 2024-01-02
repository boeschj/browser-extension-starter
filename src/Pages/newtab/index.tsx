import React from "react";
import ReactDOM from "react-dom";
import PageTemplate from "../../Components/Templates/PageTemplate";
import "../../Styles/index.css";

function NewTabPage() {
  return (
    <PageTemplate>
      <div>Hello from the new tab!</div>
    </PageTemplate>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <NewTabPage />
  </React.StrictMode>,
  document.getElementById("newtab-root")
);
