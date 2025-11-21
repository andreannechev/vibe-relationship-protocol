
import React, { useState } from 'react';
import { ViewState, User, Relationship, UserStatus, DashboardMode, Treaty, ConnectionTier, InteractionMode, RelationshipAnnotations } from './types';
import { MOCK_SELF, MOCK_FRIENDS, MOCK_RELATIONSHIPS, DEFAULT_DIRECTIVES, DEFAULT_CALENDAR_CONFIG, DEFAULT_NEURAL_CONFIG } from './constants';
import { RadarView } from './components/RadarView';
import { FriendList } from './components/FriendList';
import { GardenView } from './components/GardenView';
import { TopHUD } from './components/TopHUD';
import { ControlDeck } from './components/ControlDeck';
import { NegotiationCard } from './components/NegotiationCard';
import { FriendDossier } from './components/FriendDossier';
import { ProfileEditor } from './components/ProfileEditor';
import { DirectivesEditor } from './components/DirectivesEditor';
import { HandshakeSimulator } from './components/HandshakeSimulator';
import { CalendarSetup } from './components/CalendarSetup';
import { NeuralBridgeSetup } from './components/NeuralBridgeSetup';
import { ViewSwitcher } from './components/ViewSwitcher';
import { TreatyGenerator } from './components/TreatyGenerator';
import { InviteLanding } from './components/InviteLanding';
import { ShadowNodeForm } from './components/ShadowNodeForm';
import { ShadowNodeDetail } from './components/ShadowNodeDetail';
import { SignalDeck } from './components/SignalDeck';
import { Terminal, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  // App State
  const [currentUser, setCurrentUser] = useState<User>(MOCK_SELF);
  const [friends, setFriends] = useState<User[]>(MOCK_FRIENDS);
  const [relationships, setRelationships] = useState<Relationship[]>(MOCK_RELATIONSHIPS);
  const [treaties, setTreaties] = useState<Treaty[]>([]);
  
  // Navigation State
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>('RADAR');
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  
  // For Invite Landing Simulation
  const [landingTreaty, setLandingTreaty] = useState<Treaty | null>(null);

  // Handlers
  const handleSelectFriend = (friendId: string) => {
    setSelectedFriendId(friendId);
    const friend = friends.find(f => f.id === friendId);
    if (friend?.is_shadow) {
      setView('SHADOW_NODE_DETAIL');
    } else {
      // UX Correction: Open Dossier first (Review Buffer)
      setView('FRIEND_DOSSIER');
    }
  };

  const handleBackToDashboard = () => {
    setSelectedFriendId(null);
    setView('DASHBOARD');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const toggleUserStatus = () => {
    const newStatus = currentUser.current_status === UserStatus.OPEN ? UserStatus.RECHARGE : UserStatus.OPEN;
    setCurrentUser({ ...currentUser, current_status: newStatus });
  };

  // --- DOSSIER HANDLERS ---
  const handleUpdateAnnotations = (friendId: string, annotations: RelationshipAnnotations) => {
    setRelationships(prev => prev.map(r => 
      r.user_b === friendId ? { ...r, annotations } : r
    ));
  };

  const handleScout = () => {
    // Transitions from Dossier to Negotiation (Scout Action)
    setView('NEGOTIATION');
  };

  const handleSoftTouch = () => {
    // Transitions from Dossier to Signal Deck
    setView('SIGNAL_DECK');
  };

  // --- HIDE / REMOVE HANDLERS ---
  const handleToggleHide = (friendId: string) => {
    setRelationships(prev => prev.map(r => 
      r.user_b === friendId ? { ...r, is_hidden: !r.is_hidden } : r
    ));
  };

  const handleRemoveFriend = (friendId: string) => {
    // Remove from friends list
    setFriends(prev => prev.filter(f => f.id !== friendId));
    // Remove relationship
    setRelationships(prev => prev.filter(r => r.user_b !== friendId));
    // Go back to dashboard
    handleBackToDashboard();
  };

  // --- SHADOW NODE HANDLERS ---
  const handleAddShadowNode = (
    shadowUser: User, 
    driftDays: number, 
    mode: InteractionMode,
    route: string,
    rhythms: string[]
  ) => {
     setFriends([...friends, shadowUser]);
     
     // Auto-infer Tier based on Drift
     // < 14 days = INNER CIRCLE
     // < 45 days = FRIEND
     // > 45 days = ACQUAINTANCE
     let tier = ConnectionTier.FRIEND;
     if (driftDays <= 14) tier = ConnectionTier.INNER_CIRCLE;
     if (driftDays > 45) tier = ConnectionTier.ACQUAINTANCE;

     const newRel: Relationship = {
       user_a: currentUser.id,
       user_b: shadowUser.id,
       tier: tier,
       drift_threshold_days: driftDays,
       last_interaction: Date.now(), 
       interaction_mode: mode,
       shared_interests: ["Offline"],
       is_hidden: false,
       preferred_route: route,
       active_rhythms: rhythms,
       annotations: {
         tags: ["Shadow Node"],
         energy_requirement: "MEDIUM",
         notes: "",
       }
     };
     setRelationships([...relationships, newRel]);
     setView('DASHBOARD');
  };

  const handleUpdateShadowNode = (
    userId: string,
    name: string,
    driftDays: number,
    mode: InteractionMode,
    route: string,
    rhythms: string[]
  ) => {
    // Update User Name
    setFriends(prev => prev.map(f => f.id === userId ? { ...f, name } : f));

    // Update Relationship
    setRelationships(prev => prev.map(r => r.user_b === userId ? {
      ...r,
      drift_threshold_days: driftDays,
      interaction_mode: mode,
      preferred_route: route,
      active_rhythms: rhythms
    } : r));

    setView('SHADOW_NODE_DETAIL');
  };

  const handleLogInteraction = (friendId: string) => {
    setRelationships(prev => prev.map(r => 
      r.user_b === friendId ? { ...r, last_interaction: Date.now() } : r
    ));
  };

  // Treaty & Invite Handlers
  const handleGenerateTreaty = (treaty: Treaty) => {
    setTreaties([...treaties, treaty]);
  };

  // --- VISIBILITY FILTERS ---
  // Get list of friends who are NOT hidden for Radar/Garden views
  const activeRelationships = relationships.filter(r => !r.is_hidden);
  const activeFriendIds = new Set(activeRelationships.map(r => r.user_b));
  const activeFriends = friends.filter(f => activeFriendIds.has(f.id));

  return (
    <div className="fixed inset-0 bg-zinc-950 text-zinc-200 font-sans overflow-hidden flex items-center justify-center">
      
      <div className="w-full max-w-md h-full sm:h-[850px] sm:rounded-xl sm:shadow-2xl sm:border sm:border-zinc-800 relative bg-zinc-950 overflow-hidden flex flex-col">
        
        {/* LAYER 1: DASHBOARD (Always rendered in background) */}
        <div className={`absolute inset-0 transition-all duration-500 ${view === 'DASHBOARD' ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
           <TopHUD 
             user={currentUser} 
             onToggleStatus={toggleUserStatus}
             onOpenProfile={() => setView('PROFILE')}
           />
           
           {/* View Switcher Floating Below Header */}
           <div className="absolute top-20 left-0 right-0 flex justify-center z-20 pointer-events-auto">
             <ViewSwitcher currentMode={dashboardMode} onChange={setDashboardMode} />
           </div>

           {/* Main View Content */}
           <div className="absolute inset-0 z-0">
             {dashboardMode === 'RADAR' && (
               <RadarView 
                 friends={activeFriends} // Only show Active
                 relationships={activeRelationships} 
                 onSelectFriend={handleSelectFriend} 
               />
             )}
             {dashboardMode === 'GARDEN' && (
               <GardenView 
                  friends={activeFriends} // Only show Active
                  relationships={activeRelationships}
                  onSelectFriend={handleSelectFriend}
               />
             )}
             {dashboardMode === 'LIST' && (
               <FriendList 
                  friends={friends} // Show ALL (FriendList handles active/hidden internally)
                  relationships={relationships}
                  onSelectFriend={handleSelectFriend}
               />
             )}
           </div>

           {/* Add Connection FAB (Bottom Right) */}
           <div className="absolute bottom-24 right-6 z-30">
              <button 
                onClick={() => setView('TREATY_GENERATOR')}
                className="w-14 h-14 bg-white rounded-full text-zinc-900 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center hover:scale-110 transition-transform"
              >
                 <Plus size={24} strokeWidth={3} />
              </button>
           </div>

           {/* Control Deck - only suggests active friends */}
           <ControlDeck 
             friends={activeFriends} 
             relationships={activeRelationships} 
             onSelectFriend={handleSelectFriend} 
           />
        </div>

        {/* LAYER 2: MODALS / OVERLAYS */}
        <AnimatePresence>
          {view !== 'DASHBOARD' && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 bg-white z-30 flex flex-col"
            >
              {/* Friend Dossier (Review Buffer) */}
              {view === 'FRIEND_DOSSIER' && selectedFriendId && (
                <FriendDossier 
                  user={friends.find(f => f.id === selectedFriendId)!}
                  relationship={relationships.find(r => r.user_b === selectedFriendId)!}
                  onUpdateAnnotations={(notes) => handleUpdateAnnotations(selectedFriendId, notes)}
                  onScout={handleScout}
                  onSoftTouch={handleSoftTouch}
                  onClose={handleBackToDashboard}
                  onToggleHide={() => handleToggleHide(selectedFriendId)}
                  onRemove={() => handleRemoveFriend(selectedFriendId)}
                />
              )}

              {/* Negotiation / Scout Action (Was FRIEND_DETAIL) */}
              {view === 'NEGOTIATION' && selectedFriendId && (
                <NegotiationCard 
                  self={currentUser}
                  friend={friends.find(f => f.id === selectedFriendId)!}
                  relationship={relationships.find(r => r.user_b === selectedFriendId)!}
                  onClose={() => setView('FRIEND_DOSSIER')} // Go back to Dossier, not Dashboard
                  onToggleHide={() => handleToggleHide(selectedFriendId)}
                  onRemove={() => handleRemoveFriend(selectedFriendId)}
                />
              )}

              {/* Shadow Node Detail View */}
              {view === 'SHADOW_NODE_DETAIL' && selectedFriendId && (
                <ShadowNodeDetail 
                  user={friends.find(f => f.id === selectedFriendId)!}
                  relationship={relationships.find(r => r.user_b === selectedFriendId)!}
                  onEdit={() => setView('SHADOW_NODE_EDIT')}
                  onBack={handleBackToDashboard}
                  onLogInteraction={() => handleLogInteraction(selectedFriendId)}
                  onOpenSignalDeck={() => setView('SIGNAL_DECK')}
                  onRemove={() => handleRemoveFriend(selectedFriendId)}
                  onToggleHide={() => handleToggleHide(selectedFriendId)}
                />
              )}

              {/* Shadow Node Editor */}
              {view === 'SHADOW_NODE_EDIT' && selectedFriendId && (
                 <ShadowNodeForm
                   onUpdateShadowNode={handleUpdateShadowNode}
                   initialData={{
                     user: friends.find(f => f.id === selectedFriendId)!,
                     relationship: relationships.find(r => r.user_b === selectedFriendId)!
                   }}
                   onBack={() => setView('SHADOW_NODE_DETAIL')}
                 />
              )}

              {/* Signal Deck View */}
              {view === 'SIGNAL_DECK' && selectedFriendId && (
                <SignalDeck 
                  self={currentUser}
                  friend={friends.find(f => f.id === selectedFriendId)!}
                  relationship={relationships.find(r => r.user_b === selectedFriendId)!}
                  onClose={() => {
                     // Determine where to go back to
                     const friend = friends.find(f => f.id === selectedFriendId);
                     if (friend?.is_shadow) setView('SHADOW_NODE_DETAIL');
                     else setView('FRIEND_DOSSIER');
                  }}
                />
              )}

              {/* Settings / Profile Pages */}
              {view === 'PROFILE' && (
                <ProfileEditor 
                  user={currentUser}
                  onUpdateUser={handleUpdateUser}
                  onBack={handleBackToDashboard}
                  onOpenDirectives={() => setView('DIRECTIVES')}
                  onOpenCalendarSetup={() => setView('CALENDAR_SETUP')}
                  onOpenNeuralBridge={() => setView('NEURAL_BRIDGE')}
                />
              )}

              {view === 'DIRECTIVES' && (
                <DirectivesEditor
                  user={currentUser}
                  onUpdateUser={handleUpdateUser}
                  onBack={() => setView('PROFILE')}
                />
              )}
              
              {view === 'CALENDAR_SETUP' && (
                <CalendarSetup 
                  config={currentUser.calendar_config}
                  onUpdateConfig={(newConfig) => handleUpdateUser({...currentUser, calendar_config: newConfig})}
                  onBack={() => setView('PROFILE')}
                />
              )}

              {view === 'NEURAL_BRIDGE' && (
                <NeuralBridgeSetup
                  config={currentUser.neural_config}
                  onUpdateConfig={(newConfig) => handleUpdateUser({...currentUser, neural_config: newConfig})}
                  onBack={() => setView('PROFILE')}
                />
              )}

              {view === 'PROTOCOL_SIMULATOR' && (
                <HandshakeSimulator 
                  self={currentUser}
                  friends={friends}
                  relationships={relationships}
                  onClose={handleBackToDashboard}
                />
              )}

              {/* INVITE FLOW VIEWS */}
              {view === 'TREATY_GENERATOR' && (
                <TreatyGenerator
                  user={currentUser}
                  onGenerateTreaty={handleGenerateTreaty}
                  onShadowMode={() => setView('SHADOW_NODE_FORM')}
                  onBack={handleBackToDashboard}
                />
              )}

              {view === 'SHADOW_NODE_FORM' && (
                <ShadowNodeForm 
                  onAddShadowNode={handleAddShadowNode}
                  onBack={() => setView('TREATY_GENERATOR')}
                />
              )}

              {view === 'INVITE_LANDING' && landingTreaty && (
                <InviteLanding
                  sender={currentUser}
                  treaty={landingTreaty}
                  onAccept={handleBackToDashboard}
                  onDecline={handleBackToDashboard}
                />
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {/* Debug Trigger */}
        {view === 'DASHBOARD' && (
           <button 
             onClick={() => setView('PROTOCOL_SIMULATOR')}
             className="absolute top-4 right-4 z-50 p-2 text-zinc-700 hover:text-zinc-500 transition-colors"
             title="Dev Console"
           >
             <Terminal size={16} />
           </button>
        )}

      </div>
    </div>
  );
};

export default App;
