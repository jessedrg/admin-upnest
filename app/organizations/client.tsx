"use client";

import { useOrganizations } from "@/lib/queries";
import { PageSkeleton, TopProgress } from "@/components/ui/skeleton";
import type { Org } from "@/lib/schemas";

export function OrganizationsClient({ initial }: { initial: Org[] }) {
  const q = useOrganizations();
  const list = q.data ?? initial;

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-rule-2 bg-paper/85 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-9">
          <h1 className="serif text-[22px] tracking-editorial">
            Organizations
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-t-3 text-sm">{list.length} total</span>
            <button className="btn btn-primary">+ Add organization</button>
          </div>
        </div>
        <TopProgress active={q.isFetching} />
      </header>
      {q.isLoading ? (
        <PageSkeleton variant="kpi-table" />
      ) : list.length === 0 ? (
        <div className="px-9 py-16 text-center">
          <p className="text-t-3">No organizations found.</p>
        </div>
      ) : (
        <div className="px-9 py-8">
          <div className="rounded-lg border border-rule-2 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper-soft text-left">
                <tr>
                  <th className="px-4 py-3 label">Organization</th>
                  <th className="px-4 py-3 label">Industry</th>
                  <th className="px-4 py-3 label">Size</th>
                  <th className="px-4 py-3 label">Contact</th>
                  <th className="px-4 py-3 label">Type</th>
                </tr>
              </thead>
              <tbody>
                {list.map((org) => (
                  <tr
                    key={org.id}
                    className="border-t border-rule-2 hover:bg-paper-soft/60"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {org.logo_url ? (
                          <img
                            src={org.logo_url}
                            alt=""
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-paper-2 grid place-items-center text-xs">
                            {org.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{org.name}</div>
                          {org.website && (
                            <a
                              href={org.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-t-3 hover:underline"
                            >
                              {org.website.replace(/^https?:\/\//, "")}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-t-3">
                      {org.industry || "—"}
                    </td>
                    <td className="px-4 py-3 text-t-3">
                      {org.company_size || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{org.contact_name || "—"}</div>
                      {org.contact_email && (
                        <div className="text-xs text-t-3">
                          {org.contact_email}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium bg-gray-100 text-gray-600">
                        {org.account_type || "client"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
