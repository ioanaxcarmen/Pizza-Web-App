import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute component
 * Checks if the user is authenticated (by checking for an auth token in localStorage).
 * If authenticated, renders the child components.
 * If not authenticated, redirects the user to the login page ("/").
 */
const ProtectedRoute = ({ children }) => {
  // Retrieve the authentication token from localStorage
  const token = localStorage.getItem("authToken");
  // If token exists, render children; otherwise, redirect to login
  return token ? children : <Navigate to="/" />;
};

export default ProtectedRoute;