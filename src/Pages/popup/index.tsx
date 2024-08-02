import React from "react";
import { createRoot } from "react-dom/client";
import PageTemplate from "../../Components/Templates/PageTemplate";
import "../../Styles/index.css";

function PopupPage() {
  return (
    <PageTemplate>
      <div>Hello from the popup!</div>
    </PageTemplate>
  );
}

createRoot(document.getElementById("popup-root") as HTMLElement).render(
  <React.StrictMode>
    <PopupPage />
  </React.StrictMode>
);
