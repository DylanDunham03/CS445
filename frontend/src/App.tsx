import React, { useState, useRef, useEffect } from 'react';
import DragDropInput from './components/DragDropInput';
import ModelViewer from './components/ModelViewer';
import Notification from './components/Notification';
import ModelCatalog from './components/ModelCatalog';
import { API_BASE_URL } from './config';

interface ModelData {
  model: string;
  thumbnailUrl: string;
  timestamp: number;
}

const App: React.FC = () => {
  const [textInput, setTextInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<ModelData | null>(null);
  const [modelHistory, setModelHistory] = useState<ModelData[]>([]);
  const [notification, setNotification] = useState({
    message: '',
    isVisible: false
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        console.log('Global ctrl + enter');
        if (formRef.current) {
          formRef.current.requestSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  useEffect(() => {
    const loadExampleModel = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/get-example-model`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const modelData: ModelData = {
          model: data.model,
          thumbnailUrl: data.thumbnail,
          timestamp: Date.now()
        };
        setResult(modelData);
        setModelHistory([modelData]);
      } catch (error) {
        console.error('Error loading example model:', error);
      }
    };

    loadExampleModel();
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
    if (e.target.value) {
      setImageFile(null);
      const fileInput = document.getElementById('imageInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setTextInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!textInput && !imageFile) {
      setNotification({
        message: 'Please enter text or upload an image.',
        isVisible: true
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    let endpoint = '';

    if (textInput) {
      formData.append('text', textInput);
      endpoint = `${API_BASE_URL}/api/generate-from-text`;
    } else if (imageFile) {
      formData.append('image', imageFile);
      endpoint = `${API_BASE_URL}/api/generate-from-image`;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newModel: ModelData = {
        model: data.model,
        thumbnailUrl: data.thumbnail,
        timestamp: Date.now()
      };
      setResult(newModel);
      setModelHistory(prev => [...prev, newModel]);
    } catch (error) {
      console.error('Error:', error);
      setNotification({
        message: 'An error occurred while processing your request.',
        isVisible: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F4] relative overflow-hidden">
      <Notification
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-3000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-5000"></div>
      </div>

      <div className="relative z-50 w-full">
        <div className="absolute top-6 w-full flex justify-between items-center px-12">
          <div className="w-40"></div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 rounded-lg font-medium text-4xl transition-colors duration-300 shadow-sm border border-gray-200"
          >
            3DModel-GPT
          </button>
          <div className="flex gap-4 w-40">
            <button
              onClick={() => console.log('Settings clicked')}
              className="px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 rounded-lg font-medium transition-colors duration-300 shadow-sm border border-gray-200"
            >
              Settings
            </button>
            <button
              onClick={() => console.log('Login clicked')}
              className="px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 rounded-lg font-medium transition-colors duration-300 shadow-sm border border-gray-200"
            >
              Login
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center p-4 min-h-screen">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg w-full max-w-4xl border border-gray-100">
          <h1 className="text-4xl text-gray-700 font-extrabold mb-8 text-center">
            Create your object!
          </h1>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Form column */}
            <div>
              <form onSubmit={handleSubmit} ref={formRef}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="textInput" className="block text-gray-700 mb-2 font-medium">
                      Generate from Text
                    </label>
                    <input
                      type="text"
                      id="textInput"
                      value={textInput}
                      onChange={handleTextChange}
                      className={`w-full px-4 py-3 rounded-lg bg-white text-gray-700 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        imageFile ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      placeholder="Enter your text here"
                      disabled={!!imageFile}
                    />
                  </div>
                  
                  <div className="relative flex items-center justify-center gap-4">
                    <div className="h-[1px] bg-gray-300 flex-grow"></div>
                    <span className="text-sm text-gray-500">OR</span>
                    <div className="h-[1px] bg-gray-300 flex-grow"></div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      Generate from Image
                    </label>
                    <DragDropInput
                      onFileSelect={(file) => {
                        setImageFile(file);
                        setTextInput('');
                      }}
                      onFileRemove={() => {
                        setImageFile(null);
                      }}
                      disabled={!!textInput}
                      selectedFile={imageFile}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 mt-8 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      Generating
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      
                    </>
                  ) : (
                    <>
                      Generate
                      <span className="text-sm ml-2 opacity-75">(Cmd + Enter)</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Result column */}
            <div className={`transition-opacity duration-300 ${result ? 'opacity-100' : 'opacity-50'}`}>
              {result ? (
                <ModelViewer
                  modelData={result.model}
                  thumbnailUrl={result.thumbnailUrl}
                />
              ) : (
                <div className="w-full h-[400px] rounded-lg bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500">Loading example model...</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="w-full max-w-4xl">
          <ModelCatalog
            models={modelHistory}
            onSelect={setResult}
            currentModel={result}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
