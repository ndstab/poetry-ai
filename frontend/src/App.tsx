import React, { useState } from 'react';
import axios from 'axios';

// Predefined rhyme schemes and length options
const RHYME_SCHEMES: string[] = [
  'ABAB', 
  'AAAA', 
  'AABB', 
  'Free Verse', 
  'ABBA', 
  'ABCB', 
  'Sonnet (ABBAABBA CDECDE)'
];

interface LengthOption {
  value: string;
  label: string;
  stanzas: number;
}

const LENGTH_OPTIONS: LengthOption[] = [
  { value: 'short', label: 'Short (1 Stanza)', stanzas: 1 },
  { value: 'medium', label: 'Medium (2 Stanzas)', stanzas: 2 },
  { value: 'long', label: 'Long (2+ Stanzas)', stanzas: 3 }
];

const THEME_OPTIONS: string[] = [
  'Love', 
  'Nature', 
  'Heartbreak', 
  'Hope', 
  'Solitude', 
  'Friendship', 
  'Seasons', 
  'Custom'
];

interface PoemRequest {
  theme: string;
  length: string;
  rhyme_scheme: string;
  poet_style: string;
}

const PoetryAI: React.FC = () => {
  // State variables
  const [theme, setTheme] = useState<string>('');
  const [customTheme, setCustomTheme] = useState<string>('');
  const [length, setLength] = useState<string>('');
  const [rhymeScheme, setRhymeScheme] = useState<string>('');
  const [poet, setPoet] = useState<string>('');
  const [generatedPoem, setGeneratedPoem] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Generate poem handler
  const generatePoem = async () => {
    // Reset previous states
    setIsLoading(true);
    setError(null);
    setGeneratedPoem('');

    // Prepare request payload
    const requestPayload: PoemRequest = {
      theme: theme === 'Custom' ? customTheme : theme,
      length: length,
      rhyme_scheme: rhymeScheme,
      poet_style: poet
    };

    try {
      const response = await axios.post<{ poem: string }>(
        'http://localhost:8000/generate-poem', 
        requestPayload
      );
      setGeneratedPoem(response.data.poem);
    } catch (error) {
      console.error('Error generating poem:', error);
      setError('Sorry, could not generate the poem. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center p-6">
      <div className="bg-[#E6D2B5] shadow-xl rounded-xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-serif text-center text-[#4A3933] mb-6">
          Rhyme With Me
        </h1>
        
        <div className="space-y-4">
          {/* Theme Selection */}
          <div>
            <label className="block text-[#4A3933] mb-2">Choose Theme</label>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)}
              className="w-full p-2 border rounded bg-[#F0E6D2] text-[#4A3933]"
            >
              <option value="">Select a Theme</option>
              {THEME_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            
            {theme === 'Custom' && (
              <input 
                type="text"
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                placeholder="Enter your custom theme"
                className="w-full p-2 mt-2 border rounded bg-[#F0E6D2] text-[#4A3933]"
              />
            )}
          </div>

          {/* Length Selection */}
          <div>
            <label className="block text-[#4A3933] mb-2">Poem Length</label>
            <select 
              value={length} 
              onChange={(e) => setLength(e.target.value)}
              className="w-full p-2 border rounded bg-[#F0E6D2] text-[#4A3933]"
            >
              <option value="">Select Length</option>
              {LENGTH_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Rhyme Scheme */}
          <div>
            <label className="block text-[#4A3933] mb-2">Rhyme Scheme</label>
            <select 
              value={rhymeScheme} 
              onChange={(e) => setRhymeScheme(e.target.value)}
              className="w-full p-2 border rounded bg-[#F0E6D2] text-[#4A3933]"
            >
              <option value="">Select Rhyme Scheme</option>
              {RHYME_SCHEMES.map(scheme => (
                <option key={scheme} value={scheme}>{scheme}</option>
              ))}
            </select>
          </div>

          {/* Poet Style */}
          <div>
            <label className="block text-[#4A3933] mb-2">Poet/Writing Style</label>
            <input 
              type="text"
              value={poet}
              onChange={(e) => setPoet(e.target.value)}
              placeholder="Enter poet name or style"
              className="w-full p-2 border rounded bg-[#F0E6D2] text-[#4A3933]"
            />
          </div>

          {/* Generate Button */}
          <button 
            onClick={generatePoem}
            disabled={isLoading}
            className="w-full bg-[#8B4513] text-[#F5F5DC] p-3 rounded hover:bg-[#6B3E23] transition duration-300"
          >
            {isLoading ? 'Generating...' : 'Generate Poem'}
          </button>

          {/* Error Handling */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              {error}
            </div>
          )}
        </div>

        {/* Generated Poem Display */}
        {generatedPoem && (
  <div className="mt-6 p-4 bg-[#F0E6D2] rounded">
    <h2 className="text-xl font-serif text-[#4A3933] mb-4">Here's your poem!</h2>
    <pre 
      className="whitespace-pre-wrap text-[#4A3933] 
                 font-serif 
                 text-lg 
                 tracking-wide 
                 leading-relaxed"
    >
      {generatedPoem}
    </pre>
  </div>
)}
      </div>
    </div>
  );
};

export default PoetryAI;