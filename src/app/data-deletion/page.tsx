"use client";

import { useSearchParams } from "next/navigation";

export default function DataDeletion() {
  const searchParams = useSearchParams();
  const confirmationCode = searchParams.get("code");

  const handleDeletion = () => {
    if (!confirmationCode) {
      alert("Missing confirmation code.");
      return;
    }

    window.open(
      `https://socialapp-backend-bx75.onrender.com/data-deletion?code=${encodeURIComponent(
        confirmationCode
      )}`,
      "_blank"
    );
  };

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "24px",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Facebook Data Deletion</h1>

      <p>
        If you requested deletion of your Facebook data, you can complete the
        deletion process using the button below.
      </p>

      {confirmationCode ? (
        <>
          <button
            onClick={handleDeletion}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              background: "#1877F2",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Delete My Facebook Data
          </button>

          <div style={{ marginTop: "30px" }}>
            <h3>Deletion Status</h3>

            <p>
              After your request is processed, you can check its status here:
            </p>

            <a
              href={`https://social-app-zeta-three.vercel.app/data-deletion?code=${encodeURIComponent(
                confirmationCode
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              https://social-app-zeta-three.vercel.app/data-deletion?code=
              {confirmationCode}
            </a>
          </div>
        </>
      ) : (
        <>
          <p>
            If you would like your account data deleted manually, email{" "}
            <strong>support@gaddr.com</strong> with the subject:
          </p>

          <p>
            <strong>Data Deletion Request</strong>
          </p>

          <p>
            We will process your request and remove associated data within 30
            days.
          </p>
        </>
      )}
    </main>
  );
}