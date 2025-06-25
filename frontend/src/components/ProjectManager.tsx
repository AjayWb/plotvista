import { useState } from 'react'
import { Plus, ChevronDown, Calendar, Grid, Layout, Settings } from 'lucide-react'
import { useStore } from '../hooks/useStore'
import { SimpleLayoutEditor } from './SimpleLayoutEditor'
import { LayoutManagementModal } from './LayoutManagementModal'
import { PlotDefinition } from '../types'
import clsx from 'clsx'

export function ProjectManager() {
  const [showProjects, setShowProjects] = useState(false)
  const [showNewProject, setShowNewProject] = useState(false)
  const [showLayoutBuilder, setShowLayoutBuilder] = useState(false)
  const [showLayoutEditor, setShowLayoutEditor] = useState(false)
  const [showLayoutManagement, setShowLayoutManagement] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  
  const projects = useStore(state => state.projects)
  const currentProjectId = useStore(state => state.currentProjectId)
  const layout = useStore(state => state.layout)
  const createProjectWithLayout = useStore(state => state.createProjectWithLayout)
  const updateProjectLayout = useStore(state => state.updateProjectLayout)
  const selectProject = useStore(state => state.selectProject)
  const isManager = useStore(state => state.user?.role === 'manager')
  
  const currentProject = projects.find(p => p.id === currentProjectId)
  
  const handleCreateProject = () => {
    setShowLayoutBuilder(true)
    setShowNewProject(false)
  }
  
  const handleLayoutSave = (rows: number, cols: number, plots: PlotDefinition[]) => {
    if (newProjectName.trim()) {
      createProjectWithLayout(newProjectName.trim(), rows, cols, plots)
      setShowLayoutBuilder(false)
      setNewProjectName('')
    }
  }
  
  const handleLayoutUpdate = (rows: number, cols: number, plots: PlotDefinition[]) => {
    updateProjectLayout(rows, cols, plots)
    setShowLayoutEditor(false)
  }
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date))
  }
  
  return (
    <div className="relative">
      {/* Current Project Selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowProjects(!showProjects)}
          className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-left">
            <div className="text-sm text-gray-600">Current Project</div>
            <div className="font-semibold text-gray-900">{currentProject?.name}</div>
          </div>
          <ChevronDown className={clsx(
            "w-5 h-5 text-gray-400 transition-transform",
            showProjects && "rotate-180"
          )} />
        </button>
        
        {isManager && currentProject && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowLayoutEditor(true)}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-600 hover:text-gray-900"
              title="Edit Layout"
            >
              <Layout className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowLayoutManagement(true)}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-600 hover:text-gray-900"
              title="Manage Layout"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      
      {/* Projects Dropdown */}
      {showProjects && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-20">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Projects</h3>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => {
                  selectProject(project.id)
                  setShowProjects(false)
                }}
                className={clsx(
                  "w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors",
                  project.id === currentProjectId && "bg-sizzle-red/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{project.name}</div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Grid className="w-4 h-4" />
                        {project.totalPlots} plots
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(project.createdAt)}
                      </span>
                    </div>
                  </div>
                  {project.id === currentProjectId && (
                    <div className="w-2 h-2 bg-sizzle-red rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
          
          {isManager && (
            <div className="p-4 border-t">
              <button
                onClick={() => {
                  setShowNewProject(true)
                  setShowProjects(false)
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sizzle-red text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create New Project
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., Green Valley Phase 2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sizzle-red focus:border-transparent outline-none"
                  autoFocus
                />
              </div>
              
            </div>
            
            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setShowNewProject(false)
                  setNewProjectName('')
                }}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="flex-1 py-2 px-4 bg-sizzle-red text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Next: Define Layout
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Layout Builder Modal */}
      {showLayoutBuilder && (
        <SimpleLayoutEditor
          projectName={newProjectName}
          onSave={handleLayoutSave}
          onCancel={() => {
            setShowLayoutBuilder(false)
            setShowNewProject(true)
          }}
        />
      )}
      
      {/* Layout Editor Modal */}
      {showLayoutEditor && currentProject && (
        <SimpleLayoutEditor
          projectName={currentProject.name}
          initialPlots={currentProject.layoutTemplate?.plotDefinitions || layout.plots.map(p => ({
            plotNumber: p.plotNumber,
            dimension: p.dimension,
            area: p.area,
            row: p.row,
            col: p.col
          }))}
          isEditing={true}
          onSave={handleLayoutUpdate}
          onCancel={() => setShowLayoutEditor(false)}
        />
      )}

      {/* Layout Management Modal */}
      <LayoutManagementModal 
        isOpen={showLayoutManagement}
        onClose={() => setShowLayoutManagement(false)}
      />
    </div>
  )
}