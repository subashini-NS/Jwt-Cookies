import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Clients from "./pages/Clients.jsx";

import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import Product from "./pages/Product.jsx";
import AppLayout from "./components/AppLayout.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            element={<ProtectedRoute />}
          >
            <Route element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route
                path="clients"
                element={
                  <ProtectedRoute permission="CLIENT_READ">
                    <Clients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="products"
                element={
                  <ProtectedRoute permission="PRODUCT_READ">
                    <Product />
                  </ProtectedRoute>
                }
              />
              <Route path="product" element={<Navigate to="/products" replace />} />
            </Route>
          </Route>
          <Route
            path="*"
            element={
              <Navigate to="/" replace />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
