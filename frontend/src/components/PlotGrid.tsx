import { useState } from 'react'
import { useStore } from '../hooks/useStore'
import { Plot, PlotStatus } from '../types'
import { PlotContextCard } from './PlotContextCard'
import clsx from 'clsx'

interface PlotGridProps {
  isAdmin: boolean
}

export function PlotGrid({ isAdmin }: PlotGridProps) {
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  
  const layout = useStore(state => state.layout)
  const filteredPlots = useStore(state => state.getFilteredPlots())

  // Fixed container dimensions
  const containerWidth = 1200  // Assuming standard container width
  const containerHeight = 800  // Fixed height
  
  // Calculate grid dimensions first
  const gridRows = Math.max(...layout.plots.map(p => p.row), 0) + 1
  const gridCols = Math.max(...layout.plots.map(p => p.col), 0) + 1
  
  // Calculate plot dimensions to fit 80% of container
  const padding = 100 // Total padding
  const availableWidth = containerWidth * 0.8 - padding
  const availableHeight = containerHeight * 0.8 - padding
  
  // Calculate optimal plot size
  const plotGapRatio = 0.15 // Gap is 15% of plot size
  const plotWidth = Math.floor(availableWidth / (gridCols + (gridCols - 1) * plotGapRatio))
  const plotHeight = Math.floor(availableHeight / (gridRows + (gridRows - 1) * plotGapRatio))
  
  // Use the smaller dimension to maintain aspect ratio
  const plotSize = Math.min(plotWidth, plotHeight, 200) // Cap at 200 for very small grids
  const plotGap = Math.floor(plotSize * plotGapRatio)


  const handlePlotClick = (plot: Plot) => {
    if (isAdmin) {
      setSelectedPlot(plot)
    }
  }

  // Calculate total SVG dimensions based on actual plot size
  const svgWidth = gridCols * plotSize + (gridCols - 1) * plotGap + padding
  const svgHeight = gridRows * plotSize + (gridRows - 1) * plotGap + padding


  const getPlotClass = (status: PlotStatus) => {
    switch (status) {
      case 'available': return 'plot-available'
      case 'booked': return 'plot-booked'
      case 'agreement': return 'plot-agreement'
      case 'registration': return 'plot-registration'
    }
  }

  return (
    <>
      <div className="relative overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ minHeight: '600px' }}
        >
          {/* Grid Background */}
          <defs>
            <pattern id="grid" width={plotSize + plotGap} height={plotSize + plotGap} patternUnits="userSpaceOnUse">
              <path d={`M ${plotSize + plotGap} 0 L 0 0 0 ${plotSize + plotGap}`} fill="none" stroke="#e5e7eb" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Plots */}
          {layout.plots.map(plot => {
            const x = plot.col * (plotSize + plotGap) + padding/2
            const y = plot.row * (plotSize + plotGap) + padding/2
            const isFiltered = filteredPlots.some(p => p.id === plot.id)
            
            return (
              <g
                key={plot.id}
                transform={`translate(${x}, ${y})`}
                className={clsx(
                  isAdmin && 'plot-interactive',
                  !isFiltered && 'opacity-20'
                )}
                onClick={() => isFiltered && handlePlotClick(plot)}
              >
                <rect
                  width={plotSize}
                  height={plotSize}
                  rx="8"
                  className={getPlotClass(plot.status)}
                  stroke="#374151"
                  strokeWidth="2"
                />
                <text
                  x={plotSize / 2}
                  y={plotSize / 2 - plotSize * 0.1}
                  textAnchor="middle"
                  className="font-bold fill-white select-none"
                  style={{ fontSize: `${plotSize * 0.3}px` }}
                >
                  {plot.plotNumber}
                </text>
                {plot.dimension.toLowerCase() === 'odd' ? (
                  <text
                    x={plotSize / 2}
                    y={plotSize / 2 + plotSize * 0.2}
                    textAnchor="middle"
                    className="fill-white select-none"
                    style={{ fontSize: `${plotSize * 0.2}px` }}
                  >
                    Odd
                  </text>
                ) : (
                  <>
                    <text
                      x={plotSize / 2}
                      y={plotSize / 2 + plotSize * 0.15}
                      textAnchor="middle"
                      className="fill-white select-none"
                      style={{ fontSize: `${plotSize * 0.15}px` }}
                    >
                      {plot.dimension}
                    </text>
                    <text
                      x={plotSize / 2}
                      y={plotSize / 2 + plotSize * 0.35}
                      textAnchor="middle"
                      className="fill-white select-none opacity-80"
                      style={{ fontSize: `${plotSize * 0.12}px` }}
                    >
                      {plot.area} sq ft
                    </text>
                  </>
                )}
                {/* Multiple booking indicator */}
                {plot.status === 'booked' && plot.bookings && plot.bookings.length > 1 && (
                  <>
                    <circle
                      cx={plotSize - plotSize * 0.15}
                      cy={plotSize * 0.15}
                      r={plotSize * 0.12}
                      fill="#dc2626"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      x={plotSize - plotSize * 0.15}
                      y={plotSize * 0.2}
                      textAnchor="middle"
                      className="font-bold fill-white select-none"
                      style={{ fontSize: `${plotSize * 0.15}px` }}
                    >
                      {plot.bookings.length}
                    </text>
                  </>
                )}
              </g>
            )
          })}
        </svg>

      </div>

      {selectedPlot && (
        <PlotContextCard
          plot={selectedPlot}
          onClose={() => setSelectedPlot(null)}
        />
      )}
    </>
  )
}