import React, { useState, useEffect } from 'react';
import { Download, Upload, CheckCircle, XCircle, AlertCircle, Users, Database, Zap, Shield, Info } from 'lucide-react';

const Tooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children || <Info size={14} className="text-blue-400 inline ml-1" />}
      </div>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-slate-950 border border-blue-500 rounded-lg p-3 text-xs text-slate-200 shadow-xl">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-blue-500"></div>
        </div>
      )}
    </div>
  );
};

const PeerDASDemo = () => {
  // Network configuration
  const [nodes, setNodes] = useState([]);
  const [numNodes, setNumNodes] = useState(20);
  const [numColumns, setNumColumns] = useState(64);
  const [columnsPerNode, setColumnsPerNode] = useState(16);
  const [samplingTarget, setSamplingTarget] = useState(16);
  
  // Blob data
  const [blobData, setBlobData] = useState(null);
  const [blobSubmitted, setBlobSubmitted] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSampling, setIsSampling] = useState(false);
  
  // Sampling state
  const [samplingResults, setSamplingResults] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [availabilityConfirmed, setAvailabilityConfirmed] = useState(false);
  
  const [events, setEvents] = useState([]);

  // Initialize network
  useEffect(() => {
    initializeNetwork();
  }, [numNodes, numColumns, columnsPerNode]);

  const addEvent = (message, type = 'info') => {
    setEvents(prev => [{
      id: Date.now() + Math.random(),
      message,
      type,
      time: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 12));
  };

  const initializeNetwork = () => {
    const newNodes = [];
    for (let i = 0; i < numNodes; i++) {
      // Each node is assigned a subset of columns to custody
      const assignedColumns = [];
      for (let j = 0; j < columnsPerNode; j++) {
        const columnIndex = (i * columnsPerNode + j) % numColumns;
        assignedColumns.push(columnIndex);
      }
      
      newNodes.push({
        id: i,
        name: `Node ${i}`,
        assignedColumns,
        hasData: {},
        sampledColumns: [],
        samplingSuccess: null
      });
    }
    setNodes(newNodes);
    setBlobSubmitted(false);
    setAvailabilityConfirmed(false);
    setSamplingResults([]);
  };

  const createBlob = () => {
    // Simulate blob data being split into columns
    const blob = {
      id: `blob_${Date.now()}`,
      size: 128, // KB
      columns: Array(numColumns).fill(null).map((_, i) => ({
        index: i,
        data: `col_${i}_data`,
        custody: []
      }))
    };
    
    setBlobData(blob);
    addEvent(`Blob created: ${numColumns} columns, ${blob.size}KB`, 'success');
  };

  const publishBlob = async () => {
    if (!blobData) return;
    
    setIsPublishing(true);
    addEvent('Publishing blob to network...', 'info');
    
    // Simulate column distribution
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const updatedNodes = nodes.map(node => {
      const nodeData = {};
      node.assignedColumns.forEach(colIndex => {
        nodeData[colIndex] = true;
        blobData.columns[colIndex].custody.push(node.id);
      });
      
      return {
        ...node,
        hasData: nodeData
      };
    });
    
    setNodes(updatedNodes);
    setBlobSubmitted(true);
    setIsPublishing(false);
    
    const totalCustodians = blobData.columns.reduce((sum, col) => sum + col.custody.length, 0);
    addEvent(`Blob published! ${totalCustodians} column assignments across ${numNodes} nodes`, 'success');
  };

  const performSampling = async () => {
    if (!blobSubmitted) return;
    
    setIsSampling(true);
    setAvailabilityConfirmed(false);
    setSamplingResults([]);
    addEvent('Starting random sampling...', 'info');
    
    // Each node samples random columns
    const results = [];
    
    for (let i = 0; i < nodes.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const node = nodes[i];
      const sampledColumns = [];
      const alreadySampled = new Set();
      
      // Sample random columns (avoid duplicates)
      while (sampledColumns.length < samplingTarget) {
        const randomCol = Math.floor(Math.random() * numColumns);
        if (!alreadySampled.has(randomCol)) {
          alreadySampled.add(randomCol);
          
          // Find a node that has this column
          const custodians = blobData.columns[randomCol].custody;
          const success = custodians.length > 0;
          const provider = success ? custodians[Math.floor(Math.random() * custodians.length)] : null;
          
          sampledColumns.push({
            columnIndex: randomCol,
            success,
            provider
          });
        }
      }
      
      const successRate = sampledColumns.filter(s => s.success).length / sampledColumns.length;
      
      results.push({
        nodeId: node.id,
        sampledColumns,
        successRate,
        allSuccess: successRate === 1.0
      });
      
      // Update node state
      setNodes(prev => prev.map(n => 
        n.id === node.id ? { ...n, sampledColumns, samplingSuccess: successRate === 1.0 } : n
      ));
      
      addEvent(`Node ${node.id} sampled ${samplingTarget} columns - ${(successRate * 100).toFixed(0)}% success`, 
               successRate === 1.0 ? 'success' : 'error');
    }
    
    setSamplingResults(results);
    setIsSampling(false);
    
    // Check if data is available (all nodes succeeded)
    const allNodesSucceeded = results.every(r => r.allSuccess);
    setAvailabilityConfirmed(allNodesSucceeded);
    
    if (allNodesSucceeded) {
      addEvent('✓ Data availability CONFIRMED - All nodes successfully sampled', 'success');
    } else {
      const failedNodes = results.filter(r => !r.allSuccess).length;
      addEvent(`⚠ Data availability UNCERTAIN - ${failedNodes} nodes had sampling failures`, 'error');
    }
  };

  const getNodeColor = (node) => {
    if (!blobSubmitted) return 'bg-slate-700';
    if (node.samplingSuccess === true) return 'bg-emerald-700';
    if (node.samplingSuccess === false) return 'bg-red-700';
    return 'bg-blue-700';
  };

  const getNodeBorderColor = (node) => {
    if (selectedNode === node.id) return 'border-yellow-500';
    if (!blobSubmitted) return 'border-slate-600';
    if (node.samplingSuccess === true) return 'border-emerald-500';
    if (node.samplingSuccess === false) return 'border-red-500';
    return 'border-blue-500';
  };

  const getCoverageStats = () => {
    if (!blobData) return { min: 0, max: 0, avg: 0 };
    
    const custodyCounts = blobData.columns.map(col => col.custody.length);
    return {
      min: Math.min(...custodyCounts),
      max: Math.max(...custodyCounts),
      avg: (custodyCounts.reduce((a, b) => a + b, 0) / custodyCounts.length).toFixed(1)
    };
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'success': return 'border-l-emerald-500 bg-emerald-900 bg-opacity-20';
      case 'error': return 'border-l-red-500 bg-red-900 bg-opacity-20';
      default: return 'border-l-blue-500 bg-blue-900 bg-opacity-20';
    }
  };

  const coverage = getCoverageStats();
  const samplingSuccessRate = samplingResults.length > 0 
    ? (samplingResults.filter(r => r.allSuccess).length / samplingResults.length * 100).toFixed(0)
    : 0;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">PeerDAS: Peer Data Availability Sampling</h1>
          <p className="text-slate-300">
            Ethereum's scalable data availability layer - nodes sample random columns instead of downloading everything
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-blue-400" />
              <span className="text-sm text-slate-400">
                Network Nodes
                <Tooltip text="The number of nodes participating in the network. Each node stores a subset of data columns and participates in sampling to verify availability." />
              </span>
            </div>
            <div className="text-2xl font-bold">{numNodes}</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Database size={20} className="text-purple-400" />
              <span className="text-sm text-slate-400">
                Columns/Node
                <Tooltip text="Number of data columns each node is assigned to store. With 64 total columns, if each node stores 16, that's 25% of the total data per node." />
              </span>
            </div>
            <div className="text-2xl font-bold">{columnsPerNode}</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={20} className="text-yellow-400" />
              <span className="text-sm text-slate-400">
                Samples/Node
                <Tooltip text="How many random columns each node samples to verify data availability. More samples = higher confidence but more bandwidth usage." />
              </span>
            </div>
            <div className="text-2xl font-bold">{samplingTarget}</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={20} className="text-emerald-400" />
              <span className="text-sm text-slate-400">
                Coverage
                <Tooltip text="Average redundancy factor - how many nodes store each column. Higher coverage means better fault tolerance if nodes go offline." />
              </span>
            </div>
            <div className="text-lg font-bold">{coverage.avg}x avg</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              {availabilityConfirmed ? (
                <CheckCircle size={20} className="text-emerald-400" />
              ) : (
                <AlertCircle size={20} className="text-yellow-400" />
              )}
              <span className="text-sm text-slate-400">
                Availability
                <Tooltip text="Confirmed when all nodes successfully retrieve their samples. This statistically proves the entire blob is available with >99.9% confidence." />
              </span>
            </div>
            <div className="text-lg font-bold">
              {availabilityConfirmed ? '✓ Confirmed' : samplingResults.length > 0 ? `${samplingSuccessRate}%` : 'N/A'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Network Config */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4">Network Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">
                    Number of Nodes: {numNodes}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={numNodes}
                    onChange={(e) => setNumNodes(parseInt(e.target.value))}
                    disabled={blobSubmitted}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">
                    Columns Per Node: {columnsPerNode}
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={columnsPerNode}
                    onChange={(e) => setColumnsPerNode(parseInt(e.target.value))}
                    disabled={blobSubmitted}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">
                    Samples Per Node: {samplingTarget}
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={samplingTarget}
                    onChange={(e) => setSamplingTarget(parseInt(e.target.value))}
                    disabled={isSampling}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Blob Actions */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4">Blob Operations</h2>
              
              <div className="space-y-3">
                <button
                  onClick={createBlob}
                  disabled={blobData && !blobSubmitted}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded font-semibold flex items-center justify-center gap-2"
                >
                  <Database size={18} />
                  Create Blob ({numColumns} columns)
                </button>

                <button
                  onClick={publishBlob}
                  disabled={!blobData || blobSubmitted || isPublishing}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded font-semibold flex items-center justify-center gap-2"
                >
                  <Upload size={18} />
                  {isPublishing ? 'Publishing...' : 'Publish to Network'}
                </button>

                <button
                  onClick={performSampling}
                  disabled={!blobSubmitted || isSampling}
                  className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded font-semibold flex items-center justify-center gap-2"
                >
                  <Zap size={18} />
                  {isSampling ? 'Sampling...' : 'Start Sampling'}
                </button>

                <button
                  onClick={initializeNetwork}
                  className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-semibold"
                >
                  Reset Network
                </button>
              </div>

              {blobData && (
                <div className="mt-4 p-3 bg-slate-700 rounded text-sm">
                  <div className="font-semibold mb-2">Blob Info:</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Columns:</span>
                      <span className="font-semibold">{numColumns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Size:</span>
                      <span className="font-semibold">{blobData.size} KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Redundancy:</span>
                      <span className="font-semibold">{coverage.avg}x</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Event Log */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4">Event Log</h2>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {events.length === 0 ? (
                  <div className="text-center text-slate-400 py-4 text-sm">
                    No events yet
                  </div>
                ) : (
                  events.map(event => (
                    <div key={event.id} className={`p-2 rounded border-l-4 ${getEventColor(event.type)}`}>
                      <div className="text-xs">{event.message}</div>
                      <div className="text-xs text-slate-500 mt-1">{event.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Middle Column - Node Network */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4">Network Nodes</h2>
              
              <div className="grid grid-cols-4 gap-2 max-h-[700px] overflow-y-auto">
                {nodes.map(node => (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                    className={`${getNodeColor(node)} ${getNodeBorderColor(node)} border-2 rounded-lg p-2 cursor-pointer transition-all hover:scale-105`}
                  >
                    <div className="text-xs font-semibold text-center">{node.id}</div>
                    {node.samplingSuccess !== null && (
                      <div className="text-center mt-1">
                        {node.samplingSuccess ? (
                          <CheckCircle size={14} className="inline text-emerald-300" />
                        ) : (
                          <XCircle size={14} className="inline text-red-300" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700 text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-700 border-2 border-slate-600 rounded"></div>
                  <span>Not sampled yet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-700 border-2 border-blue-500 rounded"></div>
                  <span>Has blob data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-700 border-2 border-emerald-500 rounded"></div>
                  <span>Sampling success</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-700 border-2 border-red-500 rounded"></div>
                  <span>Sampling failed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Node Details */}
          <div className="space-y-6">
            {selectedNode !== null ? (
              <div className="bg-slate-800 rounded-lg p-4 border-2 border-yellow-500">
                <h2 className="text-xl font-semibold mb-4">Node {selectedNode} Details</h2>
                
                {(() => {
                  const node = nodes.find(n => n.id === selectedNode);
                  return (
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-slate-400 mb-2">Custodied Columns ({node.assignedColumns.length}):</div>
                        <div className="flex flex-wrap gap-1">
                          {node.assignedColumns.map(col => (
                            <div key={col} className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs font-mono">
                              {col}
                            </div>
                          ))}
                        </div>
                      </div>

                      {node.sampledColumns.length > 0 && (
                        <div>
                          <div className="text-sm text-slate-400 mb-2">
                            Sampled Columns ({node.sampledColumns.length}):
                          </div>
                          <div className="space-y-1 max-h-96 overflow-y-auto">
                            {node.sampledColumns.map((sample, idx) => (
                              <div
                                key={idx}
                                className={`p-2 rounded flex items-center justify-between text-xs ${
                                  sample.success ? 'bg-emerald-900 bg-opacity-30' : 'bg-red-900 bg-opacity-30'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {sample.success ? (
                                    <CheckCircle size={14} className="text-emerald-400" />
                                  ) : (
                                    <XCircle size={14} className="text-red-400" />
                                  )}
                                  <span className="font-mono">Column {sample.columnIndex}</span>
                                </div>
                                {sample.success && (
                                  <span className="text-slate-400">
                                    from Node {sample.provider}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h2 className="text-xl font-semibold mb-4">How PeerDAS Works</h2>
                
                <div className="space-y-4 text-sm text-slate-300">
                  <div>
                    <div className="font-semibold text-blue-400 mb-2">1. Data Sharding</div>
                    <p className="text-xs">
                      Blob data is split into {numColumns} columns. Each node only stores a subset ({columnsPerNode} columns) instead of the entire blob.
                    </p>
                  </div>

                  <div>
                    <div className="font-semibold text-blue-400 mb-2">2. Random Distribution</div>
                    <p className="text-xs">
                      Columns are distributed across the network with redundancy (average {coverage.avg}x coverage). Multiple nodes hold each column for reliability.
                    </p>
                  </div>

                  <div>
                    <div className="font-semibold text-blue-400 mb-2">3. Sampling</div>
                    <p className="text-xs">
                      Instead of downloading everything, nodes sample {samplingTarget} random columns. If all samples succeed, data is statistically available.
                    </p>
                  </div>

                  <div>
                    <div className="font-semibold text-blue-400 mb-2">4. Availability Proof</div>
                    <p className="text-xs">
                      With {samplingTarget} samples from {numColumns} columns, there's {'>'}99.9% confidence the entire blob is retrievable if all nodes succeed.
                    </p>
                  </div>

                  <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded p-3">
                    <div className="text-xs font-semibold text-blue-300 mb-1">Key Benefits:</div>
                    <ul className="text-xs space-y-1 text-slate-300">
                      <li>• Nodes store only {((columnsPerNode / numColumns) * 100).toFixed(0)}% of data</li>
                      <li>• Network bandwidth reduced {Math.floor(numColumns / samplingTarget)}x vs full download</li>
                      <li>• Scales to hundreds of nodes efficiently</li>
                      <li>• Maintains strong availability guarantees</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeerDASDemo;