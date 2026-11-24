/** `action` is any React node, usually a button or link that helps the user recover. */
export default function EmptyState({ title, message, action }) {
  return (
    <div className="state">
      <h2>{title}</h2>
      <p>{message}</p>
      {action}
    </div>
  );
}
