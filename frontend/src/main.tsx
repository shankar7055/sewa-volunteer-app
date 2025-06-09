import { ThemeProvider } from "@/components/theme-provider"
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="sewa-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
