import React from "react";
import { createRoot } from "react-dom/client";
import PageTemplate from "../../Components/Templates/PageTemplate";
import "../../Styles/index.css";

function OptionsPage() {
  return (
    <PageTemplate>
      <div>Hello from the options!</div>
    </PageTemplate>
  );
}

createRoot(document.getElementById("options-root") as HTMLElement).render(
  <React.StrictMode>
    <OptionsPage />
  </React.StrictMode>
);
