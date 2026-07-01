"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function DataDeletion() {
  const searchParams = useSearchParams();
  const [confirmationCode, setConfirmationCode] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setConfirmationCode(code);
    }
  }, [searchParams]);

  const handleDelete = () => {
    const code = confirmationCode.trim();

    if (!code) {
      alert("Please enter your confirmation code.");
      return;
    }

    window.location.href = `https://socialapp-backend-bx75.onrender.com/data-deletion?code=${encodeURIComponent(
      code
    )}`;
  };

  return (
    <main
      style={{
        maxWidth: "700px",
        margin: "50px auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Facebook Data Deletion</h1>

      <p>
        Enter the confirmation code you received from Facebook to continue your
        data deletion request.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginTop: "24px",
        }}
      >
        <input
          type="text"
          placeholder="Enter confirmation code"
          value={confirmationCode}
          onChange={(e) => setConfirmationCode(e.target.value)}
          style={{
            padding: "12px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <button
          onClick={handleDelete}
          style={{
            padding: "12px",
            fontSize: "16px",
            backgroundColor: "#1877F2",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Continue Data Deletion
        </button>
      </div>

      <hr style={{ margin: "40px 0" }} />

      <h2>Manual Request</h2>

      <p>
        If you don't have a confirmation code, you can still request data
        deletion by emailing <strong>support@gaddr.com</strong> with the subject:
      </p>

      <p>
        <strong>Data Deletion Request</strong>
      </p>

      <p>We will process your request within 30 days.</p>
    </main>
  );
}