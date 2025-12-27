import React, { useState, useEffect } from 'react';

interface Participant {
  id: string;
  name: string;
  color: string;
  cursor?: { line: number; column: number; file: string };
  isHost: boolean;
  isOnline: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
}

interface LiveShareProps {
  currentFile?: string;
  userName: string;
  onClose: () => void;
}

function LiveShare({ currentFile, userName, onClose }: LiveShareProps) {
  const [isHosting, setIsHosting] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [permissions, setPermissions] = useState({
    canEdit: true,
    canTerminal: false,
    canDebug: false
  });

  const participantColors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const startSession = () => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setIsHosting(true);
    setParticipants([{
      id: 'host',
      name: userName || 'Host',
      color: participantColors[0],
      isHost: true,
      isOnline: true
    }]);

    // Simulate another user joining
    setTimeout(() => {
      setParticipants(prev => [...prev, {
        id: 'guest1',
        name: 'Guest User',
        color: participantColors[1],
        cursor: { line: 15, column: 8, file: currentFile || 'index.ts' },
        isHost: false,
        isOnline: true
      }]);
      addSystemMessage('Guest User joined the session');
    }, 3000);
  };

  const joinSession = () => {
    if (!joinCode) return;

    setSessionId(joinCode);
    setIsJoined(true);
    setParticipants([
      {
        id: 'host',
        name: 'Host User',
        color: participantColors[0],
        isHost: true,
        isOnline: true
      },
      {
        id: 'me',
        name: userName || 'You',
        color: participantColors[1],
        isHost: false,
        isOnline: true
      }
    ]);
    addSystemMessage('You joined the session');
  };

  const endSession = () => {
    setIsHosting(false);
    setIsJoined(false);
    setSessionId('');
    setParticipants([]);
    setChatMessages([]);
  };

  const addSystemMessage = (message: string) => {
    setChatMessages(prev => [...prev, {
      id: `sys-${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      message,
      timestamp: new Date()
    }]);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: isHosting ? 'host' : 'me',
      senderName: userName || (isHosting ? 'Host' : 'You'),
      message: newMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const copySessionLink = () => {
    navigator.clipboard.writeText(`my-ide://live/${sessionId}`);
  };

  const kickParticipant = (participantId: string) => {
    setParticipants(participants.filter(p => p.id !== participantId));
    addSystemMessage('Participant was removed from the session');
  };

  const togglePermission = (permission: keyof typeof permissions) => {
    setPermissions(prev => ({ ...prev, [permission]: !prev[permission] }));
  };

  return (
    <div className="live-share">
      <div className="live-header">
        <h3>👥 Live Share</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      {!isHosting && !isJoined ? (
        <div className="live-start">
          <div className="start-options">
            <div className="start-option">
              <h4>Start Collaboration Session</h4>
              <p>Share your workspace with others in real-time</p>
              <button onClick={startSession} className="start-btn">
                🚀 Start Session
              </button>
            </div>

            <div className="divider">OR</div>

            <div className="start-option">
              <h4>Join Existing Session</h4>
              <p>Enter a session code to join</p>
              <div className="join-input">
                <input
                  type="text"
                  placeholder="Enter session code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <button onClick={joinSession} disabled={joinCode.length !== 6}>
                  Join
                </button>
              </div>
            </div>
          </div>

          <div className="live-features">
            <h4>Features</h4>
            <ul>
              <li>📝 Real-time collaborative editing</li>
              <li>👀 See other participants' cursors</li>
              <li>💬 Built-in chat</li>
              <li>🔒 Permission controls</li>
              <li>📞 Voice chat (coming soon)</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="live-session">
          <div className="session-info">
            <div className="session-code">
              <span>Session: </span>
              <strong>{sessionId}</strong>
              <button onClick={copySessionLink} title="Copy invite link">📋</button>
            </div>
            {isHosting && (
              <button onClick={endSession} className="end-btn">End Session</button>
            )}
            {isJoined && (
              <button onClick={endSession} className="leave-btn">Leave Session</button>
            )}
          </div>

          <div className="participants-section">
            <h4>Participants ({participants.length})</h4>
            <div className="participants-list">
              {participants.map(p => (
                <div key={p.id} className={`participant ${p.isOnline ? 'online' : 'offline'}`}>
                  <div
                    className="participant-avatar"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="participant-info">
                    <span className="participant-name">
                      {p.name}
                      {p.isHost && <span className="host-badge">Host</span>}
                    </span>
                    {p.cursor && (
                      <span className="participant-location">
                        {p.cursor.file}:{p.cursor.line}
                      </span>
                    )}
                  </div>
                  {isHosting && !p.isHost && (
                    <button
                      onClick={() => kickParticipant(p.id)}
                      className="kick-btn"
                      title="Remove participant"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isHosting && (
            <div className="permissions-section">
              <h4>Guest Permissions</h4>
              <div className="permissions-list">
                <label>
                  <input
                    type="checkbox"
                    checked={permissions.canEdit}
                    onChange={() => togglePermission('canEdit')}
                  />
                  Can edit files
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={permissions.canTerminal}
                    onChange={() => togglePermission('canTerminal')}
                  />
                  Can use terminal
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={permissions.canDebug}
                    onChange={() => togglePermission('canDebug')}
                  />
                  Can start debugging
                </label>
              </div>
            </div>
          )}

          <div className={`chat-section ${showChat ? 'expanded' : 'collapsed'}`}>
            <div className="chat-header" onClick={() => setShowChat(!showChat)}>
              <span>💬 Chat</span>
              <span className="toggle">{showChat ? '▼' : '▲'}</span>
            </div>
            {showChat && (
              <>
                <div className="chat-messages">
                  {chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`chat-message ${msg.senderId === 'system' ? 'system' : ''}`}
                    >
                      {msg.senderId !== 'system' && (
                        <span className="msg-sender">{msg.senderName}: </span>
                      )}
                      <span className="msg-text">{msg.message}</span>
                    </div>
                  ))}
                </div>
                <div className="chat-input">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button onClick={sendMessage}>Send</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveShare;
