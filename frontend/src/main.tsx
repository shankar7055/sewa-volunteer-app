import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import { ThemeProvider } from "./components/theme-provider"
import "./index.css"

console.log("main.tsx is loading")

const rootElement = document.getElementById("root")
console.log("Root element:", rootElement)

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="sewa-theme">
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>,
  )
} else {
  console.error("Root element not found!")
}
