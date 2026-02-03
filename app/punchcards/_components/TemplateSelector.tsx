// app/punchcards/_components/TemplateSelector.tsx
"use client";

import React, { useState, useEffect } from 'react';

interface Template {
  id: string;
  name: string;
  path: string;
  category: string;
  description?: string;
}

interface TemplateSelectorProps {
  onTemplateSelect: (templatePath: string) => void;
  selectedTemplate: string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onTemplateSelect,
  selectedTemplate
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load templates from Supabase storage
  useEffect(() => {
    const supabaseTemplates: Template[] = [
      {
        id: '1',
        name: 'Punch Card Design 1',
        path: 'https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/punchcards/Pc1.png',
        category: 'vintage',
        description: 'Classic design style'
      },
      {
        id: '2',
        name: 'Punch Card Design 2',
        path: 'https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/punchcards/Pc2.png',
        category: 'modern',
        description: 'Modern layout design'
      },
      {
        id: '3',
        name: 'Punch Card Design 3',
        path: 'https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/punchcards/Pc3.png',
        category: 'professional',
        description: 'Professional business format'
      },
      {
        id: '4',
        name: 'Punch Card Design 4',
        path: 'https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/punchcards/Pc4.png',
        category: 'creative',
        description: 'Creative artistic design'
      },
      {
        id: '5',
        name: 'Punch Card Design 5',
        path: 'https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/punchcards/Pc5.png',
        category: 'creative',
        description: 'Unique creative style'
      }
    ];
    setTemplates(supabaseTemplates);
  }, []);

  const categories = ['all', 'vintage', 'modern', 'professional', 'creative'];
  
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
              selectedCategory === category
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            onClick={() => onTemplateSelect(template.path)}
            className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md ${
              selectedTemplate === template.path
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-16 h-10 bg-gray-100 rounded border flex items-center justify-center overflow-hidden">
                <img
                  src={template.path}
                  alt={template.name}
                  width={64}
                  height={40}
                  className="object-cover"
                  onLoad={() => console.log(`Image loaded: ${template.name}`)}
                  onError={(e) => {
                    console.error(`Failed to load image: ${template.path}`);
                    // Fallback for missing images
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2NCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEgzMlYyMkgyMFYyMFpNMjAgMjRIMzJWMjZIMjBWMjRaIiBmaWxsPSIjOUIxMDFDIi8+Cjx0ZXh0IHg9IjMyIiB5PSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjhweCIgZmlsbD0iIzZCNzI4MCI+UHVuY2ggQ2FyZDwvdGV4dD4KPC9zdmc+';
                  }}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm text-gray-900">{template.name}</h3>
                <p className="text-xs text-gray-500">{template.description}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-xs rounded text-gray-600 capitalize">
                  {template.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Template Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <div className="text-gray-500 text-sm">
          <p className="mb-2">Want to create your own?</p>
          <button className="text-blue-600 hover:text-blue-700 underline text-sm">
            Upload Custom Template
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Supported: PNG, JPG • Size: 1088×638px • Max: 5MB
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;