import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { UserContextProvider } from "./components/providers/UserContext.tsx"
// import { createBrowserRouter, RouterProvider } from "react-router-dom"
// import Calendar from "./components/fakeRouteStuff/Calendar.tsx"
// import VariableRoute from "./components/fakeRouteStuff/VariableRoute.tsx"
// import AnotherComponent from "./components/fakeRouteStuff/AnotherComponent.tsx"
// import LobbyHome from "./components/LobbyHome.tsx"



createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserContextProvider>
      {/* <RouterProvider router={router} /> */}
      <App />
    </UserContextProvider>
  </StrictMode>
)
