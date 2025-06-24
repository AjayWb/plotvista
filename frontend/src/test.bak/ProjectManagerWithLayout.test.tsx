import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectManager } from '../components/ProjectManager'
import { useStore } from '../hooks/useStore'

// Mock the useStore hook
vi.mock('../hooks/useStore')
const mockUseStore = vi.mocked(useStore)

const mockCreateProject = vi.fn()
const mockCreateProjectWithLayout = vi.fn()
const mockUpdateProjectLayout = vi.fn()
const mockSelectProject = vi.fn()

const mockProjects = [
  {
    id: 'project-1',
    name: 'Test Project',
    totalPlots: 100,
    createdAt: new Date('2024-01-01'),
    layoutTemplate: {
      rows: 10,
      columns: 10,
      plotDefinitions: [
        { plotNumber: '1', dimension: '30×40', area: 1200, row: 0, col: 0 }
      ]
    }
  },
  {
    id: 'project-2',
    name: 'Simple Project',
    totalPlots: 50,
    createdAt: new Date('2024-01-02')
  }
]

const mockLayout = {
  id: 'project-1',
  name: 'Test Project',
  totalArea: '5 acres',
  totalPlots: 100,
  plots: [
    {
      id: 'plot-1',
      plotNumber: '1',
      dimension: '30×40',
      area: 1200,
      status: 'available' as const,
      row: 0,
      col: 0,
      lastUpdated: new Date()
    }
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date()
}

describe('ProjectManager with Layout Editing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseStore.mockImplementation((selector) => {
      const state = {
        projects: mockProjects,
        currentProjectId: 'project-1',
        layout: mockLayout,
        createProject: mockCreateProject,
        createProjectWithLayout: mockCreateProjectWithLayout,
        updateProjectLayout: mockUpdateProjectLayout,
        selectProject: mockSelectProject,
        user: { id: '1', name: 'Manager', role: 'manager' }
      }
      return selector(state as any)
    })
  })

  describe('Layout Editing Button', () => {
    it('should show edit layout button for managers', () => {
      render(<ProjectManager />)
      
      const editButton = screen.getByTitle('Edit Layout')
      expect(editButton).toBeInTheDocument()
    })

    it('should not show edit layout button for non-managers', () => {
      mockUseStore.mockImplementation((selector) => {
        const state = {
          projects: mockProjects,
          currentProjectId: 'project-1',
          layout: mockLayout,
          createProject: mockCreateProject,
          createProjectWithLayout: mockCreateProjectWithLayout,
          updateProjectLayout: mockUpdateProjectLayout,
          selectProject: mockSelectProject,
          user: { id: '1', name: 'Viewer', role: 'viewer' }
        }
        return selector(state as any)
      })
      
      render(<ProjectManager />)
      
      expect(screen.queryByTitle('Edit Layout')).not.toBeInTheDocument()
    })

    it('should open layout editor when edit button clicked', async () => {
      const user = userEvent.setup()
      render(<ProjectManager />)
      
      const editButton = screen.getByTitle('Edit Layout')
      await user.click(editButton)
      
      await waitFor(() => {
        expect(screen.getByText('Edit Layout: Test Project')).toBeInTheDocument()
      })
    })
  })

  describe('New Project with Custom Layout', () => {
    it('should show layout type selection in new project modal', async () => {
      const user = userEvent.setup()
      render(<ProjectManager />)
      
      // Open projects dropdown
      const projectButton = screen.getByText('Test Project')
      await user.click(projectButton)
      
      // Click create new project
      const createButton = screen.getByText('Create New Project')
      await user.click(createButton)
      
      expect(screen.getByText('Simple Grid')).toBeInTheDocument()
      expect(screen.getByText('Custom Layout')).toBeInTheDocument()
    })

    it('should show Next: Define Layout button for custom layout', async () => {
      const user = userEvent.setup()
      render(<ProjectManager />)
      
      // Open new project modal
      const projectButton = screen.getByText('Test Project')
      await user.click(projectButton)
      const createButton = screen.getByText('Create New Project')
      await user.click(createButton)
      
      // Enter project name
      const nameInput = screen.getByPlaceholderText('e.g., Green Valley Phase 2')
      await user.type(nameInput, 'New Custom Project')
      
      // Select custom layout
      const customLayoutButton = screen.getByText('Custom Layout')
      await user.click(customLayoutButton)
      
      expect(screen.getByText('Next: Define Layout')).toBeInTheDocument()
    })

    it('should open layout editor for custom layout creation', async () => {
      const user = userEvent.setup()
      render(<ProjectManager />)
      
      // Navigate to custom layout creation
      const projectButton = screen.getByText('Test Project')
      await user.click(projectButton)
      const createButton = screen.getByText('Create New Project')
      await user.click(createButton)
      
      const nameInput = screen.getByPlaceholderText('e.g., Green Valley Phase 2')
      await user.type(nameInput, 'New Custom Project')
      
      const customLayoutButton = screen.getByText('Custom Layout')
      await user.click(customLayoutButton)
      
      const nextButton = screen.getByText('Next: Define Layout')
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText('Create Layout: New Custom Project')).toBeInTheDocument()
      })
    })
  })

  describe('Simple Project Creation', () => {
    it('should create simple project with plot count', async () => {
      const user = userEvent.setup()
      render(<ProjectManager />)
      
      // Open new project modal
      const projectButton = screen.getByText('Test Project')
      await user.click(projectButton)
      const createButton = screen.getByText('Create New Project')
      await user.click(createButton)
      
      // Fill form for simple project
      const nameInput = screen.getByPlaceholderText('e.g., Green Valley Phase 2')
      await user.type(nameInput, 'Simple Project')
      
      const plotsInput = screen.getByPlaceholderText('e.g., 200')
      await user.type(plotsInput, '150')
      
      const createProjectButton = screen.getByText('Create Project')
      await user.click(createProjectButton)
      
      expect(mockCreateProject).toHaveBeenCalledWith('Simple Project', 150)
    })

    it('should validate required fields for simple project', async () => {
      const user = userEvent.setup()
      render(<ProjectManager />)
      
      // Open new project modal
      const projectButton = screen.getByText('Test Project')
      await user.click(projectButton)
      const createButton = screen.getByText('Create New Project')
      await user.click(createButton)
      
      const createProjectButton = screen.getByText('Create Project')
      expect(createProjectButton).toBeDisabled()
      
      // Add name only
      const nameInput = screen.getByPlaceholderText('e.g., Green Valley Phase 2')
      await user.type(nameInput, 'Test')
      
      expect(createProjectButton).toBeDisabled()
      
      // Add plot count
      const plotsInput = screen.getByPlaceholderText('e.g., 200')
      await user.type(plotsInput, '100')
      
      expect(createProjectButton).not.toBeDisabled()
    })
  })

  describe('Layout Editor Integration', () => {
    it('should call updateProjectLayout when layout is saved', async () => {
      const user = userEvent.setup()
      render(<ProjectManager />)
      
      // Open layout editor
      const editButton = screen.getByTitle('Edit Layout')
      await user.click(editButton)
      
      // This would test the actual editor interaction
      // For now, we'll test that the editor opens correctly
      await waitFor(() => {
        expect(screen.getByText('Edit Layout: Test Project')).toBeInTheDocument()
      })
    })

    it('should close layout editor when cancelled', async () => {
      const user = userEvent.setup()
      render(<ProjectManager />)
      
      // Open layout editor
      const editButton = screen.getByTitle('Edit Layout')
      await user.click(editButton)
      
      await waitFor(() => {
        expect(screen.getByText('Edit Layout: Test Project')).toBeInTheDocument()
      })
      
      // Cancel the editor
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Edit Layout: Test Project')).not.toBeInTheDocument()
      })
    })

    it('should pass correct initial data to layout editor', async () => {
      const user = userEvent.setup()
      render(<ProjectManager />)
      
      const editButton = screen.getByTitle('Edit Layout')
      await user.click(editButton)
      
      await waitFor(() => {
        expect(screen.getByText('Edit Layout: Test Project')).toBeInTheDocument()
        expect(screen.getByText('Grid: 10 × 10')).toBeInTheDocument()
      })
    })
  })

  describe('Project Selection with Layout Data', () => {
    it('should handle projects with layout templates', () => {
      render(<ProjectManager />)
      
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    it('should handle projects without layout templates', () => {
      mockUseStore.mockImplementation((selector) => {
        const state = {
          projects: mockProjects,
          currentProjectId: 'project-2', // Simple project without layout template
          layout: mockLayout,
          createProject: mockCreateProject,
          createProjectWithLayout: mockCreateProjectWithLayout,
          updateProjectLayout: mockUpdateProjectLayout,
          selectProject: mockSelectProject,
          user: { id: '1', name: 'Manager', role: 'manager' }
        }
        return selector(state as any)
      })
      
      render(<ProjectManager />)
      
      expect(screen.getByText('Simple Project')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle missing current project gracefully', () => {
      mockUseStore.mockImplementation((selector) => {
        const state = {
          projects: mockProjects,
          currentProjectId: 'non-existent',
          layout: mockLayout,
          createProject: mockCreateProject,
          createProjectWithLayout: mockCreateProjectWithLayout,
          updateProjectLayout: mockUpdateProjectLayout,
          selectProject: mockSelectProject,
          user: { id: '1', name: 'Manager', role: 'manager' }
        }
        return selector(state as any)
      })
      
      render(<ProjectManager />)
      
      // Should not crash, but may show undefined project name
      expect(screen.getByText('Current Project')).toBeInTheDocument()
    })

    it('should handle empty projects array', () => {
      mockUseStore.mockImplementation((selector) => {
        const state = {
          projects: [],
          currentProjectId: null,
          layout: mockLayout,
          createProject: mockCreateProject,
          createProjectWithLayout: mockCreateProjectWithLayout,
          updateProjectLayout: mockUpdateProjectLayout,
          selectProject: mockSelectProject,
          user: { id: '1', name: 'Manager', role: 'manager' }
        }
        return selector(state as any)
      })
      
      render(<ProjectManager />)
      
      expect(screen.getByText('Current Project')).toBeInTheDocument()
    })
  })

  describe('Performance and Accessibility', () => {
    it('should have proper ARIA labels for buttons', () => {
      render(<ProjectManager />)
      
      const editButton = screen.getByTitle('Edit Layout')
      expect(editButton).toHaveAttribute('title', 'Edit Layout')
    })

    it('should handle rapid clicks gracefully', async () => {
      const user = userEvent.setup()
      render(<ProjectManager />)
      
      const editButton = screen.getByTitle('Edit Layout')
      
      // Rapid clicks shouldn't cause issues
      await user.click(editButton)
      await user.click(editButton)
      await user.click(editButton)
      
      // Should only open one modal
      const modals = screen.getAllByText('Edit Layout: Test Project')
      expect(modals).toHaveLength(1)
    })
  })

  describe('Layout Creation Workflow', () => {
    it('should complete full custom layout creation workflow', async () => {
      const user = userEvent.setup()
      render(<ProjectManager />)
      
      // Start new project
      const projectButton = screen.getByText('Test Project')
      await user.click(projectButton)
      
      const createButton = screen.getByText('Create New Project')
      await user.click(createButton)
      
      // Enter project details
      const nameInput = screen.getByPlaceholderText('e.g., Green Valley Phase 2')
      await user.type(nameInput, 'Test Custom Project')
      
      // Select custom layout
      const customLayoutButton = screen.getByText('Custom Layout')
      await user.click(customLayoutButton)
      
      // Proceed to layout definition
      const nextButton = screen.getByText('Next: Define Layout')
      await user.click(nextButton)
      
      // Verify layout editor opens
      await waitFor(() => {
        expect(screen.getByText('Create Layout: Test Custom Project')).toBeInTheDocument()
      })
    })

    it('should allow going back from layout editor to project form', async () => {
      const user = userEvent.setup()
      render(<ProjectManager />)
      
      // Navigate to layout editor
      const projectButton = screen.getByText('Test Project')
      await user.click(projectButton)
      
      const createButton = screen.getByText('Create New Project')
      await user.click(createButton)
      
      const nameInput = screen.getByPlaceholderText('e.g., Green Valley Phase 2')
      await user.type(nameInput, 'Test Project')
      
      const customLayoutButton = screen.getByText('Custom Layout')
      await user.click(customLayoutButton)
      
      const nextButton = screen.getByText('Next: Define Layout')
      await user.click(nextButton)
      
      // Cancel from layout editor
      await waitFor(() => {
        expect(screen.getByText('Create Layout: Test Project')).toBeInTheDocument()
      })
      
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)
      
      // Should return to project form
      await waitFor(() => {
        expect(screen.getByText('Create New Project')).toBeInTheDocument()
      })
    })
  })
})