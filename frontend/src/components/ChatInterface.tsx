import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Send, Loader2, MessageCircle, ClipboardList, Play, Lock, Camera } from 'lucide-react';
import { ChatMessage, SectionAssignment, TreatmentStatus } from '../types';
import { useMoodCapture } from '../hooks/useMoodCapture';
import { chatService } from '../services/chatService';
import { treatmentService } from '../services/treatmentService';
import { useAppContext } from '../context/AppContext';
import { INTAKE_USER_MESSAGE_LIMIT, INTAKE_COMPLETE_BANNER, USER_INPUT_MAX_LENGTH } from '../constants';
import MarkdownMessage from './MarkdownMessage';

type ActiveChat = {
  chatId: string | null;
  chatType: number;
  title: string;
  assignmentId?: string;
  userMessages: number;
  messageLimit: number;
};

function mapMessages(messages: Array<{ id: string; sender: 'user' | 'ai'; content: string; createdAt?: string }>): ChatMessage[] {
  return messages.map((m) => ({
    id: m.id,
    sender: m.sender,
    content: m.content,
    timestamp: m.createdAt
      ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : undefined,
  }));
}

function isSectionUnlocked(assignments: SectionAssignment[], assignment: SectionAssignment): boolean {
  if (assignment.status === 'completed' || assignment.status === 'in_progress') return true;
  const prior = assignments.filter((a) => a.sortOrder < assignment.sortOrder);
  return prior.every((a) => a.status === 'completed');
}

function defaultIntakeChat(): ActiveChat {
  return {
    chatId: null,
    chatType: 1,
    title: 'Intake Assessment',
    userMessages: 0,
    messageLimit: INTAKE_USER_MESSAGE_LIMIT,
  };
}

type CameraPermission = 'prompt' | 'granted' | 'denied';

