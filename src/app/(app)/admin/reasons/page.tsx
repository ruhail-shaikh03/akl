import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getAdminReasons } from "./actions";
import { DeleteReasonButton } from "./DeleteReasonButton";

export default async function AdminReasonsPage() {
  const reasons = await getAdminReasons();

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-8 pt-safe pt-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Reasons</h1>
        <Link
          href="/admin/reasons/new"
          className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          <Plus className="size-4" aria-hidden="true" />
          New
        </Link>
      </div>

      {reasons.length === 0 && <p className="text-sm text-muted-foreground">No reasons yet.</p>}

      <ul className="flex flex-col gap-2">
        {reasons.map((reason) => (
          <li key={reason.id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">{reason.text}</span>
              {!reason.isActive && <span className="text-xs text-muted-foreground">inactive</span>}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Link
                href={`/admin/reasons/${reason.id}/edit`}
                aria-label="Edit"
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <Pencil className="size-4" aria-hidden="true" />
              </Link>
              <DeleteReasonButton id={reason.id} />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
