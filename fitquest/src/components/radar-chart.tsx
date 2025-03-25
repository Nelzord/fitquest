"use client"

import { useEffect, useRef } from "react"
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js"
import { useTheme } from "next-themes"

// Register the required components
Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface RadarChartProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor: string
      borderColor: string
      borderWidth: number
    }[]
  }
}

export function RadarChart({ data }: RadarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Create new chart with theme-specific colors
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      // Customize colors based on theme
      const customData = {
        ...data,
        datasets: data.datasets.map((dataset) => ({
          ...dataset,
          backgroundColor: isDark
            ? "rgba(34, 197, 94, 0.2)" // Green with higher opacity for dark mode
            : "rgba(34, 197, 94, 0.1)",
          borderColor: isDark
            ? "rgba(34, 197, 94, 0.8)" // Brighter green for dark mode
            : "rgba(34, 197, 94, 0.6)",
          pointBackgroundColor: isDark ? "rgba(34, 197, 94, 1)" : "rgba(34, 197, 94, 0.8)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(34, 197, 94, 1)",
        })),
      }

      chartInstance.current = new Chart(ctx, {
        type: "radar",
        data: customData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: {
                stepSize: 20,
                showLabelBackdrop: false,
                color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.5)",
                font: {
                  size: 10,
                },
              },
              pointLabels: {
                font: {
                  size: 12,
                  weight: "bold",
                },
                color: isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.7)",
              },
              grid: {
                color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
              },
              angleLines: {
                color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.7)",
              titleFont: {
                size: 14,
              },
              bodyFont: {
                size: 13,
              },
              padding: 10,
              displayColors: false,
              callbacks: {
                title: (items) => {
                  if (items.length > 0) {
                    return items[0].label
                  }
                  return ""
                },
                label: (context) => {
                  return `Level: ${context.raw}/100`
                },
              },
            },
          },
          elements: {
            line: {
              tension: 0.1, // Slightly smoother lines
            },
          },
        },
      })
    }

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, theme, isDark])

  return (
    <div className="relative w-full h-full">
      <canvas ref={chartRef} />
    </div>
  )
}

