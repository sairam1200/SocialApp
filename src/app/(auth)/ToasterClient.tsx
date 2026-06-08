"use client";

import { Toaster } from "react-hot-toast";

export function ToasterClient() {
    return (
        <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{ duration: 5000, style: { fontSize: "0.875rem" } }}
        />
    );
}
