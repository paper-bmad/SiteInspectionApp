import React, { useEffect } from 'react';
import { format, addDays, isAfter, startOfDay } from 'date-fns';
import type { ProjectDetails } from '../types/project';
import { storageService } from '../services/storage';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  project: ProjectDetails;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const [hasInProgressReport, setHasInProgressReport] = React.useState(false);
  const [hasInProgressInspection, setHasInProgressInspection] = React.useState(false);
  const navigate = useNavigate();
  const lastInspectionDate = project.inspection?.lastDate ? new Date(project.inspection.lastDate) : new Date();
  const nextInspectionDue = addDays(lastInspectionDate, 14);
  const today = startOfDay(new Date());
  const isOverdue = isAfter(today, nextInspectionDue);

  // Check for in-progress reports and inspections
  useEffect(() => {
    const checkInProgress = async () => {
      const drafts = await storageService.getDrafts();
      const hasReport = drafts.some(draft => draft.projectId === project.id);
      setHasInProgressReport(hasReport);

      const autoSave = await storageService.getAutoSave();
      const hasInspection = autoSave?.projectId === project.id;
      setHasInProgressInspection(hasInspection);
    };
    checkInProgress();
  }, [project.id]);

  const handleInspectionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/inspection/${project.id}`, { 
      state: { 
        project,
        returnTo: '/projects'
      }
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300
                hover:shadow-xl hover:scale-[1.02] animate-fade-in"
    >
      {/* Today's Date */}
      <div className="text-sm text-gray-500 p-4">
        Today: {format(today, 'dd/MM/yy')}
      </div>

      {/* Thumbnail */}
      <div className="relative aspect-[16/9] bg-gray-100">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
            <div className="text-4xl mb-2">🏗️</div>
            <p className="text-sm text-center text-gray-500">No image available</p>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            project.status === 'In Progress' ? 'bg-green-100 text-green-800' :
            project.status === 'Planning' ? 'bg-blue-100 text-blue-800' :
            project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {project.status}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Project Details */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{project.name}</h3>
          <p className="text-sm text-gray-500">{project.reference}</p>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <span className="mr-2">📍</span>
            <span>{project.address.city}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <span className="mr-2">👤</span>
            <span>{project.client.name}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <span className="mr-2">🏗️</span>
            <span>{project.plots?.total || project.blocks?.length} plots</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">📅</span>
            <span className={isOverdue ? 'text-error' : 'text-gray-600'}>
              Inspection Next Due - {format(nextInspectionDue, 'dd/MM/yy')}
            </span>
          </div>
          {hasInProgressReport && (
            <div className="flex items-center text-primary">
              <span className="mr-2">📝</span>
              <span className="font-medium">Report Writing In Progress</span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">
              Started {format(new Date(project.dates.start), 'dd MMM yyyy')}
            </span>
            <button 
              className="btn btn-primary py-2 px-4"
              onClick={handleInspectionClick}
            >
              {hasInProgressInspection ? 'Continue Inspection' : 'Start Inspection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}