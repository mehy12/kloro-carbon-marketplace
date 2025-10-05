import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import {
  buyerProfile,
  sellerProfile,
  transaction,
  carbonCredit,
  project,
  certificateRecord,
} from "@/db/schema";
import { buildCertificateHtml } from "@/lib/certificates/template";
import { makeQrDataUrl, renderPdfFromHtml } from "@/lib/certificates/generator";
import archiver from "archiver";
import { PassThrough } from "stream";

function getOrigin(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

async function zipBuffers(files: { name: string; data: Buffer }[]): Promise<Buffer> {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = new PassThrough();
  const chunks: Buffer[] = [];
  stream.on("data", (c) => chunks.push(c as Buffer));

  const done = new Promise<Buffer>((resolve, reject) => {
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });

  archive.on("error", (err) => stream.emit("error", err));
  archive.pipe(stream);
  files.forEach((f) => archive.append(f.data, { name: f.name }));
  await archive.finalize();

  return done;
}

export async function POST(req: NextRequest) {
  try {
    const { transactionId, copies = 1, regenerate = false } = await req.json();
    if (!transactionId || typeof transactionId !== "string") {
      return NextResponse.json({ error: "transactionId is required" }, { status: 400 });
    }
    const copiesInt = Math.max(1, Math.min(Number(copies) || 1, 20));

    const hdrs = await headers();
    const session = await auth.api.getSession({ headers: hdrs });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch transaction and joins
    const rows = await db
      .select({
        txn: transaction,
        buyer: buyerProfile,
        seller: sellerProfile,
        credit: carbonCredit,
        proj: project,
      })
      .from(transaction)
      .leftJoin(buyerProfile, eq(buyerProfile.id, transaction.buyerId))
      .leftJoin(sellerProfile, eq(sellerProfile.id, transaction.sellerId))
      .leftJoin(carbonCredit, eq(carbonCredit.id, transaction.creditId))
      .leftJoin(project, eq(project.id, carbonCredit.projectId))
      .where(eq(transaction.id, transactionId as any))
      .limit(1);

    if (rows.length === 0) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    const row = rows[0];

    // Access control: buyer or seller affiliated only
    if (session.user.role === "buyer") {
      if (row.buyer?.userId !== (session.user.id as any)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (session.user.role === "seller") {
      if (row.seller?.userId !== (session.user.id as any)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Insufficient role" }, { status: 403 });
    }

    if (row.txn.status !== ("completed" as any)) {
      return NextResponse.json({ error: "Certificate available only for completed transactions" }, { status: 400 });
    }

    // Find or create certificate record
    let existing = await db
      .select()
      .from(certificateRecord)
      .where(eq(certificateRecord.transactionId, transactionId as any))
      .limit(1);

    let certId: string;
    let certRow = existing[0];
    const origin = getOrigin(req);

    if (!certRow || regenerate) {
      certId = crypto.randomUUID();
      const id = crypto.randomUUID();
      const verificationUrl = `${origin}/verify?certId=${certId}`;

      if (!certRow) {
        await db.insert(certificateRecord).values({
          id: id as any,
          certId: certId as any,
          transactionId: transactionId,
          issuedToBuyerId: row.txn.buyerId as any,
          issuedToSellerId: row.txn.sellerId as any,
          verificationUrl: verificationUrl as any,
        });
      } else {
        // If regenerating: keep same DB id but update fields (optional)
        certRow = { ...certRow, certId: certId as any, verificationUrl: verificationUrl as any } as any;
      }
    } else {
      certId = existing[0].certId as any;
    }

    // If certRow not re-fetched, ensure we reflect latest verification URL for QR
    const verificationUrl = `${origin}/verify?certId=${certId}`;
    const qrDataUrl = await makeQrDataUrl(verificationUrl);

    const html = buildCertificateHtml({
      buyerCompanyName: row.buyer?.companyName ?? "Buyer",
      sellerCompanyName: row.seller?.organizationName ?? "Seller",
      numberOfCredits: Number(row.txn.quantity ?? 0),
      transactionId: row.txn.id,
      certificateId: certId,
      issueDate: new Date().toISOString().slice(0, 10),
      projectName: row.proj?.name ?? "—",
      projectType: (row.proj?.type as any) ?? "—",
      registry: row.proj?.registry ?? null,
      qrDataUrl,
    });

    const pdf = await renderPdfFromHtml(html);

    if (copiesInt > 1) {
      const files = Array.from({ length: copiesInt }).map((_, i) => ({
        name: `certificate_${certId}_${i + 1}.pdf`,
        data: pdf,
      }));
      const zip = await zipBuffers(files);
      return new NextResponse(zip, {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename=certificates_${certId}.zip`,
          "Content-Length": String(zip.length),
        },
      });
    }

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=certificate_${certId}.pdf`,
        "Content-Length": String(pdf.length),
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}
