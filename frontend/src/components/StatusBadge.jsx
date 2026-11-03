const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
