import React from "react";
import ReactDOM from "react-dom";
import PageTemplate from "../../Components/Templates/PageTemplate";
import "../../Styles/index.css";

function PopupPage() {
  return (
    <PageTemplate>
      <div>Hello from the popup!</div>
    </PageTemplate>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <PopupPage />
  </React.StrictMode>,
  document.getElementById("popup-root")
);
