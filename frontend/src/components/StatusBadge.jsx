function StatusBadge({ status }) {
  return <span className={`status-pill status-pill--${status}`}>{status}</span>;
}

export default StatusBadge;
