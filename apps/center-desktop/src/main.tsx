import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#root");
if (root === null) throw new Error("StemWeave root elementi bulunamadı.");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
