"use client";

import { Trash2 } from "lucide-react";

export default function DeleteForm({
  action,
  name,
  className = "p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors",
  iconSize = 14,
}: {
  action: () => void | Promise<void>;
  name: string;
  className?: string;
  iconSize?: number;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        className={className}
        title="Supprimer"
        onClick={(e) => {
          if (!confirm(`Supprimer "${name}" ?`)) e.preventDefault();
        }}
      >
        <Trash2 size={iconSize} />
      </button>
    </form>
  );
}
