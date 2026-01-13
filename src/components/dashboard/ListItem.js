import React from "react";
import { ChevronRight } from "lucide-react";

export default function ListItem({
  overline, // Top small text
  title, // Main text
  subtitle, // Bottom text
  status, // { text, color, dot }
  onClick,
  icon: Icon, // Optional left icon
  className = "",
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group flex items-center justify-between ${className}`}
    >
      <div className="flex items-start gap-4 flex-1">
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
            <Icon size={20} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {overline && (
            <p className="text-xs text-gray-500 mb-1 truncate">{overline}</p>
          )}

          <h3 className="font-semibold text-[#0E3C42] mb-1 truncate leading-tight">
            {title}
          </h3>

          {subtitle && (
            <p className="text-xs text-gray-500 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pl-2">
        {status && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap ${
              status.color || "bg-gray-100 text-gray-600"
            }`}
          >
            {status.dot && (
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
            )}
            {status.text}
          </span>
        )}

        <ChevronRight
          size={20}
          className="text-gray-400 group-hover:text-[#6A7EFF] transition-colors"
        />
      </div>
    </div>
  );
}
