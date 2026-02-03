// app/punchcards/main.tsx
"use client";

import React, { useState } from 'react';
import TemplateSelector from './_components/TemplateSelector';
import CardPreview from './_components/CardPreview';
import PDFGenerator from './_components/PDFGenerator';
import BatchSettings from './_components/BatchSettings';

interface PunchCardBatch {
  templateId: string;
  templatePath: string;
  cardCount: number;
  batchName: string;
}

const PunchCardMain: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [cardCount, setCardCount] = useState<number>(8);
  const [batchName, setBatchName] = useState<string>('');
  const [generatedCards, setGeneratedCards] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleTemplateSelect = (templatePath: string) => {
    setSelectedTemplate(templatePath);
  };

  const handleGenerateCards = async () => {
    if (!selectedTemplate) {
      alert('Please select a template first');
      return;
    }

    setIsGenerating(true);
    try {
      // This will be implemented by the PDFGenerator component
      console.log('Generating cards...', {
        template: selectedTemplate,
        count: cardCount,
        batchName
      });
    } catch (error) {
      console.error('Error generating cards:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Punch Card Generator
        </h1>
        <p className="text-gray-600">
          Create professional punch cards with A4-optimized layouts for easy printing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Template Selection & Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Select Template</h2>
            <TemplateSelector 
              onTemplateSelect={handleTemplateSelect}
              selectedTemplate={selectedTemplate}
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Batch Settings</h2>
            <BatchSettings
              cardCount={cardCount}
              onCardCountChange={setCardCount}
              batchName={batchName}
              onBatchNameChange={setBatchName}
            />
          </div>

          <button
            onClick={handleGenerateCards}
            disabled={!selectedTemplate || isGenerating}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              selectedTemplate && !isGenerating
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isGenerating ? 'Generating...' : 'Generate Punch Cards'}
          </button>
        </div>

        {/* Right Column - Preview & Results */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTemplate && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              <CardPreview 
                templatePath={selectedTemplate}
                cardCount={cardCount}
              />
            </div>
          )}

          {generatedCards.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Generated Cards</h2>
              <PDFGenerator 
                cards={generatedCards}
                batchName={batchName}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PunchCardMain;