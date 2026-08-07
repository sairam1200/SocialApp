import type { Metadata } from "next";
import DataExportPageContent from "./page-content";

export const metadata: Metadata = {
  title: "Data Export — Gaddr",
  description: "Request and download a copy of all data associated with your Gaddr account.",
  robots: { index: false, follow: false },
};

export default function DataExportPage() {
  return <DataExportPageContent />;
}
