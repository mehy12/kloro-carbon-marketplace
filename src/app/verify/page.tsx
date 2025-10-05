import { db } from "@/db";
import { certificateRecord, transaction, buyerProfile, sellerProfile, carbonCredit, project } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function VerifyPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const certId = (typeof searchParams.certId === "string" ? searchParams.certId : Array.isArray(searchParams.certId) ? searchParams.certId[0] : undefined) || "";

  if (!certId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">Certificate Verification</h1>
        <p className="mt-2 text-sm text-muted-foreground">Missing certId query parameter.</p>
      </div>
    );
  }

  const rows = await db
    .select({
      cert: certificateRecord,
      txn: transaction,
      buyer: buyerProfile,
      seller: sellerProfile,
      credit: carbonCredit,
      proj: project,
    })
    .from(certificateRecord)
    .leftJoin(transaction, eq(transaction.id, certificateRecord.transactionId))
    .leftJoin(buyerProfile, eq(buyerProfile.id, transaction.buyerId))
    .leftJoin(sellerProfile, eq(sellerProfile.id, transaction.sellerId))
    .leftJoin(carbonCredit, eq(carbonCredit.id, transaction.creditId))
    .leftJoin(project, eq(project.id, carbonCredit.projectId))
    .where(eq(certificateRecord.certId, certId as any))
    .limit(1);

  if (rows.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">Certificate Verification</h1>
        <div className="mt-4 rounded border border-rose-200 bg-rose-50 p-4 text-rose-700">
          Invalid certificate. No record found for certId: <span className="font-mono">{certId}</span>
        </div>
      </div>
    );
  }

  const r = rows[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold">Certificate Verification</h1>
      <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
        <div className="font-medium">Verified</div>
        <div className="text-sm text-emerald-800">This certificate is valid and recorded in our registry.</div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded border p-4">
          <div className="text-xs text-muted-foreground">Certificate ID</div>
          <div className="font-mono text-sm">{r.cert.certId}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-xs text-muted-foreground">Transaction ID</div>
          <div className="font-mono text-sm">{r.txn?.id}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-xs text-muted-foreground">Buyer</div>
          <div className="text-sm">{r.buyer?.companyName}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-xs text-muted-foreground">Seller</div>
          <div className="text-sm">{r.seller?.organizationName}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-xs text-muted-foreground">Project</div>
          <div className="text-sm">{r.proj?.name} ({String(r.proj?.type)})</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-xs text-muted-foreground">Registry</div>
          <div className="text-sm">{r.proj?.registry ?? "—"}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-xs text-muted-foreground">Quantity</div>
          <div className="text-sm">{r.txn?.quantity?.toLocaleString?.() ?? r.txn?.quantity}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-xs text-muted-foreground">Issued At</div>
          <div className="text-sm">{r.cert.createdAt?.toString?.() ?? ''}</div>
        </div>
      </div>
    </div>
  );
}
