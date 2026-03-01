import { useEffect, useState } from "react";
import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
} from "../api/clients.api";

import ClientFormModal from "../components/ClientFormModal";
import ConfirmModal from "../components/ConfirmModal";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const loadClients = async () => {
    setLoading(true);
    const res = await fetchClients();
    setClients(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleAdd = () => {
    setSelectedClient(null);
    setShowForm(true);
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setShowForm(true);
  };

  const handleSubmit = async (data) => {
    if (selectedClient) {
      await updateClient(selectedClient._id, data);
    } else {
      await createClient(data);
    }
    setShowForm(false);
    loadClients();
  };

  const handleDelete = async () => {
    await deleteClient(deleteId);
    setShowDelete(false);
    loadClients();
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h4>Clients</h4>
        <button className="btn btn-primary" onClick={handleAdd}>
          Add Client
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th width="180">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.email || "-"}</td>
                <td>{c.phone || "-"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-info me-1"
                    onClick={() => handleEdit(c)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      setDeleteId(c._id);
                      setShowDelete(true);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!clients.length && (
              <tr>
                <td colSpan="4" className="text-center">
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ClientFormModal
        show={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        initialData={selectedClient}
      />

      <ConfirmModal
        show={showDelete}
        title="Delete Client"
        message="Are you sure you want to delete this client?"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
