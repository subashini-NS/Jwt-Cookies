import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AppLayout() {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: "/", label: "Home", visible: true },
    { to: "/clients", label: "Clients", visible: hasPermission("CLIENT_READ") },
    { to: "/products", label: "Products", visible: hasPermission("PRODUCT_READ") },
  ].filter((item) => item.visible);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="app-shell">
      <nav className="navbar bg-white border-bottom shadow-sm">
        <div className="container d-flex flex-wrap justify-content-between align-items-center gap-2 py-2">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <NavLink className="navbar-brand mb-0 fw-semibold me-2" to="/">
              CRM Panel
            </NavLink>
            <div className="d-flex flex-wrap gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `btn btn-sm ${isActive ? "btn-primary" : "btn-outline-primary"}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 ms-auto">
            <span className="small text-muted d-none d-md-inline">
              {user?.email}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <Outlet />
      </main>
    </div>
  );
}
