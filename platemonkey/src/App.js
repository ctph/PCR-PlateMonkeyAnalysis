import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./frontend/layout/HomePage";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
