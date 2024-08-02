import React from "react";
import { createRoot } from "react-dom/client";
import PageTemplate from "../../Components/Templates/PageTemplate";
import "../../Styles/index.css";

function NewTabPage() {
  return (
    <PageTemplate>
      <div>Hello from the new tab!</div>
    </PageTemplate>
  );
}

createRoot(document.getElementById("newtab-root") as HTMLElement).render(
  <React.StrictMode>
    <NewTabPage />
  </React.StrictMode>
);
