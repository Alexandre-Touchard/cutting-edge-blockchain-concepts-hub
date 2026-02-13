import React, { useState } from 'react';
import { Send, CheckCircle, Clock, AlertTriangle, Shield, Zap, Lock, Eye } from 'lucide-react';

const BlockchainInteropDemo = () => {
  const [selectedProtocol, setSelectedProtocol] = useState('ibc');
  const [sourceChain, setSourceChain] = useState('cosmos');
  const [destChain, setDestChain] = useState('osmosis');
  const [messageType, setMessageType] = useState('token_transfer');
  const [amount, setAmount] = useState(100);
  
  const [packets, setPackets] = useState([]);
  const [nextPacketId, setNextPacketId] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [events, setEvents] = useState([]);
  
  const [lightClients, setLightClients] = useState({
    cosmos: { osmosis: { height: 1000, verified: true }, ethereum: { height: 500, verified: true } },
    osmosis: { cosmos: { height: 1000, verified: true } },
    ethereum: { cosmos: { height: 500, verified: true }, polygon: { height: 2000, verified: true } },
    polygon: { ethereum: { height: 2000, verified: true } }
  });

  const protocols = {
    ibc: {
      name: 'IBC (Inter-Blockchain Communication)',
      chains: ['cosmos', 'osmosis'],
      trustModel: 'Light Client Verification',
      security: 'Very High',
      speed: 'Fast (6-20s)',
      cost: 'Low',
      description: 'Trustless protocol using light clients to verify state proofs',
      color: 'blue'
    },
    ccip: {
      name: 'CCIP (Chainlink Cross-Chain)',
      chains: ['ethereum', 'polygon'],
      trustModel: 'Decentralized Oracle Network',
      security: 'High',
      speed: 'Medium (1-5min)',
      cost: 'Medium',
      description: 'Oracle-based messaging with cryptoeconomic security',
      color: 'purple'
    },
    layerzero: {
      name: 'LayerZero',
      chains: ['ethereum', 'polygon'],
      trustModel: 'Oracle + Relayer',
      security: 'Medium-High',
      speed: 'Fast (20-60s)',
      cost: 'Low-Medium',
      description: 'Ultra-light nodes with independent oracle and relayer',
      color: 'green'
    }
  };

  const chains = {
    cosmos: { name: 'Cosmos Hub', color: 'bg-indigo-600', height: 1000 },
    osmosis: { name: 'Osmosis', color: 'bg-purple-600', height: 1000 },
    ethereum: { name: 'Ethereum', color: 'bg-blue-600', height: 2000 },
    polygon: { name: 'Polygon', color: 'bg-violet-600', height: 2000 }
  };

  const messageTypes = {
    token_transfer: { name: 'Token Transfer', icon: '💰' },
    contract_call: { name: 'Contract Call', icon: '📜' },
    nft_transfer: { name: 'NFT Transfer', icon: '🖼️' },
    data_message: { name: 'Data Message', icon: '📨' }
  };

  const addEvent = (message, type = 'info') => {
    setEvents(prev => [{
      id: Date.now() + Math.random(),
      message,
      type,
      time: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 15));
  };

  const sendMessage = async () => {
    if (sourceChain === destChain) {
      addEvent('Source and destination must be different', 'error');
      return;
    }

    setIsProcessing(true);
    const protocol = protocols[selectedProtocol];
    
    // Step 1: Create packet
    const packet = {
      id: nextPacketId,
      protocol: selectedProtocol,
      source: sourceChain,
      destination: destChain,
      type: messageType,
      amount,
      status: 'pending',
      steps: [],
      timestamp: Date.now()
    };

    setPackets(prev => [packet, ...prev]);
    setNextPacketId(nextPacketId + 1);
    
    addEvent(`📤 Packet #${packet.id} created on ${chains[sourceChain].name}`, 'info');
    await new Promise(resolve => setTimeout(resolve, 800));

    // Step 2: Protocol-specific processing
    if (selectedProtocol === 'ibc') {
      await processIBC(packet);
    } else if (selectedProtocol === 'ccip') {
      await processCCIP(packet);
    } else if (selectedProtocol === 'layerzero') {
      await processLayerZero(packet);
    }

    setIsProcessing(false);
  };

  const processIBC = async (packet) => {
    // Step 1: Commit on source chain
    updatePacket(packet.id, { status: 'committed', steps: [...packet.steps, 'Source chain commitment'] });
    addEvent(`✓ Packet committed on ${chains[packet.source].name}`, 'success');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Light client verification
    updatePacket(packet.id, { steps: [...packet.steps, 'Source chain commitment', 'Light client verification'] });
    addEvent(`🔍 Light client verifying state proof...`, 'info');
    await new Promise(resolve => setTimeout(resolve, 1200));

    const hasLightClient = lightClients[packet.destination]?.[packet.source]?.verified;
    if (!hasLightClient) {
      updatePacket(packet.id, { status: 'failed', steps: [...packet.steps, 'Source chain commitment', 'Light client verification', 'Verification failed'] });
      addEvent(`❌ No verified light client on ${chains[packet.destination].name}`, 'error');
      return;
    }

    updatePacket(packet.id, { steps: [...packet.steps, 'Source chain commitment', 'Light client verification', 'Proof verified'] });
    addEvent(`✓ State proof verified by light client`, 'success');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Execute on destination
    updatePacket(packet.id, { status: 'relaying', steps: [...packet.steps, 'Source chain commitment', 'Light client verification', 'Proof verified', 'Relaying to destination'] });
    addEvent(`📡 Relayer submitting packet to ${chains[packet.destination].name}`, 'info');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Acknowledgment
    updatePacket(packet.id, { status: 'completed', steps: [...packet.steps, 'Source chain commitment', 'Light client verification', 'Proof verified', 'Relaying to destination', 'Executed on destination', 'Acknowledgment sent'] });
    addEvent(`✅ Packet #${packet.id} executed on ${chains[packet.destination].name}`, 'success');
    await new Promise(resolve => setTimeout(resolve, 800));
    addEvent(`🔙 Acknowledgment received on ${chains[packet.source].name}`, 'success');
  };

  const processCCIP = async (packet) => {
    // Step 1: Source chain emission
    updatePacket(packet.id, { status: 'committed', steps: [...packet.steps, 'Message emitted'] });
    addEvent(`✓ Message emitted on ${chains[packet.source].name}`, 'success');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: DON observation
    updatePacket(packet.id, { status: 'observing', steps: [...packet.steps, 'Message emitted', 'DON observing'] });
    addEvent(`👁️ Decentralized Oracle Network observing...`, 'info');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 3: Consensus
    updatePacket(packet.id, { steps: [...packet.steps, 'Message emitted', 'DON observing', 'Oracles reaching consensus'] });
    addEvent(`🤝 Oracle consensus achieved (12/15 nodes)`, 'success');
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Step 4: Risk Management
    updatePacket(packet.id, { steps: [...packet.steps, 'Message emitted', 'DON observing', 'Oracles reaching consensus', 'Risk analysis'] });
    addEvent(`🛡️ Risk Management Network validating...`, 'info');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 5: Execution
    updatePacket(packet.id, { status: 'relaying', steps: [...packet.steps, 'Message emitted', 'DON observing', 'Oracles reaching consensus', 'Risk analysis', 'Approved for execution'] });
    addEvent(`✓ Risk checks passed`, 'success');
    await new Promise(resolve => setTimeout(resolve, 800));

    updatePacket(packet.id, { status: 'completed', steps: [...packet.steps, 'Message emitted', 'DON observing', 'Oracles reaching consensus', 'Risk analysis', 'Approved for execution', 'Executed on destination'] });
    addEvent(`✅ Message executed on ${chains[packet.destination].name}`, 'success');
  };

  const processLayerZero = async (packet) => {
    // Step 1: User application calls
    updatePacket(packet.id, { status: 'committed', steps: [...packet.steps, 'User app initiated'] });
    addEvent(`✓ Application initiated on ${chains[packet.source].name}`, 'success');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Oracle observation
    updatePacket(packet.id, { steps: [...packet.steps, 'User app initiated', 'Oracle observing'] });
    addEvent(`👁️ Oracle monitoring block headers...`, 'info');
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Step 3: Relayer fetches proof
    updatePacket(packet.id, { steps: [...packet.steps, 'User app initiated', 'Oracle observing', 'Relayer fetching proof'] });
    addEvent(`📡 Relayer fetching transaction proof`, 'info');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Submit to destination
    updatePacket(packet.id, { status: 'relaying', steps: [...packet.steps, 'User app initiated', 'Oracle observing', 'Relayer fetching proof', 'Submitting to destination'] });
    addEvent(`📤 Oracle and Relayer submitting independently`, 'info');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 5: Verification and execution
    updatePacket(packet.id, { steps: [...packet.steps, 'User app initiated', 'Oracle observing', 'Relayer fetching proof', 'Submitting to destination', 'Validating on destination'] });
    addEvent(`🔍 Destination chain validating Oracle vs Relayer data`, 'info');
    await new Promise(resolve => setTimeout(resolve, 1000));

    updatePacket(packet.id, { status: 'completed', steps: [...packet.steps, 'User app initiated', 'Oracle observing', 'Relayer fetching proof', 'Submitting to destination', 'Validating on destination', 'Executed'] });
    addEvent(`✅ Message executed on ${chains[packet.destination].name}`, 'success');
  };

  const updatePacket = (id, updates) => {
    setPackets(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600';
      case 'committed': return 'bg-blue-600';
      case 'observing': return 'bg-purple-600';
      case 'relaying': return 'bg-indigo-600';
      case 'completed': return 'bg-emerald-600';
      case 'failed': return 'bg-red-600';
      default: return 'bg-slate-600';
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'success': return 'border-l-emerald-500 bg-emerald-900 bg-opacity-20';
      case 'error': return 'border-l-red-500 bg-red-900 bg-opacity-20';
      default: return 'border-l-blue-500 bg-blue-900 bg-opacity-20';
    }
  };

  const currentProtocol = protocols[selectedProtocol];
  const availableChains = currentProtocol.chains;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">🌉 Blockchain Interoperability Protocols</h1>
          <p className="text-slate-300">
            Compare IBC, CCIP, and LayerZero - different approaches to cross-chain messaging
          </p>
        </div>

        {/* Protocol Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(protocols).map(([key, protocol]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedProtocol(key);
                setSourceChain(protocol.chains[0]);
                setDestChain(protocol.chains[1]);
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedProtocol === key
                  ? `border-${protocol.color}-500 bg-${protocol.color}-900 bg-opacity-30`
                  : 'border-slate-600 bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <div className="font-semibold text-lg mb-2">{protocol.name}</div>
              <div className="text-sm text-slate-300 mb-3">{protocol.description}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-700 rounded p-2">
                  <div className="text-slate-400">Trust Model</div>
                  <div className="font-semibold">{protocol.trustModel}</div>
                </div>
                <div className="bg-slate-700 rounded p-2">
                  <div className="text-slate-400">Security</div>
                  <div className="font-semibold">{protocol.security}</div>
                </div>
                <div className="bg-slate-700 rounded p-2">
                  <div className="text-slate-400">Speed</div>
                  <div className="font-semibold">{protocol.speed}</div>
                </div>
                <div className="bg-slate-700 rounded p-2">
                  <div className="text-slate-400">Cost</div>
                  <div className="font-semibold">{protocol.cost}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Message Builder */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Send className="text-blue-400" />
                Create Message
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Source Chain</label>
                  <select
                    value={sourceChain}
                    onChange={(e) => setSourceChain(e.target.value)}
                    disabled={isProcessing}
                    className="w-full bg-slate-700 rounded px-3 py-2"
                  >
                    {availableChains.map(chain => (
                      <option key={chain} value={chain}>{chains[chain].name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Destination Chain</label>
                  <select
                    value={destChain}
                    onChange={(e) => setDestChain(e.target.value)}
                    disabled={isProcessing}
                    className="w-full bg-slate-700 rounded px-3 py-2"
                  >
                    {availableChains.map(chain => (
                      <option key={chain} value={chain}>{chains[chain].name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Message Type</label>
                  <select
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value)}
                    disabled={isProcessing}
                    className="w-full bg-slate-700 rounded px-3 py-2"
                  >
                    {Object.entries(messageTypes).map(([key, type]) => (
                      <option key={key} value={key}>
                        {type.icon} {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Amount / Value</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                    disabled={isProcessing}
                    className="w-full bg-slate-700 rounded px-3 py-2"
                    min="1"
                  />
                </div>

                <button
                  onClick={sendMessage}
                  disabled={isProcessing}
                  className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded font-semibold flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  {isProcessing ? 'Processing...' : 'Send Cross-Chain Message'}
                </button>
              </div>
            </div>

            {/* Protocol Details */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="text-purple-400" />
                {currentProtocol.name}
              </h2>

              <div className="space-y-3 text-sm">
                {selectedProtocol === 'ibc' && (
                  <>
                    <div className="bg-slate-700 rounded p-3">
                      <div className="font-semibold text-blue-400 mb-2">How IBC Works</div>
                      <ul className="space-y-1 text-xs text-slate-300">
                        <li>• Light clients verify chain state</li>
                        <li>• Cryptographic proofs ensure validity</li>
                        <li>• No external validators needed</li>
                        <li>• Trustless & fully decentralized</li>
                        <li>• Acknowledgments confirm delivery</li>
                      </ul>
                    </div>
                    <div className="bg-emerald-900 bg-opacity-20 border border-emerald-700 rounded p-2 text-xs">
                      <strong>Trust Model:</strong> Trustless - relies on cryptographic proofs and light client verification
                    </div>
                  </>
                )}

                {selectedProtocol === 'ccip' && (
                  <>
                    <div className="bg-slate-700 rounded p-3">
                      <div className="font-semibold text-purple-400 mb-2">How CCIP Works</div>
                      <ul className="space-y-1 text-xs text-slate-300">
                        <li>• Decentralized Oracle Network observes</li>
                        <li>• Multiple independent oracles verify</li>
                        <li>• Risk Management Network validates</li>
                        <li>• Cryptoeconomic security guarantees</li>
                        <li>• Built-in rate limiting & monitoring</li>
                      </ul>
                    </div>
                    <div className="bg-purple-900 bg-opacity-20 border border-purple-700 rounded p-2 text-xs">
                      <strong>Trust Model:</strong> Decentralized oracle consensus with economic incentives and penalties
                    </div>
                  </>
                )}

                {selectedProtocol === 'layerzero' && (
                  <>
                    <div className="bg-slate-700 rounded p-3">
                      <div className="font-semibold text-green-400 mb-2">How LayerZero Works</div>
                      <ul className="space-y-1 text-xs text-slate-300">
                        <li>• Ultra-light nodes on each chain</li>
                        <li>• Independent Oracle + Relayer system</li>
                        <li>• Oracle monitors block headers</li>
                        <li>• Relayer fetches transaction proofs</li>
                        <li>• Destination validates both match</li>
                      </ul>
                    </div>
                    <div className="bg-green-900 bg-opacity-20 border border-green-700 rounded p-2 text-xs">
                      <strong>Trust Model:</strong> Oracle and Relayer must independently agree (configurable trust assumptions)
                    </div>
                  </>
                )}
              </div>
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

          {/* Middle - Packet Flow */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="text-emerald-400" />
                Message Packets ({packets.length})
              </h2>

              <div className="space-y-3 max-h-[800px] overflow-y-auto">
                {packets.length === 0 ? (
                  <div className="text-center text-slate-400 py-12 text-sm">
                    No packets sent yet. Create a cross-chain message to begin.
                  </div>
                ) : (
                  packets.map(packet => (
                    <div
                      key={packet.id}
                      className="bg-slate-700 rounded-lg p-4 border-l-4"
                      style={{ borderColor: packet.status === 'completed' ? '#10b981' : packet.status === 'failed' ? '#ef4444' : '#3b82f6' }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-lg">Packet #{packet.id}</div>
                          <div className="text-xs text-slate-400">
                            {protocols[packet.protocol].name}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(packet.status)}`}>
                          {packet.status.toUpperCase()}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                        <div className="bg-slate-600 rounded p-2">
                          <div className="text-xs text-slate-400">From</div>
                          <div className="font-semibold">{chains[packet.source].name}</div>
                        </div>
                        <div className="bg-slate-600 rounded p-2">
                          <div className="text-xs text-slate-400">To</div>
                          <div className="font-semibold">{chains[packet.destination].name}</div>
                        </div>
                        <div className="bg-slate-600 rounded p-2">
                          <div className="text-xs text-slate-400">Type</div>
                          <div className="font-semibold">
                            {messageTypes[packet.type].icon} {messageTypes[packet.type].name}
                          </div>
                        </div>
                        <div className="bg-slate-600 rounded p-2">
                          <div className="text-xs text-slate-400">Amount</div>
                          <div className="font-semibold text-emerald-400">{packet.amount}</div>
                        </div>
                      </div>

                      {packet.steps.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-600">
                          <div className="text-xs font-semibold text-slate-300 mb-2">Processing Steps:</div>
                          <div className="space-y-2">
                            {packet.steps.map((step, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs">
                                {idx < packet.steps.length - 1 || packet.status === 'completed' ? (
                                  <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                ) : packet.status === 'failed' ? (
                                  <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <Clock size={14} className="text-blue-400 mt-0.5 flex-shrink-0 animate-pulse" />
                                )}
                                <span className="text-slate-300">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-6 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Protocol Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-400">Feature</th>
                  <th className="text-left py-2 px-3">IBC</th>
                  <th className="text-left py-2 px-3">CCIP</th>
                  <th className="text-left py-2 px-3">LayerZero</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-slate-700">
                  <td className="py-2 px-3 text-slate-400">Trust Model</td>
                  <td className="py-2 px-3">Light Client (Trustless)</td>
                  <td className="py-2 px-3">Oracle Consensus</td>
                  <td className="py-2 px-3">Oracle + Relayer</td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="py-2 px-3 text-slate-400">Security Level</td>
                  <td className="py-2 px-3 text-emerald-400">Very High ⭐⭐⭐⭐⭐</td>
                  <td className="py-2 px-3 text-blue-400">High ⭐⭐⭐⭐</td>
                  <td className="py-2 px-3 text-yellow-400">Medium-High ⭐⭐⭐</td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="py-2 px-3 text-slate-400">Speed</td>
                  <td className="py-2 px-3">6-20 seconds</td>
                  <td className="py-2 px-3">1-5 minutes</td>
                  <td className="py-2 px-3">20-60 seconds</td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="py-2 px-3 text-slate-400">Cost</td>
                  <td className="py-2 px-3 text-emerald-400">Low</td>
                  <td className="py-2 px-3 text-yellow-400">Medium</td>
                  <td className="py-2 px-3 text-blue-400">Low-Medium</td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="py-2 px-3 text-slate-400">Verification</td>
                  <td className="py-2 px-3">Cryptographic Proofs</td>
                  <td className="py-2 px-3">Oracle Consensus (DON)</td>
                  <td className="py-2 px-3">Independent Oracle & Relayer</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-400">Setup Complexity</td>
                  <td className="py-2 px-3">High (Light clients)</td>
                  <td className="py-2 px-3">Low (Managed service)</td>
                  <td className="py-2 px-3">Medium (Configure Oracle/Relayer)</td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="py-2 px-3 text-slate-400">Censorship Resistance</td>
                  <td className="py-2 px-3 text-emerald-400">Very High</td>
                  <td className="py-2 px-3 text-blue-400">High</td>
                  <td className="py-2 px-3 text-yellow-400">Medium</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-400">Best For</td>
                  <td className="py-2 px-3">Cosmos ecosystem, max security</td>
                  <td className="py-2 px-3">Enterprise, multi-chain apps</td>
                  <td className="py-2 px-3">Cost-sensitive, custom configs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Deep Dive */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-blue-300 flex items-center gap-2">
              <Shield size={18} />
              IBC Security Model
            </h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p className="text-xs"><strong>Attack Vector:</strong> Must compromise source chain consensus OR forge cryptographic proofs (computationally infeasible)</p>
              <p className="text-xs"><strong>Trust Assumptions:</strong> Zero - only relies on cryptographic security</p>
              <p className="text-xs"><strong>Failure Mode:</strong> If light client falls behind, messages are delayed until sync completes</p>
              <div className="mt-3 pt-3 border-t border-blue-700">
                <div className="text-xs font-semibold text-blue-400 mb-1">Light Client Status:</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Cosmos → Osmosis:</span>
                    <span className="text-emerald-400">✓ Synced (Block {lightClients.cosmos.osmosis.height})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Osmosis → Cosmos:</span>
                    <span className="text-emerald-400">✓ Synced (Block {lightClients.osmosis.cosmos.height})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-900 bg-opacity-20 border border-purple-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-purple-300 flex items-center gap-2">
              <Shield size={18} />
              CCIP Security Model
            </h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p className="text-xs"><strong>Attack Vector:</strong> Must compromise majority of DON (Decentralized Oracle Network) nodes simultaneously</p>
              <p className="text-xs"><strong>Trust Assumptions:</strong> Honest majority of oracles + Risk Management Network validation</p>
              <p className="text-xs"><strong>Failure Mode:</strong> Rate limiting activates on suspicious activity; manual intervention may be required</p>
              <div className="mt-3 pt-3 border-t border-purple-700">
                <div className="text-xs font-semibold text-purple-400 mb-1">Network Status:</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Active Oracle Nodes:</span>
                    <span className="text-emerald-400">15/15</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consensus Threshold:</span>
                    <span className="text-blue-400">10/15 (66%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Management:</span>
                    <span className="text-emerald-400">✓ Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-900 bg-opacity-20 border border-green-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-green-300 flex items-center gap-2">
              <Shield size={18} />
              LayerZero Security Model
            </h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p className="text-xs"><strong>Attack Vector:</strong> Must compromise BOTH Oracle and Relayer (assumed to be independent entities)</p>
              <p className="text-xs"><strong>Trust Assumptions:</strong> Oracle and Relayer do not collude</p>
              <p className="text-xs"><strong>Failure Mode:</strong> If Oracle and Relayer provide conflicting data, transaction fails</p>
              <div className="mt-3 pt-3 border-t border-green-700">
                <div className="text-xs font-semibold text-green-400 mb-1">Component Status:</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Oracle (Chainlink):</span>
                    <span className="text-emerald-400">✓ Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Relayer:</span>
                    <span className="text-emerald-400">✓ Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Independence:</span>
                    <span className="text-yellow-400">⚠ User-configurable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-6 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Real-World Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700 rounded p-4">
              <div className="font-semibold text-blue-400 mb-2">IBC Examples</div>
              <ul className="space-y-1 text-sm text-slate-300">
                <li className="text-xs">• Osmosis DEX trading Cosmos tokens</li>
                <li className="text-xs">• Stride liquid staking across chains</li>
                <li className="text-xs">• Interchain accounts & queries</li>
                <li className="text-xs">• Cross-chain governance voting</li>
              </ul>
            </div>
            <div className="bg-slate-700 rounded p-4">
              <div className="font-semibold text-purple-400 mb-2">CCIP Examples</div>
              <ul className="space-y-1 text-sm text-slate-300">
                <li className="text-xs">• Synthetix cross-chain liquidity</li>
                <li className="text-xs">• Aave cross-chain lending</li>
                <li className="text-xs">• ENS name resolution on L2s</li>
                <li className="text-xs">• Enterprise multi-chain apps</li>
              </ul>
            </div>
            <div className="bg-slate-700 rounded p-4">
              <div className="font-semibold text-green-400 mb-2">LayerZero Examples</div>
              <ul className="space-y-1 text-sm text-slate-300">
                <li className="text-xs">• Stargate cross-chain swaps</li>
                <li className="text-xs">• Omnichain NFTs (move across chains)</li>
                <li className="text-xs">• Radiant multi-chain lending</li>
                <li className="text-xs">• Cross-chain governance tokens</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainInteropDemo;