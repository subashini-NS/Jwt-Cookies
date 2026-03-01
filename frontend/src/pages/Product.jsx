import { useEffect, useState } from "react";
import {
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/product.api";
import ProductFormModal from "../components/ProductFormModal";
import ConfirmModal from "../components/ConfirmModal";

export default function Product() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brokenImages, setBrokenImages] = useState({});

  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    const res = await fetchProduct();
    setProducts(res.data.data);
    setBrokenImages({});
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAdd = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleSubmit = async (data) => {
    if (selectedProduct) {
      await updateProduct(selectedProduct._id, data);
    } else {
      await createProduct(data);
    }
    setShowForm(false);
    loadProducts();
  };

  const handleDelete = async () => {
    await deleteProduct(deleteId);
    setShowDelete(false);
    loadProducts();
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h4>Products</h4>
        <button className="btn btn-primary" onClick={handleAdd}>
          Add Product
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Product Name</th>
              <th>Image</th>
              <th>Price</th>
              <th>Quantity</th>
              <th width="180">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.productName}</td>
                <td>
                  {p.imageUrl && !brokenImages[p._id] ? (
                    <img
                      src={p.imageUrl}
                      alt={p.productName}
                      className="product-thumb"
                      onError={() =>
                        setBrokenImages((prev) => ({
                          ...prev,
                          [p._id]: true,
                        }))
                      }
                    />
                  ) : (
                    <span className="text-muted">No image</span>
                  )}
                </td>
                <td>{p.price ?? "-"}</td>
                <td>{p.quantity ?? "-"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-info me-1"
                    onClick={() => handleEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      setDeleteId(p._id);
                      setShowDelete(true);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!products.length && (
              <tr>
                <td colSpan="5" className="text-center">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ProductFormModal
        show={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        initialData={selectedProduct}
      />

      <ConfirmModal
        show={showDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
