import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { ProjectDetails } from '../types/project';
import { ProjectBriefingSection } from './ProjectBriefingSection';
import { ProjectTimelines } from './timeline/ProjectTimelines';
import { WeatherCard } from './WeatherCard';
import { WeatherRisks } from './WeatherRisks';
import { TextSizeControl } from './TextSizeControl';
import { LoadingSpinner } from './LoadingSpinner';
import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import { useWeather } from '../hooks/useWeather';

const textSizeClasses = {
  'xs': 'text-xs',
  'sm': 'text-sm',
  'base': 'text-base',
  'lg': 'text-lg',
  'xl': 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl'
} as const;

type TextSize = keyof typeof textSizeClasses;

export function ProjectBriefing() {
  const { projectId: _projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [textSize, setTextSize] = useState<TextSize>('lg');

  // Hardcoded UK coords — geocoding not yet implemented; deduped by React Query with WeatherCard
  const { data: weatherData } = useWeather({ latitude: 53.4808, longitude: -2.2426 });

  useEffect(() => {
    if (location.state?.project) {
      setProject(location.state.project);
    }
  }, [location.state]);

  const handleBack = () => {
    navigate('/projects');
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${textSizeClasses[textSize]}`}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900"
                aria-label="Go back"
              >
                <ChevronLeftIcon className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </button>
              <h1 className={`${textSizeClasses[textSize]} font-bold truncate`}>
                {project.name}
              </h1>
            </div>
            <TextSizeControl size={textSize} onChange={setTextSize} />
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="relative h-64 md:h-96 bg-gray-100">
        <img
          src={project.thumbnail || "https://images.unsplash.com/photo-1590725121839-892b458a74fe?w=1200&auto=format"}
          alt="Project CGI"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-2">{project.reference}</h2>
            <p className="text-lg opacity-90">{project.address.line1}, {project.address.city}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Contact Information */}
        <ProjectBriefingSection title="Key Contacts">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Site Manager</h3>
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <p className="font-medium">John Smith</p>
                <p className="text-gray-600">BuildCo Construction Ltd</p>
                <p className="text-gray-600">Senior Site Manager</p>
                <p className="text-primary mt-2">+44 7700 900123</p>
                <p className="text-primary">john.smith@buildco.com</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Report Recipient</h3>
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <p className="font-medium">{project.inspection.mainRecipient.name}</p>
                <p className="text-gray-600">{project.client.name}</p>
                <p className="text-gray-600">Project Director</p>
                <p className="text-primary mt-2">{project.inspection.mainRecipient.phone}</p>
                <p className="text-primary">{project.inspection.mainRecipient.email}</p>
              </div>
            </div>
          </div>
        </ProjectBriefingSection>

        {/* Appointment Details */}
        <ProjectBriefingSection title="Appointment Details">
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-4">Buildwell Scope of Work</h3>
              <div className="prose max-w-none">
                <p>{project.appointment?.scopeOfWork || 'Technical monitoring and risk management services for the construction phase, including regular site inspections and reporting.'}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-4">Description of Work</h3>
              <div className="prose max-w-none">
                <p>Construction of {project.blocks[0].details?.numLevels || ''}-storey {project.blocks[0].type.toLowerCase()} comprising {project.plots?.total} residential units{project.blocks[0].details?.commercialUnits ? ` and ${project.blocks[0].details.commercialUnits} commercial units` : ''} with associated external works, drainage, and landscaping. The development includes provision for parking and amenity spaces in accordance with local planning requirements.</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-4">Subjectivities / Important Information of Note</h3>
              <div className="prose max-w-none">
                <ul className="list-disc pl-5 space-y-2">
                  <li>All construction work must comply with current Building Regulations and relevant British Standards.</li>
                  <li>Site-specific ground investigation report recommendations must be followed.</li>
                  <li>Structural engineer's details and calculations to be provided prior to relevant works.</li>
                  <li>Fire engineer's strategy to be implemented as per approved documentation.</li>
                  <li>All warranty standards and requirements must be adhered to throughout construction.</li>
                  {project.blocks[0].details?.commercialUnits && (
                    <li>Commercial unit fit-out specifications to be submitted for review prior to commencement.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Insurance Details</h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-600">Product Type</div>
                      <div className="font-medium">New Homes Warranty</div>
                      
                      <div className="text-gray-600">Project Type</div>
                      <div className="font-medium">Residential Development</div>
                      
                      <div className="text-gray-600">Reconstruction Value</div>
                      <div className="font-medium">£24,500,000</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Insurance Layers</h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <h4 className="font-medium mb-2">Primary Layer</h4>
                    {project.insurance.primary.map((insurer, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{insurer.name}</span>
                        <span className="font-medium">{insurer.percentage}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <h4 className="font-medium mb-2">Secondary Layer</h4>
                    {project.insurance.secondary.map((insurer, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{insurer.name}</span>
                        <span className="font-medium">{insurer.percentage}%</span>
                      </div>
                    ))}
                  </div>

                  {project.insurance.tertiary && (
                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                      <h4 className="font-medium mb-2">Tertiary Layer</h4>
                      {project.insurance.tertiary.map((insurer, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{insurer.name}</span>
                          <span className="font-medium">{insurer.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ProjectBriefingSection>

        {/* Construction Progress */}
        <ProjectBriefingSection title="Construction Progress">
          <ProjectTimelines
            blocks={project.blocks}
            onUpdateBlock={(blockId, updates) => {
              setProject(prev => {
                if (!prev) return prev;
                return {
                  ...prev,
                  blocks: prev.blocks.map(block =>
                    block.id === blockId ? { ...block, ...updates } : block
                  )
                };
              });
            }}
          />
        </ProjectBriefingSection>

        {/* Weather Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <WeatherCard 
            latitude={53.4808}
            longitude={-2.2426}
          />
          
          <WeatherRisks
            weatherData={weatherData ?? null}
            constructionType={project.construction.superstructure.type}
          />
        </div>
      </main>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-10">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(`/inspection/${project.id}`, { state: { project } })}
            className="btn btn-primary w-full text-lg py-4 rounded-xl"
          >
            Start New Inspection
          </button>
        </div>
      </div>
    </div>
  );
}