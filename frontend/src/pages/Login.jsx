import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const redirectTo = location.state?.from?.pathname || "/";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Login failed. Please check backend status and credentials.",
      );
    }
  };

  return (
    <div className="container mt-5 col-md-4">
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h3 className="mb-3">Login</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={submit}>
            <input
              className="form-control mb-2"
              placeholder="Email"
              type="email"
              required
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="form-control mb-3"
              placeholder="Password"
              type="password"
              required
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button className="btn btn-primary w-100">Login</button>
          </form>
          <p className="text-muted small mt-3 mb-0 text-center">
            New user? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
