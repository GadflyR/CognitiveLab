import React from "react";

interface Props {
  value: number; // 0 … 1
}

export const ProgressBar: React.FC<Props> = ({ value }) => (
  <div className="w-full bg-slate-200 rounded-2xl h-3 overflow-hidden">
    <div
      className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 h-full transition-all duration-300"
      style={{ width: `${value * 100}%` }}
    />
  </div>
);
