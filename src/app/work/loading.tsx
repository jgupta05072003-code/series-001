export default function Loading() {
  return (
    <div className="page" aria-busy="true">
      <div className="spinner" role="status" aria-label="Loading the archive" />
    </div>
  );
}
