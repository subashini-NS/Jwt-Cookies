import { useEffect, useState } from "react";
import {
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/product.api";

const Product = () => {
      const [products, setProducts] = useState([]);
      const [loading, setLoading] = useState(true);
    
    //   const [showForm, setShowForm] = useState(false);
      const [selectedProduct, setSelectedProduct] = useState(null);
    
      const [showDelete, setShowDelete] = useState(false);
      const [deleteId, setDeleteId] = useState(null);
    
      const loadProducts = async () => {
        setLoading(true);
        const res = await fetchProduct();
        setProducts(res.data.data);
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
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h4>Products</h4>
        <button className="btn btn-primary" onClick={handleAdd}>Add Product</button>
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>Product Name</th>
            <th>Price</th>
            <th>quantity</th>
            <th width="180">Actions</th>
          </tr>
        </thead>
        <tbody>
              {products.map((c) => (
                <tr key={c._id}>
                  <td>{c.productName}</td>
                  <td>{c.price || "-"}</td>
                  <td>{c.quantity || "-"}</td>
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
              {!products.length && (
                <tr>
                  <td colSpan="4" className="text-center">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
      </table>
    </div>
  );
};

export default Product;
