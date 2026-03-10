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
    imageUrl: "",
  });
  const [previewBroken, setPreviewBroken] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        productName: initialData.productName || "",
        price: initialData.price ?? "",
        quantity: initialData.quantity ?? "",
        imageUrl: initialData.imageUrl || "",
      });
      return;
    }

    setForm({
      productName: "",
      price: "",
      quantity: "",
      imageUrl: "",
    });
  }, [initialData, show]);

  useEffect(() => {
    setPreviewBroken(false);
  }, [form.imageUrl, show]);

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
              <input
                className="form-control mt-2"
                placeholder="Image URL"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm({ ...form, imageUrl: e.target.value })
                }
              />
              {form.imageUrl && !previewBroken && (
                <div className="mt-2 text-center border rounded p-2 bg-light">
                  <img
                    src={form.imageUrl}
                    alt="Product preview"
                    className="product-image-preview"
                    onError={() => setPreviewBroken(true)}
                  />
                </div>
              )}
              {form.imageUrl && previewBroken && (
                <div className="mt-2 text-danger small">Image URL is not valid.</div>
              )}
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
