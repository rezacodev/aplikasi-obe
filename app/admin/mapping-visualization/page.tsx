"use client";

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Network, Eye, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Node {
  id: string
  label: string
  type: 'kurikulum' | 'cpl' | 'cpmk' | 'mata_kuliah' | 'bahan_kajian' | 'profil_lulusan'
  x: number
  y: number
}

interface Edge {
  from: string
  to: string
  label: string
}

export default function MappingVisualizationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const isAuthorizedUser = (session: unknown): session is Session => {
    return session !== null && typeof session === 'object' && 'user' in session
  }

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated' || !isAuthorizedUser(session)) {
      router.push('/dashboard')
      return
    }
  }, [status, session, router])

  // Define nodes for the semantic network
  const nodes: Node[] = [
    { id: 'kurikulum', label: 'Kurikulum', type: 'kurikulum', x: 400, y: 50 },
    { id: 'profil_lulusan', label: 'Profil Lulusan', type: 'profil_lulusan', x: 200, y: 150 },
    { id: 'cpl', label: 'CPL', type: 'cpl', x: 400, y: 200 },
    { id: 'cpmk', label: 'CPMK', type: 'cpmk', x: 600, y: 200 },
    { id: 'mata_kuliah', label: 'Mata Kuliah', type: 'mata_kuliah', x: 400, y: 350 },
    { id: 'bahan_kajian', label: 'Bahan Kajian', type: 'bahan_kajian', x: 150, y: 300 },
  ]

  // Define edges (relationships)
  const edges: Edge[] = [
    { from: 'kurikulum', to: 'cpl', label: 'Kurikulum → CPL' },
    { from: 'kurikulum', to: 'mata_kuliah', label: 'Kurikulum → Mata Kuliah' },
    { from: 'profil_lulusan', to: 'cpl', label: 'PL → CPL' },
    { from: 'profil_lulusan', to: 'mata_kuliah', label: 'PL → Mata Kuliah' },
    { from: 'cpl', to: 'cpmk', label: 'CPL → CPMK' },
    { from: 'cpl', to: 'mata_kuliah', label: 'CPL → Mata Kuliah' },
    { from: 'cpl', to: 'bahan_kajian', label: 'CPL → Bahan Kajian' },
    { from: 'bahan_kajian', to: 'mata_kuliah', label: 'Bahan Kajian → Mata Kuliah' },
  ]

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'kurikulum': return '#3B82F6' // blue
      case 'profil_lulusan': return '#10B981' // green
      case 'cpl': return '#F59E0B' // amber
      case 'cpmk': return '#EF4444' // red
      case 'mata_kuliah': return '#8B5CF6' // purple
      case 'bahan_kajian': return '#06B6D4' // cyan
      default: return '#6B7280' // gray
    }
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5))
  const handleReset = () => {
    setZoom(1)
    setPanX(0)
    setPanY(0)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x)
      setPanY(e.clientY - dragStart.y)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Visualisasi Mapping OBE</h1>
            <p className="text-muted-foreground">
              Jaringan semantik hubungan antara entitas dalam sistem OBE
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Legend */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Legenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Kurikulum</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm">Profil Lulusan</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span className="text-sm">CPL</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-sm">CPMK</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                  <span className="text-sm">Mata Kuliah</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-cyan-500"></div>
                  <span className="text-sm">Bahan Kajian</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Visualization */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Network className="h-5 w-5 mr-2" />
                Jaringan Semantik Mapping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="relative bg-gray-50 rounded-lg overflow-hidden cursor-move"
                style={{ height: '600px' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 800 500"
                  style={{
                    transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                    transformOrigin: 'center',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                  }}
                >
                  {/* Edges */}
                  {edges.map((edge, index) => {
                    const fromNode = nodes.find(n => n.id === edge.from)
                    const toNode = nodes.find(n => n.id === edge.to)
                    if (!fromNode || !toNode) return null

                    const midX = (fromNode.x + toNode.x) / 2
                    const midY = (fromNode.y + toNode.y) / 2

                    return (
                      <g key={index}>
                        <line
                          x1={fromNode.x}
                          y1={fromNode.y}
                          x2={toNode.x}
                          y2={toNode.y}
                          stroke="#6B7280"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
                        <text
                          x={midX}
                          y={midY - 5}
                          textAnchor="middle"
                          className="text-xs fill-gray-600 font-medium"
                          style={{ fontSize: '10px' }}
                        >
                          {edge.label}
                        </text>
                      </g>
                    )
                  })}

                  {/* Arrow marker */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#6B7280"
                      />
                    </marker>
                  </defs>

                  {/* Nodes */}
                  {nodes.map((node) => (
                    <g key={node.id}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="30"
                        fill={getNodeColor(node.type)}
                        stroke="#FFFFFF"
                        strokeWidth="3"
                        className="drop-shadow-md"
                      />
                      <text
                        x={node.x}
                        y={node.y}
                        textAnchor="middle"
                        dy="0.35em"
                        className="text-white font-semibold text-sm"
                        style={{ fontSize: '12px' }}
                      >
                        {node.label}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Instructions overlay */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Eye className="h-4 w-4" />
                    <span>Drag untuk pan, gunakan zoom buttons</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mapping Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Mapping</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">8</div>
                <div className="text-sm text-gray-600">Total Mapping</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">6</div>
                <div className="text-sm text-gray-600">Entitas</div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">100%</div>
                <div className="text-sm text-gray-600">Completion</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">12</div>
                <div className="text-sm text-gray-600">Hubungan</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}