const ChatInterface: React.FC = () => {
  const { currentUser, chatMessages, setChatMessages, currentChatId, setCurrentChatId } = useAppContext();
  const [input, setInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [treatmentStatus, setTreatmentStatus] = useState<TreatmentStatus | null>(null);
  const [activeChat, setActiveChat] = useState<ActiveChat>(defaultIntakeChat);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [chatComplete, setChatComplete] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraRequestingRef = useRef(false);
  const [cameraPermission, setCameraPermission] = useState<CameraPermission>('prompt');
  const [cameraRequesting, setCameraRequesting] = useState(false);
  const intakeComplete = treatmentStatus?.intakeProgress?.complete ?? false;
  const waitingForDoctor = intakeComplete && (treatmentStatus?.assignments.length ?? 0) === 0;
  const cameraGranted = cameraPermission === 'granted';
  const moodEnabled = !!activeChat?.chatId && !chatComplete && !waitingForDoctor && cameraGranted;
  const { scansUsed, scansLimit, status: moodStatus } = useMoodCapture({
    videoRef,
    chatId: activeChat?.chatId,
    enabled: moodEnabled,
  });

  const loadChatMessages = useCallback(async (chatId: string) => {
    const history = await chatService.getChatHistory({ chatId });
    if (history.length > 0 && history[0].messages?.length) {
      setCurrentChatId(chatId);
      setChatMessages(mapMessages(history[0].messages));
      const userCount = history[0].messages.filter((m) => m.sender === 'user').length;
      return userCount;
    }
    setCurrentChatId(chatId);
    setChatMessages([]);
    return 0;
  }, [setChatMessages, setCurrentChatId]);

  const initFromStatus = useCallback(async (status: TreatmentStatus) => {
    const intake = status.intakeProgress;
    const intakeDone = intake?.complete ?? false;

    if (!intakeDone) {
      const chatId = intake?.chatId ?? null;
      const userMessages = chatId ? await loadChatMessages(chatId) : 0;
      setActiveChat({
        chatId,
        chatType: 1,
        title: 'Intake Assessment',
        userMessages: chatId ? userMessages : (intake?.userMessages ?? 0),
        messageLimit: intake?.required ?? INTAKE_USER_MESSAGE_LIMIT,
      });
      setChatComplete((intake?.userMessages ?? userMessages) >= (intake?.required ?? INTAKE_USER_MESSAGE_LIMIT));
      if (!chatId && userMessages === 0) {
        setChatMessages([{
          id: 'welcome',
          sender: 'ai',
          content: `Hi ${currentUser?.firstName || 'there'}! I'm Zehnify. Let's begin your intake assessment — share how you've been feeling and what's brought you here. This session has ${intake?.required ?? INTAKE_USER_MESSAGE_LIMIT} messages.`,
        }]);
      }
      return;
    }

    if (status.assignments.length === 0) {
      setActiveChat({
        chatId: intake?.chatId ?? null,
        chatType: 1,
        title: 'Intake Complete',
        userMessages: intake?.userMessages ?? INTAKE_USER_MESSAGE_LIMIT,
        messageLimit: INTAKE_USER_MESSAGE_LIMIT,
      });
      if (intake?.chatId) await loadChatMessages(intake.chatId);
      setChatComplete(true);
      return;
    }

    const inProgress = status.assignments.find((a) => a.status === 'in_progress');
    const nextAssigned = status.assignments.find(
      (a) => a.status === 'assigned' && isSectionUnlocked(status.assignments, a),
    );
    const target = inProgress ?? nextAssigned ?? status.assignments[status.assignments.length - 1];

    if (target.chatId) {
      const userMessages = await loadChatMessages(target.chatId);
      setActiveChat({
        chatId: target.chatId,
        chatType: target.sectionType,
        title: target.sectionLabel,
        assignmentId: target.id,
        userMessages,
        messageLimit: target.requiredUserMessages,
      });
      setChatComplete(target.status === 'completed' || userMessages >= target.requiredUserMessages);
    } else {
      setActiveChat({
        chatId: null,
        chatType: target.sectionType,
        title: target.sectionLabel,
        assignmentId: target.id,
        userMessages: 0,
        messageLimit: target.requiredUserMessages,
      });
      setChatMessages([{
        id: 'section-welcome',
        sender: 'ai',
        content: `Ready for "${target.sectionLabel}"? Tap Start Section below when you're ready.`,
      }]);
      setChatComplete(false);
    }
  }, [currentUser?.firstName, loadChatMessages, setChatMessages]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setSendError(null);
      try {
        const status = await treatmentService.getStatus();
        setTreatmentStatus(status);
        await initFromStatus(status);
      } catch (error) {
        console.error('Failed to load treatment status:', error);
        const fallback = defaultIntakeChat();
        setActiveChat(fallback);
        setChatComplete(false);
        setChatMessages([{
          id: 'welcome',
          sender: 'ai',
          content: `Hi ${currentUser?.firstName || 'there'}! I'm Zehnify. Let's begin your intake assessment — share how you've been feeling and what's brought you here.`,
        }]);
        setSendError('Could not load treatment status. You can still start your intake chat below.');
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, [initFromStatus, currentUser?.firstName, setChatMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isBotTyping]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const requestCameraPermission = useCallback(async () => {
    if (cameraRequestingRef.current) return;

    if (!window.isSecureContext) {
      setCameraPermission('denied');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraPermission('denied');
      return;
    }

    cameraRequestingRef.current = true;
    setCameraRequesting(true);

    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setCameraPermission('granted');
    } catch (error) {
      const err = error as DOMException;
      console.error('Camera access denied', err.name, err.message);
      setCameraPermission('denied');
    } finally {
      cameraRequestingRef.current = false;
      setCameraRequesting(false);
    }
  }, [stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const moodLabel = cameraRequesting
    ? 'Check browser prompt...'
    : !cameraGranted
      ? cameraPermission === 'denied'
        ? 'Camera blocked'
        : 'Camera needed'
      : moodStatus === 'scanning'
        ? 'Scanning...'
        : moodStatus === 'no_face'
          ? 'No face'
          : moodStatus === 'cooldown'
            ? 'Scanner paused'
            : moodStatus === 'capped'
              ? 'Scan limit reached'
              : moodStatus === 'detected'
                ? 'Active'
                : 'Scanning...';

  const handleStartSection = async (assignment: SectionAssignment) => {
    setStartingId(assignment.id);
    try {
      const chat = await treatmentService.startAssignment(assignment.id);
      const status = await treatmentService.getStatus();
      setTreatmentStatus(status);
      setActiveChat({
        chatId: chat.id,
        chatType: assignment.sectionType,
        title: assignment.sectionLabel,
        assignmentId: assignment.id,
        userMessages: 0,
        messageLimit: assignment.requiredUserMessages,
      });
      setCurrentChatId(chat.id);
      setChatMessages([{
        id: 'section-start',
        sender: 'ai',
        content: `Let's begin "${assignment.sectionLabel}". Share openly — I'm here to guide you through this CBT section.`,
      }]);
      setChatComplete(false);
    } catch (error) {
      console.error('Failed to start section:', error);
    } finally {
      setStartingId(null);
    }
  };

  const handleSelectAssignment = async (assignment: SectionAssignment) => {
    if (!isSectionUnlocked(treatmentStatus?.assignments ?? [], assignment)) return;
    if (assignment.status === 'assigned' && !assignment.chatId) {
      await handleStartSection(assignment);
      return;
    }
    if (assignment.chatId) {
      const userMessages = await loadChatMessages(assignment.chatId);
      setActiveChat({
        chatId: assignment.chatId,
        chatType: assignment.sectionType,
        title: assignment.sectionLabel,
        assignmentId: assignment.id,
        userMessages,
        messageLimit: assignment.requiredUserMessages,
      });
      setChatComplete(assignment.status === 'completed' || userMessages >= assignment.requiredUserMessages);
    }
  };

  const handleSend = async () => {
    const chat = activeChat ?? defaultIntakeChat();
    if (!input.trim() || isBotTyping || chatComplete) return;

    const userContent = input;
    setInput('');
    setIsBotTyping(true);
    setSendError(null);

    const tempUserMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: userContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await chatService.sendMessage(
        userContent,
        chat.chatType,
        chat.chatId || currentChatId || undefined,
      );

      if (!chat.chatId) {
        setCurrentChatId(response.chatId);
        setActiveChat((prev) => ({ ...(prev ?? defaultIntakeChat()), chatId: response.chatId }));
      }

      setChatMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...filtered, ...mapMessages([response.userMessage, response.aiMessage])];
      });

      const newCount = (response as { userMessageCount?: number }).userMessageCount
        ?? chat.userMessages + 1;
      const limit = (response as { messageLimit?: number }).messageLimit ?? chat.messageLimit;

      setActiveChat((prev) => {
        const base = prev ?? defaultIntakeChat();
        return { ...base, userMessages: newCount, messageLimit: limit };
      });

      if (newCount >= limit) {
        setChatComplete(true);
        try {
          const status = await treatmentService.getStatus();
          setTreatmentStatus(status);
        } catch {
          // non-fatal
        }
      }
    } catch (error: unknown) {
      console.error('Failed to send message:', error);
      setChatMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      setInput(userContent);
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const raw = err.response?.data?.message;
      const message = Array.isArray(raw) ? raw.join(', ') : raw;
      setSendError(message || 'Failed to send message. Please try again.');
    } finally {
      setIsBotTyping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl border border-gray-100">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-gray-500 font-medium">Loading your treatment session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full min-h-0 flex-1 lg:min-h-[min(600px,calc(100dvh-12rem))]">
      {treatmentStatus && treatmentStatus.assignments.length > 0 && (
        <div className="lg:w-72 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2 max-h-none overflow-x-auto lg:overflow-y-auto lg:max-h-none flex lg:flex-col gap-2 lg:space-y-0">
          <div className="flex items-center gap-2 mb-0 lg:mb-3 shrink-0 w-full">
            <ClipboardList className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-bold text-gray-800">Your Sections</h4>
          </div>
          {treatmentStatus.assignments.map((assignment) => {
            const unlocked = isSectionUnlocked(treatmentStatus.assignments, assignment);
            const isActive = activeChat?.assignmentId === assignment.id;
            return (
              <button
                key={assignment.id}
                onClick={() => unlocked && handleSelectAssignment(assignment)}
                disabled={!unlocked || startingId === assignment.id}
                className={`w-[200px] lg:w-full shrink-0 text-left p-3 rounded-xl border text-xs transition-all ${
                  isActive
                    ? 'border-blue-300 bg-blue-50 text-blue-800'
                    : unlocked
                      ? 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                      : 'border-gray-50 bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold truncate">{assignment.sectionLabel}</span>
                  {!unlocked ? (
                    <Lock className="w-3 h-3 shrink-0" />
                  ) : assignment.status === 'completed' ? (
                    <span className="text-[10px] font-black text-emerald-600 uppercase">Done</span>
                  ) : assignment.status === 'in_progress' ? (
                    <span className="text-[10px] font-black text-blue-600 uppercase">Active</span>
                  ) : (
                    <span className="text-[10px] font-black text-amber-600 uppercase">New</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative animate-fade-in min-h-[500px]">
        <div className="bg-white p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 flex-wrap">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-blue-600" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">{activeChat?.title ?? 'Zehnify Therapist'}</h3>
              <p className="text-xs text-gray-500">
                {activeChat
                  ? `${activeChat.userMessages}/${activeChat.messageLimit} messages`
                  : 'Structured Treatment'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100 pr-3">
            <div className={`relative w-11 h-11 min-w-11 min-h-11 rounded-lg overflow-hidden bg-black ${
              moodStatus === 'scanning'
                ? 'ring-2 ring-blue-400/60'
                : moodStatus === 'cooldown'
                  ? 'ring-2 ring-amber-400/60'
                  : ''
            }`}>
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover opacity-80" />
              {!cameraGranted && (
                <button
                  type="button"
                  onClick={() => void requestCameraPermission()}
                  disabled={cameraRequesting}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-0.5 bg-black/85 text-white px-1 hover:bg-black/90 transition-colors disabled:opacity-70 min-w-11 min-h-11"
                  title={
                    cameraPermission === 'denied'
                      ? 'Re-request camera access — you may need to allow it in browser site settings first'
                      : 'Opens your browser camera permission prompt'
                  }
                >
                  {cameraRequesting ? (
                    <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 shrink-0" />
                  )}
                  <span className="text-[10px] font-bold uppercase leading-tight text-center">
                    {cameraRequesting ? 'Waiting' : 'Allow'}
                  </span>
                </button>
              )}
              <div className={`absolute inset-0 border-2 rounded-lg pointer-events-none ${
                moodStatus === 'scanning'
                  ? 'border-blue-400/70 animate-pulse'
                  : moodStatus === 'cooldown'
                    ? 'border-amber-400/70'
                    : cameraGranted
                      ? 'border-green-400/50'
                      : 'border-gray-600/50'
              }`} />
            </div>
            <div className="text-right min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:block">Scanner</p>
              <p className="text-xs font-semibold text-blue-600 truncate">{moodLabel}</p>
              {moodEnabled && (
                <p className="text-[10px] font-bold text-gray-400 mt-0.5">{scansUsed}/{scansLimit} scans</p>
              )}
              {!cameraGranted && (
                <div className="mt-1 space-y-1">
                  <button
                    type="button"
                    onClick={() => void requestCameraPermission()}
                    disabled={cameraRequesting}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase disabled:opacity-60 min-h-11 px-1 inline-flex items-center"
                  >
                    {cameraRequesting ? 'Waiting...' : 'Allow camera'}
                  </button>
                  {cameraPermission === 'denied' && !cameraRequesting && (
                    <p className="text-[9px] text-gray-400 leading-snug max-w-[140px] ml-auto hidden sm:block">
                      If no prompt appears, open site settings (lock icon in address bar) and allow camera, then click again.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {sendError && (
          <div className="mx-4 mt-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-700">
            {sendError}
          </div>
        )}

        {activeChat && !activeChat.chatId && activeChat.assignmentId && !chatComplete && (
          <div className="mx-4 mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-blue-800">Start this section to begin your session.</p>
            <button
              onClick={() => {
                const assignment = treatmentStatus?.assignments.find((a) => a.id === activeChat.assignmentId);
                if (assignment) void handleStartSection(assignment);
              }}
              disabled={!!startingId}
              className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-11 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50 shrink-0"
            >
              {startingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Start Section
            </button>
          </div>
        )}

        {chatComplete && (
          <div className="mx-4 mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
            {waitingForDoctor
              ? INTAKE_COMPLETE_BANNER
              : `This session is complete. Select another section or return to your dashboard.`}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {chatMessages.length === 0 && !isBotTyping && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40 py-10">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-600">No messages yet</p>
                <p className="text-xs text-gray-400">Your conversation with Zehnify starts here.</p>
              </div>
            </div>
          )}
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 text-sm leading-relaxed break-words ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-2xl rounded-br-none shadow-lg shadow-blue-600/20'
                  : 'bg-white text-gray-700 rounded-2xl rounded-bl-none shadow-sm border border-gray-100'
              }`}>
                <MarkdownMessage content={msg.content} variant={msg.sender} />
                {msg.timestamp && (
                  <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {msg.timestamp}
                  </p>
                )}
              </div>
            </div>
          ))}
          {isBotTyping && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-700 p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-xs font-medium text-gray-400">Zehnify is thinking...</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <input
              type="text"
              maxLength={USER_INPUT_MAX_LENGTH}
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 py-2"
              placeholder={chatComplete ? 'Session complete' : 'Type your message...'}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, USER_INPUT_MAX_LENGTH))}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isBotTyping || chatComplete || waitingForDoctor}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isBotTyping || chatComplete || waitingForDoctor}
              className={`p-2 min-w-11 min-h-11 flex items-center justify-center rounded-full transition-all ${
                input.trim() && !isBotTyping && !chatComplete && !waitingForDoctor
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-right px-2">
            {input.length}/{USER_INPUT_MAX_LENGTH}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
