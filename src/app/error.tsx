"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="page">
      <div className="state" role="alert">
        <h1 className="state__title">Something broke</h1>
        <p className="body-copy">That wasn&apos;t supposed to happen. Give it another go.</p>
        <button type="button" className="btn" style={{ marginTop: 16 }} onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
