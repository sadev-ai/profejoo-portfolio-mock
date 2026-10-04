// A sample page component (moved from AppRouter.tsx)

export default function SimplePage( {title}: {title: string} ) {
    return (
        <div className="p-6">
    <h1 className="text-xl font-semibold">{title}</h1>
    <p className="mt-2 text-sm text-muted-foreground">
      This page is not implemented yet.
    </p>
  </div>
    );
}
