import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";

export default function Home() {
  const { user, hasPermission } = useAuth();

  const items = [
    {
      key: "CLIENT_READ",
      title: "Clients",
      description: "Manage your client directory, contact details, and updates.",
      to: "/clients",
      action: "Open Clients",
    },
    {
      key: "PRODUCT_READ",
      title: "Products",
      description: "Manage product catalog, pricing, quantity, and images.",
      to: "/products",
      action: "Open Products",
    },
  ].filter((item) => hasPermission(item.key));

  return (
    <div className="dashboard-root">
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <h4 className="mb-1">Welcome back</h4>
          <p className="text-muted mb-0">
            Logged in as <strong>{user.email}</strong>
          </p>
        </div>
      </div>

      <div className="row g-3">
        {items.map((item) => (
          <div className="col-12 col-md-6" key={item.key}>
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4 d-flex flex-column">
                <h5 className="mb-2">{item.title}</h5>
                <p className="text-muted mb-4">{item.description}</p>
                <Link className="btn btn-primary mt-auto align-self-start" to={item.to}>
                  {item.action}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!items.length && (
        <div className="alert alert-warning mt-4">
          You are logged in, but no dashboard module is assigned to your role.
        </div>
      )}
    </div>
  );
}
