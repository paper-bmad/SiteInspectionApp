import React from 'react';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import type { BuildingSection } from '../types/inspection';

interface BuildingSectionSelectProps {
  sections: BuildingSection[];
  value: { main: string; sub?: string };
  onChange: (value: { main: string; sub?: string }) => void;
}

export function BuildingSectionSelect({ sections, value, onChange }: BuildingSectionSelectProps) {
  const [selectedMain, setSelectedMain] = React.useState(value.main);
  const [selectedSub, setSelectedSub] = React.useState(value.sub);

  const handleMainChange = (section: string) => {
    setSelectedMain(section);
    setSelectedSub(undefined);
    onChange({ main: section });
  };

  const handleSubChange = (subsection: string) => {
    setSelectedSub(subsection);
    onChange({ main: selectedMain, sub: subsection });
  };

  const currentSection = sections.find(s => s.name === selectedMain);

  return (
    <div className="space-y-4">
      <Listbox value={selectedMain} onChange={handleMainChange}>
        <div className="relative">
          <Listbox.Button className="input w-full flex justify-between items-center">
            <span>{selectedMain || 'Select building section'}</span>
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg max-h-60 overflow-auto">
            {sections.map((section) => (
              <Listbox.Option
                key={section.id}
                value={section.name}
                className={({ active }) =>
                  `p-4 cursor-pointer ${active ? 'bg-primary/5 text-primary' : 'text-gray-900'}`
                }
              >
                {section.name}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>

      {currentSection && currentSection.subsections.length > 0 && (
        <Listbox value={selectedSub} onChange={handleSubChange}>
          <div className="relative">
            <Listbox.Button className="input w-full flex justify-between items-center">
              <span>{selectedSub || 'Select subsection'}</span>
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg max-h-60 overflow-auto">
              {currentSection.subsections.map((subsection: any) => (
                <Listbox.Option
                  key={subsection}
                  value={subsection}
                  className={({ active }) =>
                    `p-4 cursor-pointer ${active ? 'bg-primary/5 text-primary' : 'text-gray-900'}`
                  }
                >
                  {subsection}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      )}
    </div>
  );
}