import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { CONSTRUCTION_TYPES } from '../constants/buildingCategories';

interface BuildingCategorySelectProps {
  value: {
    constructionType: string;
    stage: string;
    item: string;
    subitem?: string;
  };
  onChange: (value: {
    constructionType: string;
    stage: string;
    item: string;
    subitem?: string;
  }) => void;
}

export function BuildingCategorySelect({ value, onChange }: BuildingCategorySelectProps) {
  const selectedType = CONSTRUCTION_TYPES.find(t => t.id === value.constructionType);
  const selectedStage = selectedType?.stages.find(s => s.id === value.stage);
  const selectedItem = selectedStage?.items.find(i => i.id === value.item);

  return (
    <div className="space-y-4">
      {/* Construction Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Construction Type
        </label>
        <Listbox
          value={value.constructionType}
          onChange={(typeId) => {
            onChange({
              constructionType: typeId,
              stage: '',
              item: '',
              subitem: undefined
            });
          }}
        >
          <div className="relative">
            <Listbox.Button className="input w-full flex justify-between items-center">
              <span>{selectedType?.name || 'Select construction type'}</span>
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
            </Listbox.Button>
            <div className="relative">
              <Listbox.Options className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-lg overflow-auto max-h-[40vh]">
                {CONSTRUCTION_TYPES.map((type) => (
                  <Listbox.Option
                    key={type.id}
                    value={type.id}
                    className={({ active }) =>
                      `p-4 cursor-pointer ${active ? 'bg-primary/5 text-primary' : 'text-gray-900'}`
                    }
                  >
                    {type.name}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </div>
        </Listbox>
      </div>

      {/* Stage Selection */}
      {selectedType && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Construction Stage
          </label>
          <Listbox
            value={value.stage}
            onChange={(stageId) => {
              onChange({
                ...value,
                stage: stageId,
                item: '',
                subitem: undefined
              });
            }}
          >
            <div className="relative">
              <Listbox.Button className="input w-full flex justify-between items-center">
                <span>{selectedStage?.name || 'Select stage'}</span>
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
              </Listbox.Button>
              <div className="relative">
                <Listbox.Options className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-lg overflow-auto max-h-[40vh]">
                  {selectedType.stages.map((stage) => (
                    <Listbox.Option
                      key={stage.id}
                      value={stage.id}
                      className={({ active }) =>
                        `p-4 cursor-pointer ${active ? 'bg-primary/5 text-primary' : 'text-gray-900'}`
                      }
                    >
                      {stage.name}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </div>
          </Listbox>
        </div>
      )}

      {/* Item Selection */}
      {selectedStage && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inspection Item
          </label>
          <Listbox
            value={value.item}
            onChange={(itemId) => {
              onChange({
                ...value,
                item: itemId,
                subitem: undefined
              });
            }}
          >
            <div className="relative">
              <Listbox.Button className="input w-full flex justify-between items-center">
                <span>{selectedItem?.name || 'Select item'}</span>
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
              </Listbox.Button>
              <div className="relative">
                <Listbox.Options className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-lg overflow-auto max-h-[40vh]">
                  {selectedStage.items.map((item) => (
                    <Listbox.Option
                      key={item.id}
                      value={item.id}
                      className={({ active }) =>
                        `p-4 cursor-pointer ${active ? 'bg-primary/5 text-primary' : 'text-gray-900'}`
                      }
                    >
                      {item.name}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </div>
          </Listbox>
        </div>
      )}

      {/* Subitem Selection */}
      {selectedItem?.subitems && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specific Detail
          </label>
          <Listbox
            value={value.subitem}
            onChange={(subitem) => {
              onChange({
                ...value,
                subitem
              });
            }}
          >
            <div className="relative">
              <Listbox.Button className="input w-full flex justify-between items-center">
                <span>{value.subitem || 'Select specific detail'}</span>
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
              </Listbox.Button>
              <div className="relative">
                <Listbox.Options className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-lg overflow-auto max-h-[40vh]">
                  {selectedItem.subitems.map((subitem) => (
                    <Listbox.Option
                      key={subitem}
                      value={subitem}
                      className={({ active }) =>
                        `p-4 cursor-pointer ${active ? 'bg-primary/5 text-primary' : 'text-gray-900'}`
                      }
                    >
                      {subitem}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </div>
          </Listbox>
        </div>
      )}
    </div>
  );
}