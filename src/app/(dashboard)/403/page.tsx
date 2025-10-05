export default function ForbiddenPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">403 — Unauthorized</h1>
      <p className="text-muted-foreground mt-2">You do not have access to this page.</p>
      <a href="/sign-in" className="text-primary underline mt-4 inline-block">Go to Sign In</a>
    </div>
  );
}
