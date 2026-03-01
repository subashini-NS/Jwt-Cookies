import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Registration failed. Check backend status and role seed data.",
      );
    }
  };

  return (
    <div className="container mt-5 col-md-4">
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h3 className="mb-3">Register</h3>
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
              minLength={8}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button className="btn btn-success w-100">Register</button>
          </form>
          <p className="text-muted small mt-3 mb-0 text-center">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
