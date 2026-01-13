import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Button from "@/components/basics/Button";

export default function SectionCard({
  title,
  actionLabel,
  onAction,
  children,
  viewAllHref,
  viewAllText = "Ver todos",
  className = "",
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col h-full ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#0E3C42]">{title}</h2>
        {actionLabel && onAction && (
          <Button
            variant="primary"
            size="S"
            onClick={onAction}
            className="!text-sm !py-1.5 !px-4" // Override for smaller header button if needed
          >
            + {actionLabel}
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] scrollbar-hide">
        {children}
      </div>

      {viewAllHref && (
        <div className="mt-6 text-center pt-2">
          <Link
            href={viewAllHref}
            className="text-[#6A7EFF] font-medium hover:underline inline-flex items-center gap-1"
          >
            {viewAllText} <ChevronRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
