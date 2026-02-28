import { useAuth } from "../auth/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="container mt-5">
      <div className="card p-4">
        <h4>Welcome</h4>
        <p>
          Logged in as <strong>{user.email}</strong>
        </p>
        <button className="btn btn-outline-danger" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}
