import React from "react";
import ReactDOM from "react-dom";
import PageTemplate from "../../Components/Templates/PageTemplate";
import "../../Styles/index.css";

function OptionsPage() {
  return (
    <PageTemplate>
      <div>Hello from the options!</div>
    </PageTemplate>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <OptionsPage />
  </React.StrictMode>,
  document.getElementById("options-root")
);
