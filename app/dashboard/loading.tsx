export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <span
        className="h-10 w-10 animate-spin rounded-full border-4
                   border-t-transparent border-primary"
        aria-label="Loading"
      />
    </div>
  )
}
