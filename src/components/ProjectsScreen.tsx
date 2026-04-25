import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProjectDetails } from '../types/project';
import { ProjectCard } from './ProjectCard';
import { LoadingSpinner } from './LoadingSpinner';
import InfiniteScroll from 'react-infinite-scroll-component';
import debounce from 'lodash.debounce';
import { authService } from '../services/auth';

const MOCK_PROJECTS: ProjectDetails[] = [
  {
    id: '1',
    name: 'City Center Development',
    reference: 'PRJ-2024-001',
    thumbnail: 'https://images.unsplash.com/photo-1590725140246-20acddc1fb82?w=800&auto=format',
    address: {
      line1: '123 Main Street',
      city: 'Manchester',
      postcode: 'M1 1AA'
    },
    client: {
      name: "Development Corp Ltd",
      contact: {
        name: "John Smith",
        phone: "0123456789",
        email: "john@devcorp.com"
      }
    },
    inspection: {
      number: 3,
      lastDate: '2024-02-28',
      mainRecipient: {
        name: "Sarah Johnson",
        email: "sarah@devcorp.com",
        phone: "0777888999"
      }
    },
    blocks: [
      {
        id: 'block-A',
        name: 'A',
        type: 'ApartmentBlock',
        quantity: 1,
        startDate: '2024-01-15',
        substructureDate: '2024-03-15',
        superstructureDate: '2024-06-15',
        completionDate: '2024-12-31',
        details: {
          numLevels: 8,
          numUnits: 45,
          commercialUnits: 3
        }
      }
    ],
    dates: {
      start: "2024-01-15",
      overallEnd: "2024-12-31"
    },
    status: "In Progress",
    plots: {
      total: 78
    },
    construction: {
      superstructure: {
        type: "Reinforced Concrete Frame"
      }
    },
    insurance: {
      primary: [
        { name: "InsureCo Ltd", percentage: 60 },
        { name: "SafeGuard Insurance", percentage: 40 }
      ],
      secondary: [
        { name: "ReInsure Group", percentage: 100 }
      ]
    }
  },
  {
    id: '2',
    name: 'Riverside Apartments',
    reference: 'PRJ-2024-002',
    thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format',
    address: {
      line1: '45 River Road',
      city: 'Liverpool',
      postcode: 'L3 4AA'
    },
    client: {
      name: "River Developments Ltd",
      contact: {
        name: "Emma White",
        phone: "0123456790",
        email: "emma@riverdev.com"
      }
    },
    inspection: {
      number: 2,
      lastDate: '2024-03-01',
      mainRecipient: {
        name: "David Brown",
        email: "david@riverdev.com",
        phone: "0777888000"
      }
    },
    blocks: [
      {
        id: 'block-A',
        name: 'A',
        type: 'ApartmentBlock',
        quantity: 1,
        startDate: '2024-02-01',
        substructureDate: '2024-04-01',
        superstructureDate: '2024-07-01',
        completionDate: '2025-01-15',
        details: {
          numLevels: 12,
          numUnits: 60,
          commercialUnits: 2
        }
      }
    ],
    dates: {
      start: "2024-02-01",
      overallEnd: "2025-01-15"
    },
    status: "In Progress",
    plots: {
      total: 60
    },
    construction: {
      superstructure: {
        type: "Reinforced Concrete Frame"
      }
    },
    insurance: {
      primary: [
        { name: "BuildSafe Insurance", percentage: 100 }
      ],
      secondary: [
        { name: "SecureGuard Ltd", percentage: 100 }
      ]
    }
  },
  {
    id: '3',
    name: 'Green Valley Estate',
    reference: 'PRJ-2024-003',
    thumbnail: 'https://images.unsplash.com/photo-1592595896616-c37162298647?w=800&auto=format',
    address: {
      line1: '78 Valley Road',
      city: 'Leeds',
      postcode: 'LS4 2PQ'
    },
    client: {
      name: "Green Homes Ltd",
      contact: {
        name: "Michael Green",
        phone: "0123456791",
        email: "michael@greenhomes.com"
      }
    },
    inspection: {
      number: 1,
      mainRecipient: {
        name: "Lucy Taylor",
        email: "lucy@greenhomes.com",
        phone: "0777888001"
      }
    },
    blocks: [
      {
        id: 'block-A',
        name: 'A',
        type: 'DetachedHouses',
        quantity: 15,
        startDate: '2024-03-01',
        substructureDate: '2024-05-01',
        superstructureDate: '2024-08-01',
        completionDate: '2025-02-28'
      }
    ],
    dates: {
      start: "2024-03-01",
      overallEnd: "2025-02-28"
    },
    status: "Planning",
    plots: {
      total: 15
    },
    construction: {
      superstructure: {
        type: "Timber Frame"
      }
    },
    insurance: {
      primary: [
        { name: "HomeGuard Insurance", percentage: 100 }
      ],
      secondary: [
        { name: "BuildProtect Ltd", percentage: 100 }
      ]
    }
  },
  {
    id: '4',
    name: 'Central Business Quarter',
    reference: 'PRJ-2024-004',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format',
    address: {
      line1: '100 Business Park',
      city: 'Birmingham',
      postcode: 'B1 1TA'
    },
    client: {
      name: "Business Space Developers",
      contact: {
        name: "Robert Wilson",
        phone: "0123456792",
        email: "robert@bsd.com"
      }
    },
    inspection: {
      number: 4,
      lastDate: '2024-02-15',
      mainRecipient: {
        name: "Helen Richards",
        email: "helen@bsd.com",
        phone: "0777888002"
      }
    },
    blocks: [
      {
        id: 'block-A',
        name: 'A',
        type: 'CommercialUnits',
        quantity: 1,
        startDate: '2023-09-01',
        substructureDate: '2023-11-01',
        superstructureDate: '2024-02-01',
        completionDate: '2024-08-31',
        details: {
          numLevels: 15,
          commercialUnits: 30
        }
      }
    ],
    dates: {
      start: "2023-09-01",
      overallEnd: "2024-08-31"
    },
    status: "In Progress",
    plots: {
      total: 30
    },
    construction: {
      superstructure: {
        type: "Steel Frame"
      }
    },
    insurance: {
      primary: [
        { name: "CommercialGuard", percentage: 70 },
        { name: "BuildSafe Insurance", percentage: 30 }
      ],
      secondary: [
        { name: "ReInsure Group", percentage: 100 }
      ]
    }
  },
  {
    id: '5',
    name: 'Harbour View Residences',
    reference: 'PRJ-2024-005',
    thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format',
    address: {
      line1: '23 Harbour Street',
      city: 'Bristol',
      postcode: 'BS1 4SE'
    },
    client: {
      name: "Harbour Development Group",
      contact: {
        name: "James Anderson",
        phone: "0123456793",
        email: "james@hdg.com"
      }
    },
    inspection: {
      number: 2,
      lastDate: '2024-03-05',
      mainRecipient: {
        name: "Sophie Clark",
        email: "sophie@hdg.com",
        phone: "0777888003"
      }
    },
    blocks: [
      {
        id: 'block-A',
        name: 'A',
        type: 'ApartmentBlock',
        quantity: 1,
        startDate: '2024-01-01',
        substructureDate: '2024-03-01',
        superstructureDate: '2024-06-01',
        completionDate: '2024-12-31',
        details: {
          numLevels: 10,
          numUnits: 50,
          commercialUnits: 5
        }
      }
    ],
    dates: {
      start: "2024-01-01",
      overallEnd: "2024-12-31"
    },
    status: "In Progress",
    plots: {
      total: 50
    },
    construction: {
      superstructure: {
        type: "Reinforced Concrete Frame"
      }
    },
    insurance: {
      primary: [
        { name: "MarineGuard Insurance", percentage: 100 }
      ],
      secondary: [
        { name: "CoastalProtect Ltd", percentage: 100 }
      ]
    }
  },
  {
    id: '6',
    name: 'Mountain View Terraces',
    reference: 'PRJ-2024-006',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format',
    address: {
      line1: '56 Hill Road',
      city: 'Sheffield',
      postcode: 'S1 2AB'
    },
    client: {
      name: "Hill Construction Ltd",
      contact: {
        name: "Peter Hill",
        phone: "0123456794",
        email: "peter@hillconst.com"
      }
    },
    inspection: {
      number: 1,
      mainRecipient: {
        name: "Anna Martinez",
        email: "anna@hillconst.com",
        phone: "0777888004"
      }
    },
    blocks: [
      {
        id: 'block-A',
        name: 'A',
        type: 'TerracedHouses',
        quantity: 20,
        startDate: '2024-04-01',
        substructureDate: '2024-06-01',
        superstructureDate: '2024-09-01',
        completionDate: '2025-03-31'
      }
    ],
    dates: {
      start: "2024-04-01",
      overallEnd: "2025-03-31"
    },
    status: "Planning",
    plots: {
      total: 20
    },
    construction: {
      superstructure: {
        type: "Traditional Masonry"
      }
    },
    insurance: {
      primary: [
        { name: "HillGuard Insurance", percentage: 100 }
      ],
      secondary: [
        { name: "TerraceProtect Ltd", percentage: 100 }
      ]
    }
  }
];

