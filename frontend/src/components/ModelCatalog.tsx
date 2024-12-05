import React from 'react';

interface ModelCatalogProps {
  models: ModelData[];
  onSelect: (model: ModelData) => void;
  currentModel: ModelData | null;
}

const ModelCatalog: React.FC<ModelCatalogProps> = ({ models, onSelect, currentModel }) => {
  return (
    <div className="mt-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex gap-4 overflow-x-auto py-1 px-2 justify-end">
        {models.map((model, index) => (
          <button
            key={model.timestamp}
            onClick={() => onSelect(model)}
            className="flex-shrink-0 transition-all duration-300 rounded-lg hover:scale-105"
          >
            <img
              src={model.thumbnailUrl}
              alt={`Generation ${index + 1}`}
              className={`w-20 h-20 object-cover rounded-lg shadow-lg transition-all duration-300 ${
                currentModel?.timestamp === model.timestamp
                  ? 'border-2 border-blue-500'
                  : 'border border-white'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModelCatalog;