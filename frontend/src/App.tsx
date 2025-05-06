import React, { useState } from 'react';

const steps = ['Upload Schema', 'Select Tables', 'Configure NoSQLBench', 'Generate YAML'];

const App = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep < 3 ? prevStep + 1 : prevStep);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep > 0 ? prevStep - 1 : prevStep);
  };
  
  const handleReset = () => {
    setActiveStep(0);
  };
  
  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl text-center mb-6 font-bold">
          NoSQLBench Schema Generator
        </h1>
        
        {/* Stepper */}
        <div className="flex mb-6 justify-between">
          {steps.map((label, index) => (
            <div key={label} className="flex flex-col items-center">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${index <= activeStep ? 'bg-blue-500 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-500'}`}>
                {index + 1}
              </div>
              <span className={`mt-1 text-sm ${index <= activeStep ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>{label}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-8">
          {activeStep === 0 && (
            <div className="bg-gray-50 p-4 rounded-md flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-lg font-medium mb-2">Upload Schema File</h2>
              <p className="text-gray-600 mb-4 text-center">
                Upload your Cassandra CQL schema file to parse the table structure
              </p>
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                onClick={handleNext}
              >
                Select File
              </button>
            </div>
          )}
          
          {activeStep === 1 && (
            <div className="bg-gray-50 p-4 rounded-md flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium mb-2">Select Tables</h2>
              <p className="text-gray-600 mb-4 text-center">
                Choose the tables you want to generate NoSQLBench YAML files for
              </p>
              <div className="border border-gray-300 rounded p-2 w-full mb-4 bg-white">
                <div className="flex items-center p-2 hover:bg-gray-100 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>centralpayment.pending_reversal_by_id</span>
                </div>
                <hr className="my-1" />
                <div className="flex items-center p-2 hover:bg-gray-100 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>centralpayment.purchase_request_by_id</span>
                </div>
                <hr className="my-1" />
                <div className="flex items-center p-2 hover:bg-gray-100 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>centralpayment.purchase_response_by_id</span>
                </div>
              </div>
              <div className="flex space-x-4">
                <button 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  onClick={handleNext}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          
          {activeStep === 2 && (
            <div className="bg-gray-50 p-4 rounded-md flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium mb-2">Configure NoSQLBench</h2>
              <p className="text-gray-600 mb-4 text-center">
                Adjust the settings for your NoSQLBench YAML files
              </p>
              <div className="w-full space-y-4 mb-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Number of Cycles</label>
                  <input 
                    type="number" 
                    className="border border-gray-300 rounded p-2" 
                    value="1000000"
                  />
                  <span className="text-xs text-gray-500 mt-1">Number of operations to run</span>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Number of Threads</label>
                  <input 
                    type="number" 
                    className="border border-gray-300 rounded p-2" 
                    value="0"
                  />
                  <span className="text-xs text-gray-500 mt-1">0 means auto (use available cores)</span>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Consistency Level</label>
                  <select className="border border-gray-300 rounded p-2">
                    <option>ONE</option>
                    <option>LOCAL_ONE</option>
                    <option>QUORUM</option>
                    <option>LOCAL_QUORUM</option>
                    <option>EACH_QUORUM</option>
                    <option>ALL</option>
                  </select>
                  <span className="text-xs text-gray-500 mt-1">Cassandra consistency level for writes</span>
                </div>
              </div>
              <div className="flex space-x-4">
                <button 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  onClick={handleNext}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          
          {activeStep === 3 && (
            <div className="bg-gray-50 p-4 rounded-md flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h2 className="text-lg font-medium mb-2">Generate YAML Files</h2>
              <p className="text-gray-600 mb-4 text-center">
                Your NoSQLBench YAML files are ready to download
              </p>
              <div className="bg-white border border-gray-300 rounded p-4 w-full mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">nosqlbench_yamls.zip</span>
                  <span className="text-gray-500 text-sm">3 files, 15.2 KB</span>
                </div>
              </div>
              <div className="flex space-x-4">
                <button 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button 
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Files
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation Dots */}
        <div className="flex justify-center mt-6">
          {steps.map((_, index) => (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${index === activeStep ? 'bg-blue-500' : 'bg-gray-300'}`}
              onClick={() => setActiveStep(index)}
              style={{cursor: 'pointer'}}
            />
          ))}
        </div>
      </div>
      
      {/* How It Works */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">How It Works</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Upload your Cassandra schema file (.cql or .txt)</li>
          <li>Select the tables you want to generate YAML files for</li>
          <li>Configure NoSQLBench parameters (cycles, threads, consistency)</li>
          <li>Download the generated YAML files</li>
          <li>Use with NoSQLBench to create your data model and ingest test data</li>
        </ol>
      </div>
    </div>
  );
};

export default App;