const ITEMS_PER_PAGE = 10;

export function ProjectsScreen() {
  const [projects, setProjects] = useState<ProjectDetails[]>([]);
  const [displayedProjects, setDisplayedProjects] = useState<ProjectDetails[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setProjects(MOCK_PROJECTS);
        setDisplayedProjects(MOCK_PROJECTS.slice(0, ITEMS_PER_PAGE));
        setHasMore(MOCK_PROJECTS.length > ITEMS_PER_PAGE);
      } catch (err) {
        setError('Failed to load projects');
        console.error('Error loading projects:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    const start = (nextPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const newProjects = projects.slice(0, end);
    setDisplayedProjects(newProjects);
    setPage(nextPage);
    setHasMore(end < projects.length);
  };

  const handleProjectClick = (project: ProjectDetails) => {
    navigate(`/projects/${project.id}`, { state: { project } });
  };

  const handlePreferences = () => {
    navigate('/preferences');
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/', { replace: true });
  };

  const handleSearch = useMemo(
    () => debounce((query: string) => {
      const filtered = MOCK_PROJECTS.filter(project =>
        project.name.toLowerCase().includes(query.toLowerCase()) ||
        project.address.city.toLowerCase().includes(query.toLowerCase()) ||
        project.reference.toLowerCase().includes(query.toLowerCase())
      );
      setDisplayedProjects(filtered.slice(0, ITEMS_PER_PAGE));
      setPage(1);
      setHasMore(filtered.length > ITEMS_PER_PAGE);
    }, 300),
    []
  );

  useEffect(() => () => handleSearch.cancel(), [handleSearch]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-xl text-error mb-4">{error}</div>
        <button className="btn btn-primary" onClick={() => setError(null)}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gradient">BuildwellAI</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/compliance')}
                className="btn btn-primary flex items-center gap-2"
              >
                <span>Compliance Check</span>
              </button>
              <button
                onClick={handlePreferences}
                className="btn btn-secondary"
              >
                Preferences
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
          
          <input
            type="text"
            placeholder="Search projects by name, reference or location..."
            className="input w-full"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg animate-pulse">
                  <div className="aspect-[16/9] bg-gray-200" />
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <InfiniteScroll
              dataLength={displayedProjects.length}
              next={loadMore}
              hasMore={hasMore}
              loader={<LoadingSpinner />}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {displayedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => handleProjectClick(project)}
                />
              ))}
            </InfiniteScroll>
          )}
        </div>
      </main>
    </div>
  );
}