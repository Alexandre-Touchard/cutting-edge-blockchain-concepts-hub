import React, { useState } from 'react';
import { Lock, Unlock, Shield, Layers, TrendingUp, AlertCircle, CheckCircle, Zap, DollarSign } from 'lucide-react';
import EduTooltip from '../../ui/EduTooltip';
import LinkWithCopy from '../../ui/LinkWithCopy';
import { define } from '../glossary';
const T = EduTooltip;

const EigenLayerDemo = () => {
  const [validators, setValidators] = useState([
    { id: 1, name: 'Alice', ethStaked: 32, isRestaking: false, restakeAmount: 0, services: [], rewards: 0, slashRisk: 0 },
    { id: 2, name: 'Bob', ethStaked: 64, isRestaking: false, restakeAmount: 0, services: [], rewards: 0, slashRisk: 0 },
    { id: 3, name: 'Charlie', ethStaked: 32, isRestaking: false, restakeAmount: 0, services: [], rewards: 0, slashRisk: 0 },
    { id: 4, name: 'Dave', ethStaked: 96, isRestaking: false, restakeAmount: 0, services: [], rewards: 0, slashRisk: 0 }
  ]);

  const [avs, setAvs] = useState([
    {
      id: 1,
      name: 'Oracle Network',
      description: 'Decentralized price feeds',
      requiredStake: 32,
      rewardRate: 8,
      slashCondition: 'False data submission',
      validators: [],
      totalStaked: 0,
      status: 'active',
      icon: '🔮'
    },
    {
      id: 2,
      name: 'Bridge Protocol',
      description: 'Cross-chain asset bridge',
      requiredStake: 64,
      rewardRate: 12,
      slashCondition: 'Invalid bridge signature',
      validators: [],
      totalStaked: 0,
      status: 'active',
      icon: '🌉'
    },
    {
      id: 3,
      name: 'Data Availability',
      description: 'DA layer for rollups',
      requiredStake: 32,
      rewardRate: 6,
      slashCondition: 'Data withholding',
      validators: [],
      totalStaked: 0,
      status: 'active',
      icon: '💾'
    },
    {
      id: 4,
      name: 'ZK Prover Network',
      description: 'Shared ZK proof generation',
      requiredStake: 48,
      rewardRate: 15,
      slashCondition: 'Invalid proof submission',
      validators: [],
      totalStaked: 0,
      status: 'active',
      icon: '🔐'
    }
  ]);

  const [selectedValidator, setSelectedValidator] = useState(null);
  const [selectedAVS, setSelectedAVS] = useState(null);
  const [events, setEvents] = useState([]);
  const [totalRestaked, setTotalRestaked] = useState(0);

  const addEvent = (message, type = 'info') => {
    const newEvent = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setEvents(prev => [newEvent, ...prev].slice(0, 10));
  };

  const enableRestaking = (validatorId) => {
    setValidators(prev => prev.map(v => {
      if (v.id === validatorId) {
        const restakeAmount = v.ethStaked;
        addEvent(`${v.name} enabled restaking with ${restakeAmount} ETH`, 'success');
        return { ...v, isRestaking: true, restakeAmount };
      }
      return v;
    }));
  };

  const joinAVS = (validatorId, avsId) => {
    const validator = validators.find(v => v.id === validatorId);
    const avsService = avs.find(a => a.id === avsId);

    if (!validator.isRestaking) {
      addEvent(`${validator.name} must enable restaking first!`, 'error');
      return;
    }

    if (validator.restakeAmount < avsService.requiredStake) {
      addEvent(`${validator.name} needs ${avsService.requiredStake} ETH to join ${avsService.name}`, 'error');
      return;
    }

    if (validator.services.includes(avsId)) {
      addEvent(`${validator.name} already securing ${avsService.name}`, 'error');
      return;
    }

    // Update validator
    setValidators(prev => prev.map(v => {
      if (v.id === validatorId) {
        const newSlashRisk = v.slashRisk + (avsService.rewardRate / 2);
        return {
          ...v,
          services: [...v.services, avsId],
          slashRisk: newSlashRisk
        };
      }
      return v;
    }));

    // Update AVS
    setAvs(prev => prev.map(a => {
      if (a.id === avsId) {
        return {
          ...a,
          validators: [...a.validators, validatorId],
          totalStaked: a.totalStaked + validator.restakeAmount
        };
      }
      return a;
    }));

    setTotalRestaked(prev => prev + validator.restakeAmount);
    addEvent(`${validator.name} joined ${avsService.name} - earning ${avsService.rewardRate}% APY`, 'success');
  };

  const leaveAVS = (validatorId, avsId) => {
    const validator = validators.find(v => v.id === validatorId);
    const avsService = avs.find(a => a.id === avsId);

    // Update validator
    setValidators(prev => prev.map(v => {
      if (v.id === validatorId) {
        const newSlashRisk = Math.max(0, v.slashRisk - (avsService.rewardRate / 2));
        return {
          ...v,
          services: v.services.filter(s => s !== avsId),
          slashRisk: newSlashRisk
        };
      }
      return v;
    }));

    // Update AVS
    setAvs(prev => prev.map(a => {
      if (a.id === avsId) {
        return {
          ...a,
          validators: a.validators.filter(v => v !== validatorId),
          totalStaked: a.totalStaked - validator.restakeAmount
        };
      }
      return a;
    }));

    setTotalRestaked(prev => prev - validator.restakeAmount);
    addEvent(`${validator.name} left ${avsService.name}`, 'info');
  };

  const simulateRewards = () => {
    const activeRestakers = validators.filter(v => v.isRestaking);

    if (activeRestakers.length === 0) {
      addEvent(`No active restakers to reward`, 'info');
      return;
    }

    let totalRewardsDistributed = 0;

    const updatedValidators = validators.map(v => {
      if (!v.isRestaking) return v;

      let validatorRewards = 0;
      
      // Calculate base ETH staking reward (everyone gets this)
      const baseReward = (v.ethStaked * 3.5) / 100 / 365; // Daily reward
      validatorRewards += baseReward;
      
      // Calculate AVS rewards (only if joined services)
      if (v.services.length > 0) {
        v.services.forEach(avsId => {
          const avsService = avs.find(a => a.id === avsId);
          if (avsService) {
            const avsReward = (v.restakeAmount * avsService.rewardRate) / 100 / 365; // Daily reward
            validatorRewards += avsReward;
          }
        });
      }

      totalRewardsDistributed += validatorRewards;
      return { ...v, rewards: v.rewards + validatorRewards };
    });

    setValidators(updatedValidators);
    addEvent(`Rewards distributed: ${totalRewardsDistributed.toFixed(4)} ETH to ${activeRestakers.length} restaker${activeRestakers.length > 1 ? 's' : ''}`, 'success');
  };

  const simulateSlashing = (validatorId) => {
    const validator = validators.find(v => v.id === validatorId);
    if (!validator.isRestaking || validator.services.length === 0) {
      addEvent(`${validator.name} is not restaking on any services`, 'error');
      return;
    }

    const slashAmount = Math.min(validator.restakeAmount * 0.1, 3.2);
    
    setValidators(prev => prev.map(v => {
      if (v.id === validatorId) {
        return {
          ...v,
          restakeAmount: Math.max(0, v.restakeAmount - slashAmount),
          ethStaked: Math.max(0, v.ethStaked - slashAmount)
        };
      }
      return v;
    }));

    setTotalRestaked(prev => prev - slashAmount);
    addEvent(`⚠️ ${validator.name} was slashed ${slashAmount.toFixed(2)} ETH for protocol violation!`, 'error');
  };

  const calculateTotalAPY = (validator) => {
    if (!validator.isRestaking || validator.services.length === 0) return 3.5; // Base Ethereum staking
    
    const baseAPY = 3.5;
    const restakingAPY = validator.services.reduce((sum, avsId) => {
      const avsService = avs.find(a => a.id === avsId);
      return sum + avsService.rewardRate;
    }, 0);
    
    return baseAPY + restakingAPY;
  };

  const getTotalEthSecured = () => {
    return validators.reduce((sum, v) => sum + v.ethStaked, 0);
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'success': return 'border-l-emerald-500 bg-emerald-900 bg-opacity-20';
      case 'error': return 'border-l-red-500 bg-red-900 bg-opacity-20';
      default: return 'border-l-blue-500 bg-blue-900 bg-opacity-20';
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
  <T term="Restaking" text={define('Restaking')} />
  Demo
</h1>
          <p className="text-slate-300">
            Reuse your ETH stake to secure multiple protocols and earn additional rewards
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={20} className="text-emerald-400" />
              <span className="text-sm text-slate-400">Total ETH Staked</span>
            </div>
            <div className="text-2xl font-bold">{getTotalEthSecured()} ETH</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Layers size={20} className="text-blue-400" />
              <span className="text-sm text-slate-400">ETH Restaked</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{totalRestaked} ETH</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={20} className="text-yellow-400" />
              <span className="text-sm text-slate-400">
  <T term="Active AVS" text={define('Active AVS')} />
</span>
            </div>
            <div className="text-2xl font-bold">{avs.length}</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-purple-400" />
              <span className="text-sm text-slate-400">Restakers</span>
            </div>
            <div className="text-2xl font-bold">{validators.filter(v => v.isRestaking).length}/{validators.length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Validators */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="text-emerald-400" />
                Ethereum Validators
              </h2>

              <div className="space-y-3">
                {validators.map(validator => (
                  <div
                    key={validator.id}
                    onClick={() => setSelectedValidator(validator.id === selectedValidator ? null : validator.id)}
                    className={`bg-slate-700 rounded-lg p-3 cursor-pointer border-2 transition-all ${
                      selectedValidator === validator.id ? 'border-blue-500' : 'border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-lg">{validator.name}</div>
                        <div className="text-xs text-slate-400">Validator #{validator.id}</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${
                        validator.isRestaking ? 'bg-blue-600' : 'bg-slate-600'
                      }`}>
                        {validator.isRestaking ? 'RESTAKING' : 'STAKING'}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">ETH Staked:</span>
                        <span className="font-semibold text-emerald-400">{validator.ethStaked.toFixed(1)} ETH</span>
                      </div>
                      
                      {validator.isRestaking && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Restaked:</span>
                            <span className="font-semibold text-blue-400">{validator.restakeAmount.toFixed(1)} ETH</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Services:</span>
                            <span className="font-semibold">{validator.services.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Total APY:</span>
                            <span className="font-semibold text-yellow-400">{calculateTotalAPY(validator).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Rewards Earned:</span>
                            <span className="font-semibold text-emerald-400">{validator.rewards.toFixed(4)} ETH</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Slash Risk:</span>
                            <div className="flex items-center gap-1">
                              <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${validator.slashRisk > 20 ? 'bg-red-500' : validator.slashRisk > 10 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${Math.min(100, validator.slashRisk * 2)}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold">{validator.slashRisk.toFixed(0)}%</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {selectedValidator === validator.id && (
                      <div className="mt-3 pt-3 border-t border-slate-600 space-y-2">
                        {!validator.isRestaking ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              enableRestaking(validator.id);
                            }}
                            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold text-sm flex items-center justify-center gap-2"
                          >
                            <Lock size={16} />
                            Enable Restaking
                          </button>
                        ) : (
                          <>
                            <div className="text-xs text-slate-400 mb-2">
                              Securing {validator.services.length} AVS:
                            </div>
                            {validator.services.map(avsId => {
                              const avsService = avs.find(a => a.id === avsId);
                              return (
                                <div key={avsId} className="flex items-center justify-between bg-slate-600 rounded px-2 py-1">
                                  <span className="text-xs">{avsService.icon} {avsService.name}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      leaveAVS(validator.id, avsId);
                                    }}
                                    className="text-xs text-red-400 hover:text-red-300"
                                  >
                                    Leave
                                  </button>
                                </div>
                              );
                            })}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                simulateSlashing(validator.id);
                              }}
                              className="w-full px-3 py-1 bg-red-900 hover:bg-red-800 border border-red-600 rounded text-xs flex items-center justify-center gap-1"
                            >
                              <AlertCircle size={14} />
                              Simulate Slash
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={simulateRewards}
                className="w-full mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded font-semibold flex items-center justify-center gap-2"
              >
                <DollarSign size={18} />
                Distribute Rewards
              </button>
            </div>
          </div>

          {/* Middle Column - AVS Services */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Layers className="text-blue-400" />
                Actively Validated Services
              </h2>

              <div className="space-y-3">
                {avs.map(service => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedAVS(service.id === selectedAVS ? null : service.id)}
                    className={`bg-slate-700 rounded-lg p-3 cursor-pointer border-2 transition-all ${
                      selectedAVS === service.id ? 'border-purple-500' : 'border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="text-3xl">{service.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold">{service.name}</div>
                        <div className="text-xs text-slate-400">{service.description}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-slate-600 rounded p-2">
                        <div className="text-xs text-slate-400">Min Stake</div>
                        <div className="font-semibold">{service.requiredStake} ETH</div>
                      </div>
                      <div className="bg-slate-600 rounded p-2">
                        <div className="text-xs text-slate-400">APY</div>
                        <div className="font-semibold text-yellow-400">{service.rewardRate}%</div>
                      </div>
                      <div className="bg-slate-600 rounded p-2">
                        <div className="text-xs text-slate-400">Validators</div>
                        <div className="font-semibold">{service.validators.length}</div>
                      </div>
                      <div className="bg-slate-600 rounded p-2">
                        <div className="text-xs text-slate-400">TVL</div>
                        <div className="font-semibold text-blue-400">{service.totalStaked} ETH</div>
                      </div>
                    </div>

                    {selectedAVS === service.id && (
                      <div className="mt-3 pt-3 border-t border-slate-600">
                        <div className="text-xs text-red-400 mb-3 flex items-center gap-1">
                          <AlertCircle size={12} />
                          Slash condition: {service.slashCondition}
                        </div>

                        <div className="text-xs text-slate-400 mb-2">Select validator to join:</div>
                        <div className="space-y-1">
                          {validators.filter(v => v.isRestaking && !v.services.includes(service.id)).map(v => (
                            <button
                              key={v.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                joinAVS(v.id, service.id);
                              }}
                              disabled={v.restakeAmount < service.requiredStake}
                              className="w-full px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded text-xs font-semibold"
                            >
                              {v.name} {v.restakeAmount < service.requiredStake && '(needs more stake)'}
                            </button>
                          ))}
                          {validators.filter(v => v.isRestaking && !v.services.includes(service.id)).length === 0 && (
                            <div className="text-xs text-slate-500 text-center py-2">
                              {validators.every(v => !v.isRestaking) ? 'Enable restaking on validators first' : 'All eligible validators already joined'}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Activity Feed */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="text-yellow-400" />
                Activity Feed
              </h2>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {events.length === 0 ? (
                  <div className="text-center text-slate-400 py-8 text-sm">
                    No activity yet. Enable restaking and join AVS to get started!
                  </div>
                ) : (
                  events.map(event => (
                    <div
                      key={event.id}
                      className={`p-3 rounded border-l-4 ${getEventColor(event.type)}`}
                    >
                      <div className="text-sm">{event.message}</div>
                      <div className="text-xs text-slate-400 mt-1">{event.timestamp}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Real-World Applications */}
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 bg-opacity-30 rounded-lg p-6 border border-blue-700">
              <h2 className="text-2xl font-bold mb-4 text-blue-300">🌐 Real-World Applications</h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-slate-800 bg-opacity-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-emerald-400">Typical AVS Categories</h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-slate-700 rounded p-3">
                      <div className="font-bold text-blue-300">Data Availability (DA)</div>
                      <p className="text-xs text-slate-300 mb-2">Services that make rollup data retrievable (e.g., DA layers). Restaked security can help deter withholding attacks.</p>
                      <LinkWithCopy href="https://docs.eigenlayer.xyz/" label={<>EigenLayer docs →</>} className="text-xs text-blue-300 hover:text-blue-200 underline" />
                    </div>
                    <div className="bg-slate-700 rounded p-3">
                      <div className="font-bold text-purple-300">Cross-Chain / Bridges</div>
                      <p className="text-xs text-slate-300 mb-2">Bridge validators/operators can be backed by restaked ETH, increasing the cost of misbehavior.</p>
                      <LinkWithCopy href="https://docs.eigenlayer.xyz/" label={<>EigenLayer docs →</>} className="text-xs text-purple-300 hover:text-purple-200 underline" />
                    </div>
                    <div className="bg-slate-700 rounded p-3">
                      <div className="font-bold text-pink-300">Oracles & Coprocessors</div>
                      <p className="text-xs text-slate-300 mb-2">Extra computation or data feeds verified by a validator set with slashing conditions.</p>
                      <LinkWithCopy href="https://docs.eigenlayer.xyz/" label={<>EigenLayer docs →</>} className="text-xs text-pink-300 hover:text-pink-200 underline" />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800 bg-opacity-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-yellow-400">Why Teams Use Restaking</h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-slate-700 rounded p-3">
                      <div className="font-semibold text-blue-300 mb-1">🛡️ Bootstrapping Security</div>
                      <p className="text-xs text-slate-300">New protocols can start with strong economic security without creating a new token and validator set from scratch.</p>
                    </div>
                    <div className="bg-slate-700 rounded p-3">
                      <div className="font-semibold text-purple-300 mb-1">💸 Capital Efficiency</div>
                      <p className="text-xs text-slate-300">Stakers can earn additional yields from multiple services using the same underlying stake.</p>
                    </div>
                    <div className="bg-slate-700 rounded p-3">
                      <div className="font-semibold text-emerald-300 mb-1">⚠️ Shared Risk Awareness</div>
                      <p className="text-xs text-slate-300">Protocols can define slashing rules so bad behavior is economically punished, but risks compound across services.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Further Reading */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-bold mb-4 text-blue-300">📚 Further Reading</h2>
              <ul className="space-y-2 text-sm">
                <li><LinkWithCopy href="https://docs.eigenlayer.xyz/" label={<>EigenLayer docs →</>} className="text-blue-300 hover:text-blue-200 underline" /></li>
                <li><LinkWithCopy href="https://eigenlayer.xyz/" label={<>EigenLayer website →</>} className="text-blue-300 hover:text-blue-200 underline" /></li>
                <li><LinkWithCopy href="https://ethereum.org/en/staking/" label={<>Ethereum staking overview →</>} className="text-blue-300 hover:text-blue-200 underline" /></li>
              </ul>
            </div>

            {/* Info Panel */}
            <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-blue-300">How EigenLayer Works</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <div>
                  <div className="font-semibold text-blue-400 mb-1">1. Enable Restaking</div>
                  <p className="text-xs">Point your ETH validator stake to EigenLayer contracts</p>
                </div>
                <div>
                  <div className="font-semibold text-blue-400 mb-1">2. Join AVS</div>
                  <p className="text-xs">Opt-in to secure additional services and earn extra rewards</p>
                </div>
                <div>
                  <div className="font-semibold text-blue-400 mb-1">3. Earn More</div>
                  <p className="text-xs">Get base ETH staking rewards + AVS rewards, but take on additional slash risk</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EigenLayerDemo;