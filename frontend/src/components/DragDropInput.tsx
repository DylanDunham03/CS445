import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DragDropInputProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  disabled: boolean;
  selectedFile: File | null;
}

const DragDropInput: React.FC<DragDropInputProps> = ({ 
  onFileSelect, 
  onFileRemove,
  disabled,
  selectedFile 
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    disabled,
    multiple: false,
    noKeyboard: true
  });

  return (
    <div
      {...getRootProps()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          e.stopPropagation();
        }
      }}
      className={`relative w-full p-8 border-2 border-dashed rounded-lg transition-colors duration-300 cursor-pointer ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <p className="text-gray-500 text-center">
          {isDragActive ? (
            'Drop image here'
          ) : (
            <>
              Click to upload or drag and drop
              <br />
              <span className="text-sm opacity-75 flex items-center gap-2">
                {selectedFile ? (
                  <>
                    <span>Selected: {selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFileRemove();
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  'Supports PNG, JPG, JPEG'
                )}
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default DragDropInput;