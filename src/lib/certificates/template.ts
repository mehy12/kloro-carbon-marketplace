export type CertificateData = {
  buyerCompanyName: string;
  sellerCompanyName: string;
  numberOfCredits: number;
  transactionId: string;
  certificateId: string;
  issueDate: string; // ISO string or formatted
  projectName: string;
  projectType: string;
  registry: string | null;
  qrDataUrl: string;
};

export function buildCertificateHtml(data: CertificateData) {
  const {
    buyerCompanyName,
    sellerCompanyName,
    numberOfCredits,
    transactionId,
    certificateId,
    issueDate,
    projectName,
    projectType,
    registry,
    qrDataUrl,
  } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Carbon Transaction Certificate</title>
  <style>
    @page { size: A4; margin: 24mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #1f2937; }
    .container { border: 2px solid #065f46; border-radius: 8px; padding: 24px; }
    .header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; }
    .brand { font-size: 18px; font-weight: 700; color: #065f46; }
    .title { text-align:center; font-size: 24px; margin: 6px 0 16px; color:#065f46; }
    .meta { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; font-size: 12px; }
    .meta .card { border: 1px solid #d1fae5; background: #ecfdf5; padding: 12px; border-radius: 6px; }
    .section { margin: 16px 0; }
    .label { font-size: 12px; color: #6b7280; }
    .value { font-size: 16px; font-weight: 600; color: #111827; }
    .grid { display:grid; grid-template-columns:1fr 1fr; gap: 16px; }
    .qr { display:flex; align-items:center; gap: 12px; margin-top: 12px; }
    .footer { margin-top: 24px; display:flex; align-items:center; justify-content:space-between; font-size: 12px; color:#4b5563; }
    .sign { text-align:right; }
    .muted { color:#6b7280; }
    .divider { height:1px; background:#d1d5db; margin: 12px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Carbon Exchange Portal</div>
      <div class="muted">Certificate ID: ${certificateId}</div>
    </div>
    <div class="title">Certificate of Carbon Credit Transaction</div>

    <div class="meta">
      <div class="card">
        <div class="label">Buyer</div>
        <div class="value">${escapeHtml(buyerCompanyName)}</div>
      </div>
      <div class="card">
        <div class="label">Seller</div>
        <div class="value">${escapeHtml(sellerCompanyName)}</div>
      </div>
      <div class="card">
        <div class="label">Number of Credits</div>
        <div class="value">${numberOfCredits.toLocaleString()}</div>
      </div>
      <div class="card">
        <div class="label">Date of Issue</div>
        <div class="value">${escapeHtml(issueDate)}</div>
      </div>
    </div>

    <div class="grid">
      <div class="section">
        <div class="label">Project Name</div>
        <div class="value">${escapeHtml(projectName)}</div>
        <div class="label" style="margin-top:8px">Project Type</div>
        <div class="value">${escapeHtml(projectType)}</div>
        <div class="label" style="margin-top:8px">Registry</div>
        <div class="value">${escapeHtml(registry ?? "—")}</div>
      </div>
      <div class="section">
        <div class="label">Transaction ID</div>
        <div class="value">${escapeHtml(transactionId)}</div>
        <div class="label" style="margin-top:8px">Verification</div>
        <div class="qr">
          <img src="${qrDataUrl}" alt="QR" width="110" height="110" />
          <div class="muted">Scan to verify this certificate online.</div>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="footer">
      <div>
        <div class="muted">Issued by</div>
        <div class="value">Carbon Exchange Portal</div>
      </div>
      <div class="sign">
        <div class="muted">Authorized Signature</div>
        <div style="margin-top:6px; padding: 8px 0; border-top: 1px solid #d1d5db; width:220px; margin-left:auto"></div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
