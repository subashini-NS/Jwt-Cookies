export default function ConfirmModal({
  show,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  if (!show) return null;

  return (
    <div className="modal fade show d-block">
      <div className="modal-dialog modal-sm">
        <div className="modal-content">
          <div className="modal-header">
            <h6 className="modal-title">{title}</h6>
          </div>
          <div className="modal-body">{message}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={onConfirm}>
              Delete
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </div>
  );
}
