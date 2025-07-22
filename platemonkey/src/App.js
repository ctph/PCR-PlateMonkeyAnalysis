import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./frontend/layout/HomePage";
import Well96 from "./frontend/layout/96well";
import Well384 from "./frontend/layout/384well";
import SmartChipPage from "./frontend/layout/Smartchip";  

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/96well", element: <Well96 /> },
  { path: "/384well", element: <Well384 /> },
  { path: "/Smartchip", element: <SmartChipPage /> },  
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
