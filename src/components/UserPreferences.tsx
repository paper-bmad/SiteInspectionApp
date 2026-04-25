import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesService } from '../services/preferences';
import type { UserPreferences } from '../types/preferences';
import { LoadingSpinner } from './LoadingSpinner';

const ACCENT_COLORS = [
  { name: 'Orange', value: '#FF8A3D' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' }
];

export function UserPreferencesScreen() {
  const queryClient = useQueryClient();
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['preferences'],
    queryFn: preferencesService.getPreferences
  });

  const updateMutation = useMutation({
    mutationFn: preferencesService.updatePreferences,
    onSuccess: (_newPrefs) => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">User Preferences</h1>

        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          
          const updates: Partial<UserPreferences> = {
            personal: {
              name: formData.get('name') as string,
              jobTitle: formData.get('jobTitle') as string,
              email: formData.get('email') as string,
              phone: formData.get('phone') as string,
              company: formData.get('company') as string,
              address: {
                line1: formData.get('addressLine1') as string,
                line2: formData.get('addressLine2') as string || undefined,
                city: formData.get('city') as string,
                postcode: formData.get('postcode') as string,
                country: formData.get('country') as string
              }
            },
            storage: {
              localPath: formData.get('localPath') as string,
              autoBackup: true,
              compressionQuality: Number(formData.get('compressionQuality')),
              backupFrequency: formData.get('backupFrequency') as 'realtime' | 'hourly' | 'daily'
            },
            display: {
              defaultTextSize: formData.get('defaultTextSize') as string,
              theme: 'light',
              accentColor: formData.get('accentColor') as string
            }
          };

          updateMutation.mutate(updates);
        }} className="space-y-8">
          {/* Personal Details */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Personal Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={preferences?.personal.name}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  defaultValue={preferences?.personal.jobTitle}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={preferences?.personal.email}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={preferences?.personal.phone}
                  className="input w-full"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  defaultValue={preferences?.personal.company}
                  className="input w-full"
                  required
                />
              </div>
              {/* Address fields */}
              <div className="col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    defaultValue={preferences?.personal.address.line1}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    defaultValue={preferences?.personal.address.line2}
                    className="input w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      defaultValue={preferences?.personal.address.city}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postcode
                    </label>
                    <input
                      type="text"
                      name="postcode"
                      defaultValue={preferences?.personal.address.postcode}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    defaultValue={preferences?.personal.address.country}
                    className="input w-full"
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Storage Settings */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Storage Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Local Storage Path
                </label>
                <input
                  type="text"
                  name="localPath"
                  defaultValue={preferences?.storage.localPath}
                  className="input w-full"
                  required
                />
                <p className="text-gray-500 text-sm mt-1">
                  Photos will be automatically backed up to this location
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Backup Frequency
                </label>
                <select
                  name="backupFrequency"
                  defaultValue={preferences?.storage.backupFrequency}
                  className="input w-full"
                >
                  <option value="realtime">Real-time</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo Compression Quality
                </label>
                <input
                  type="range"
                  name="compressionQuality"
                  min="0.1"
                  max="1"
                  step="0.1"
                  defaultValue={preferences?.storage.compressionQuality}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Higher Compression</span>
                  <span>Better Quality</span>
                </div>
              </div>
            </div>
          </section>

          {/* Display Settings */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Display Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Text Size
                </label>
                <select
                  name="defaultTextSize"
                  defaultValue={preferences?.display.defaultTextSize}
                  className="input w-full"
                >
                  <option value="base">Normal (100%)</option>
                  <option value="lg">Large (125%)</option>
                  <option value="xl">Extra Large (150%)</option>
                  <option value="2xl">Double (200%)</option>
                  <option value="3xl">Triple (300%)</option>
                  <option value="4xl">Quadruple (400%)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Accent Color
                </label>
                <div className="grid grid-cols-5 gap-4">
                  {ACCENT_COLORS.map((color) => (
                    <label
                      key={color.value}
                      className="relative flex flex-col items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="accentColor"
                        value={color.value}
                        defaultChecked={preferences?.display.accentColor === color.value}
                        className="sr-only peer"
                      />
                      <div
                        className="w-8 h-8 rounded-full peer-checked:ring-2 ring-offset-2 cursor-pointer transition-all"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-sm">{color.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}