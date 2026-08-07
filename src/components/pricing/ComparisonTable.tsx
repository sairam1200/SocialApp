import React from "react";
import { COMPARISON_FEATURES } from "@/constants/pricing";
import { CheckCircleIcon } from "@/components/icons/CheckCircleIcon";

export function ComparisonTable() {
  return (
    <section className="max-w-6xl mx-auto px-4 pb-16">
      <h2 className="text-2xl font-bold text-center text-[#2A155C] mb-8">
        Compare Plan Features
      </h2>

      {/* Floating card with smooth shadow depth matching the mockup */}
      <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(82,51,198,0.12)] border border-purple-100/60 overflow-x-auto p-6 md:p-8 transform transition-all duration-300">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-purple-100 text-neutral-900 font-bold">
              <th className="pb-4 w-2/5 text-lg">Feature</th>
              <th className="pb-4 text-center text-[#5233C6] text-base">
                Essential
              </th>
              <th className="pb-4 text-center text-[#5233C6] text-base">
                Creator
              </th>
              <th className="pb-4 text-center text-[#5233C6] text-base">
                Visionary
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50">
            {COMPARISON_FEATURES.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-purple-50/40 transition-colors"
              >
                <td className="py-3.5 text-sm font-medium text-neutral-700">
                  {row.name}
                </td>

                {/* Essential Column */}
                <td className="py-3.5 text-center">
                  {row.essential ? (
                    <CheckCircleIcon className="w-5 h-5 mx-auto" />
                  ) : (
                    <span className="text-neutral-400 font-bold">—</span>
                  )}
                </td>

                {/* Creator Column */}
                <td className="py-3.5 text-center">
                  {row.creator ? (
                    <CheckCircleIcon className="w-5 h-5 mx-auto" />
                  ) : (
                    <span className="text-neutral-400 font-bold">—</span>
                  )}
                </td>

                {/* Visionary Column */}
                <td className="py-3.5 text-center">
                  {row.visionary ? (
                    <CheckCircleIcon className="w-5 h-5 mx-auto" />
                  ) : (
                    <span className="text-neutral-400 font-bold">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}