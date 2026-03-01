import { useEffect, useState } from "react";

export default function ProductFormModal({
  show,
  onClose,
  onSubmit,
  initialData,
}) {
  const [form, setForm] = useState({
    productName: "",
    price: "",
    quantity: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        productName: initialData.productName || "",
        price: initialData.price ?? "",
        quantity: initialData.quantity ?? "",
      });
      return;
    }

    setForm({
      productName: "",
      price: "",
      quantity: "",
    });
  }, [initialData, show]);

  if (!show) return null;

  const submit = (e) => {
    e.preventDefault();

    onSubmit({
      ...form,
      price: form.price === "" ? 0 : Number(form.price),
      quantity: form.quantity === "" ? 0 : Number(form.quantity),
    });
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-backdrop fade show"></div>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={submit}>
            <div className="modal-header">
              <h5 className="modal-title">
                {initialData ? "Edit Product" : "Add Product"}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <input
                className="form-control mb-2"
                placeholder="Product Name"
                required
                value={form.productName}
                onChange={(e) =>
                  setForm({ ...form, productName: e.target.value })
                }
              />
              <input
                className="form-control mb-2"
                placeholder="Price"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <input
                className="form-control"
                placeholder="Quantity"
                type="number"
                min="0"
                step="1"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: e.target.value })
                }
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button className="btn btn-primary" type="submit">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
