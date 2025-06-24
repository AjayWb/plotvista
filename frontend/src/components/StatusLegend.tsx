export function StatusLegend() {
  const statuses = [
    { label: 'Available', color: 'bg-green-500' },
    { label: 'Booked', color: 'bg-yellow-500' },
    { label: 'Agreement', color: 'bg-orange-500' },
    { label: 'Registration', color: 'bg-blue-500' },
  ]

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <span className="text-sm font-medium text-gray-700">Legend:</span>
      {statuses.map(status => (
        <div key={status.label} className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${status.color}`} />
          <span className="text-sm text-gray-600">{status.label}</span>
        </div>
      ))}
    </div>
  )
}