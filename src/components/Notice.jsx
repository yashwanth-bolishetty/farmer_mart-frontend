export default function Notice({ message, success = false }) {
  if (!message) return null;
  return <div className={`notice ${success ? 'notice-success' : 'notice-error'}`} role="status">{message}</div>;
}
