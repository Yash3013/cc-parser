import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download, Zap, TrendingUp, CreditCard, DollarSign, AlertTriangle, Info, Moon, Sun, Copy, Check, BarChart3, PieChart } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CCParserApp = () => {
  const [files, setFiles] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('upload');
  const [copiedField, setCopiedField] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles([...e.dataTransfer.files]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles([...e.target.files]);
    }
  };

  const handleFiles = (newFiles) => {
    const pdfFiles = newFiles.filter(f => f.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      setError('Please upload only PDF files');
      return;
    }
    
    if (pdfFiles.length + files.length > 10) {
      setError('Maximum 10 files allowed');
      return;
    }
    
    setFiles(prev => [...prev, ...pdfFiles]);
    setError(null);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const parseStatements = async () => {
    if (files.length === 0) return;
    
    setParsing(true);
    setError(null);
    setResults([]);
    
    try{
      if(files.length === 1){
        const formData = new FormData();
        formData.append('statement', files[0]);
        const response = await fetch(`${API_URL}/api/parse`, {
          method: 'POST',
          body: formData
        });
        if(!response.ok) throw new Error('Parsing failed');
        const data = await response.json();
        setResults([{ ...data, filename: files[0].name }]);
        setActiveTab('results');
      } else{
        const formData = new FormData();
        files.forEach(file => formData.append('statements', file));
        const response = await fetch(`${API_URL}/api/parse-batch`, {
          method: 'POST',
          body: formData
        });
        if(!response.ok) throw new Error('Batch parsing failed');
        const data = await response.json();
        setResults(data.results);
        setActiveTab('results');
      }
    } catch(err){
      setError(err.message);
    } finally{
      setParsing(false);
    }
  };

  const exportToJSON = (result) => {
    const dataStr = JSON.stringify(result, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.filename || 'statement'}-parsed.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAllToCSV = () => {
    const headers = ['Filename', 'Bank', 'Cardholder', 'Card Last 4', 'Total Due', 'Due Date', 'Confidence'];
    const rows = results.map(r => [
      r.filename,
      r.bank,
      r.data?.cardholderName || 'N/A',
      r.data?.cardLastFour || 'N/A',
      r.data?.totalAmountDue || 'N/A',
      r.data?.paymentDueDate || 'N/A',
      `${(r.confidence * 100).toFixed(0)}%`
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'all-statements.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text,field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null),2000);
  };

  const reset = () => {
    setFiles([]);
    setResults([]);
    setError(null);
    setActiveTab('upload');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} transition-colors duration-300`}>
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <CreditCard className={`w-10 h-10 md:w-12 md:h-12 ${darkMode ? 'text-purple-400' : 'text-purple-600'} mr-3`} />
              <h1 className={`text-3xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Smart CC Parser
              </h1>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`ml-4 p-2 rounded-lg ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-gray-700" />}
              </button>
            </div>
            <p className={`text-lg mb-4 ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
              AI-Powered Credit Card Statement Analysis
            </p>
            <div className={`flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                5 Banks
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                AI-Enhanced
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Analytics
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                Batch Process
              </span>
            </div>
          </div>
          {results.length > 0 && (
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {['upload', 'results', 'analytics', 'comparison'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? darkMode ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'
                      : darkMode ? 'bg-white/10 text-purple-200 hover:bg-white/20' : 'bg-white text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
          {activeTab === 'upload' && (
            <div className={`${darkMode ? 'bg-white/10 border-purple-500/30' : 'bg-white border-purple-200'} backdrop-blur-lg rounded-2xl p-4 md:p-8 border shadow-2xl`}>
              <div
                className={`border-2 border-dashed rounded-xl p-6 md:p-12 text-center transition-all ${
                  dragActive 
                    ? 'border-purple-400 bg-purple-500/20' 
                    : darkMode ? 'border-purple-500/50 hover:border-purple-400' : 'border-purple-300 hover:border-purple-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {parsing ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className={`text-base md:text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Analyzing {files.length} statement{files.length > 1 ? 's' : ''}...
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                      Using AI for {(95).toFixed(0)}% accuracy
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className={`w-12 h-12 md:w-16 md:h-16 ${darkMode ? 'text-purple-400' : 'text-purple-600'} mx-auto mb-4`} />
                    <h3 className={`text-lg md:text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Upload Credit Card Statement{files.length > 0 ? 's' : ''}
                    </h3>
                    <p className={`text-sm md:text-base mb-6 ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                      Drag and drop PDF files here, or click to browse (Max 10 files)
                    </p>
                    <input
                      type="file"
                      accept="application/pdf"
                      multiple
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className={`inline-block px-4 py-2 md:px-6 md:py-3 rounded-lg cursor-pointer transition-colors font-medium ${
                        darkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      Choose Files
                    </label>
                  </>
                )}
              </div>
              {files.length > 0 && !parsing && (
                <div className="mt-6 space-y-2">
                  <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Selected Files ({files.length})
                  </h4>
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        darkMode ? 'bg-white/5' : 'bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className={`w-5 h-5 flex-shrink-0 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                        <span className={`truncate text-sm ${darkMode ? 'text-purple-200' : 'text-gray-700'}`}>
                          {file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        className={`ml-2 px-2 py-1 text-xs rounded ${
                          darkMode ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
          
                  <button
                    onClick={parseStatements}
                    className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all font-semibold shadow-lg"
                  >
                    Parse {files.length} Statement{files.length > 1 ? 's' : ''}
                  </button>
                </div>
              )}

              {error && (
                <div className={`mt-4 flex items-center gap-2 p-3 rounded-lg ${
                  darkMode ? 'text-red-400 bg-red-500/10' : 'text-red-700 bg-red-100'
                }`}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              <div className="mt-8">
                <h4 className={`text-center font-semibold mb-4 ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                  Supported Banks
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                  {['HDFC Bank', 'ICICI Bank', 'SBI Card', 'Axis Bank', 'Amex'].map((bank) => (
                    <div key={bank} className={`rounded-lg p-3 text-center ${darkMode ? 'bg-white/5' : 'bg-white'}`}>
                      <p className={`text-xs md:text-sm font-medium ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                        {bank}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'results' && results.length > 0 && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-400 flex-shrink-0" />
                  <div>
                    <h2 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Parsing Complete
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                      {results.length} statement{results.length > 1 ? 's' : ''} processed
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {results.length > 1 && (
                    <button
                      onClick={exportAllToCSV}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                        darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                  )}
                  <button
                    onClick={reset}
                    className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                      darkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    New Upload
                  </button>
                </div>
              </div>

              {results.map((result, idx) => (
                <ResultCard 
                  key={idx} 
                  result={result} 
                  darkMode={darkMode}
                  onExport={() => exportToJSON(result)}
                  onCopy={copyToClipboard}
                  copiedField={copiedField}
                />
              ))}
            </div>
          )}
          {activeTab === 'analytics' && results.length > 0 && (
            <AnalyticsSection results={results} darkMode={darkMode} />
          )}
          {activeTab === 'comparison' && results.length > 1 && (
            <ComparisonTable results={results} darkMode={darkMode} />
          )}
        </div>
      </div>
    </div>
  );
};

const ResultCard = ({ result, darkMode, onExport, onCopy, copiedField }) => {
  const data = result.data || {};
  const analytics = result.analytics || {};
  
  return (
    <div className={`${darkMode ? 'bg-white/10 border-purple-500/30' : 'bg-white border-purple-200'} backdrop-blur-lg rounded-xl p-4 md:p-6 border shadow-xl`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <div>
          <h3 className={`text-lg md:text-xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {result.filename}
          </h3>
          <div className="flex flex-wrap gap-2 text-xs md:text-sm">
            <span className={`px-2 py-1 rounded ${darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
              {result.bank}
            </span>
            <span className={`px-2 py-1 rounded ${darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'}`}>
              {(result.confidence * 100).toFixed(0)}% Confidence
            </span>
            {data.method && (
              <span className={`px-2 py-1 rounded ${darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                {data.method}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onExport}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm whitespace-nowrap ${
            darkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          <Download className="w-4 h-4" />
          Export JSON
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {Object.entries({
          'Cardholder Name': data.cardholderName,
          'Card Last 4': data.cardLastFour,
          'Statement Period': data.statementPeriod,
          'Total Amount Due': data.totalAmountDue,
          'Payment Due Date': data.paymentDueDate,
          'Previous Balance': data.previousBalance,
          'Credit Limit': data.creditLimit,
          'Reward Points': data.rewardPoints
        }).filter(([_, value]) => value).map(([key, value]) => (
          <div key={key} className={`rounded-lg p-3 ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
            <p className={`text-xs mb-1 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>{key}</p>
            <div className="flex items-center justify-between gap-2">
              <p className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {value}
              </p>
              <button
                onClick={() => onCopy(value, key)}
                className={`p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0`}
              >
                {copiedField === key ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {analytics.insights && analytics.insights.length > 0 && (
        <div className="space-y-2 mb-6">
          <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Smart Insights
          </h4>
          {analytics.insights.map((insight, idx) => (
            <div
              key={idx}
              className={`flex gap-3 p-3 rounded-lg text-sm ${
                insight.type === 'warning' ? (darkMode ? 'bg-yellow-500/10 text-yellow-300' : 'bg-yellow-50 text-yellow-800') :
                insight.type === 'success' ? (darkMode ? 'bg-green-500/10 text-green-300' : 'bg-green-50 text-green-800') :
                (darkMode ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-800')
              }`}
            >
              {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
              {insight.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
              {insight.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}
              <div>
                <p className="font-semibold">{insight.title}</p>
                <p className="text-xs opacity-90">{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.transactions && data.transactions.length > 0 && (
        <div>
          <h4 className={`font-semibold mb-3 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Transactions ({data.transactions.length})
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.transactions.map((txn, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
                } transition-colors`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    darkMode ? 'bg-purple-600' : 'bg-purple-100'
                  }`}>
                    <DollarSign className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-purple-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {txn.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={darkMode ? 'text-purple-300' : 'text-purple-600'}>{txn.date}</span>
                      {txn.category && (
                        <>
                          <span className={darkMode ? 'text-purple-500' : 'text-purple-400'}>•</span>
                          <span className={darkMode ? 'text-purple-300' : 'text-purple-600'}>{txn.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <p className={`font-semibold text-sm flex-shrink-0 ml-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {txn.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AnalyticsSection = ({ results, darkMode }) => {
  const successfulResults = results.filter(r => r.success !== false);
  
  const totalSpending = successfulResults.reduce((sum, r) => {
    const amount = parseFloat((r.data?.totalAmountDue || '0').replace(/[₹,]/g, ''));
    return sum + amount;
  }, 0);
  
  const avgSpending = totalSpending / successfulResults.length;
  
  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'bg-white/10 border-purple-500/30' : 'bg-white border-purple-200'} backdrop-blur-lg rounded-xl p-6 border`}>
        <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <PieChart className="w-6 h-6" />
          Overall Analytics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
            <p className={`text-sm mb-1 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
              Total Spending
            </p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ₹{totalSpending.toLocaleString('en-IN')}
            </p>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
            <p className={`text-sm mb-1 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
              Average per Statement
            </p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ₹{avgSpending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
            <p className={`text-sm mb-1 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
              Statements Processed
            </p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {successfulResults.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ComparisonTable = ({ results, darkMode }) => {
  return (
    <div className={`${darkMode ? 'bg-white/10 border-purple-500/30' : 'bg-white border-purple-200'} backdrop-blur-lg rounded-xl p-4 md:p-6 border overflow-x-auto`}>
      <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Side-by-Side Comparison
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={darkMode ? 'border-b border-purple-500/30' : 'border-b border-purple-200'}>
              <th className={`text-left p-3 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>Field</th>
              {results.map((r, idx) => (
                <th key={idx} className={`text-left p-3 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                  {r.filename?.substring(0, 20)}...
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {['Bank', 'Cardholder', 'Card Last 4', 'Total Due', 'Due Date', 'Confidence'].map(field => (
              <tr key={field} className={darkMode ? 'border-b border-white/5' : 'border-b border-gray-100'}>
                <td className={`p-3 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{field}</td>
                {results.map((r, idx) => (
                  <td key={idx} className={`p-3 ${darkMode ? 'text-purple-200' : 'text-gray-700'}`}>
                    {field === 'Bank' && r.bank}
                    {field === 'Cardholder' && r.data?.cardholderName}
                    {field === 'Card Last 4' && r.data?.cardLastFour}
                    {field === 'Total Due' && r.data?.totalAmountDue}
                    {field === 'Due Date' && r.data?.paymentDueDate}
                    {field === 'Confidence' && `${(r.confidence * 100).toFixed(0)}%`}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CCParserApp;