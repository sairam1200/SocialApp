"use client";

import { useState } from "react";

export default function RefreshTestPage() {
  const [result, setResult] =
    useState("");

  const testRefresh =
    async () => {
      try {
        const deviceId =
          localStorage.getItem(
            "deviceId"
          );

        const response =
          await fetch(
            "/api/auth/refresh",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              credentials:
                "include",
              body: JSON.stringify({
                deviceId,
              }),
            }
          );

        const text =
          await response.text();

        console.log(
          "STATUS:",
          response.status
        );

        console.log(
          "BODY:",
          text
        );

        setResult(
          `Status: ${response.status}\n\n${text}`
        );
      } catch (error) {
        console.error(error);

        setResult(
          String(error)
        );
      }
    };

  return (
    <div
      style={{
        padding: 20,
      }}
    >
      <h1>
        Refresh Token Test
      </h1>

      <button
        onClick={testRefresh}
      >
        Test Refresh
      </button>

      <pre>
        {result}
      </pre>
    </div>
  );
}