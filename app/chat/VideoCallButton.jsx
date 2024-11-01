'use client';
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { db } from '@/firebaseConfig'; // Adjust import path to your Firebase config
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { Video, Loader2, X, Minimize2 } from "lucide-react";
import { StreamVideoClient, CallingState, useCall, useCallStateHooks, StreamCall, StreamVideo, StreamTheme, ParticipantView, SpeakerLayout, CallControls } from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';

const apiKey = process.env.NEXT_PUBLIC_GET_STREAM_API;

// Generate a random call ID
const generateCallId = () => {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
};

const VideoCallButton = ({ roomId }) => {
    const [client, setClient] = useState(null);
    const [call, setCall] = useState(null);
    const [isCallInitialized, setIsCallInitialized] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({});

    useEffect(() => {
        const userId = localStorage.getItem('chatUserId');
        const userName = localStorage.getItem('chatUsername');
        const userImage = localStorage.getItem('chatUserImage');

        if (userId && userName && userImage) {
            setUser({
                id: userId,
                name: userName,
                image: userImage,
            });
        }
    }, []);

    const initializeCall = async () => {
        try {
            setLoading(true);
            const userId = localStorage.getItem('chatUserId');
            const response = await fetch('/api/tokenGenerator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                console.error('Failed to fetch token:', response.statusText);
                return;
            }

            const data = await response.json();
            const token = data.token;
            // Check if call ID already exists in Firestore
            const chatroomRef = doc(db, 'chatRooms', roomId);
            const chatroomSnap = await getDoc(chatroomRef);

            let callId;
            if (chatroomSnap.exists() && chatroomSnap.data().callId) {
                // Use existing call ID
                callId = chatroomSnap.data().callId;
            } else {
                // Generate and store new call ID
                callId = generateCallId();
                await setDoc(chatroomRef, { callId }, { merge: true });
            }

            const videoClient = new StreamVideoClient({ apiKey, user, token });
            const callInstance = videoClient.call('default', callId);
            await callInstance.join({ create: true });

            setClient(videoClient);
            setCall(callInstance);
            setIsCallInitialized(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading ? (
                <div className="loader"><Loader2 className='animate-spin mt-2' /></div>
            ) : (
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-md border"
                    onClick={initializeCall}
                    disabled={isCallInitialized}
                >
                    <Video className="h-4 w-4" />
                </Button>
            )}

            {isCallInitialized && (
                <StreamVideo client={client}>
                    <StreamCall call={call}>
                        <MyFullscreenUILayout setIsCallInitialized={setIsCallInitialized} />
                    </StreamCall>
                </StreamVideo>
            )}
        </>
    );
};

const MyFullscreenUILayout = ({ setIsCallInitialized }) => {
    const call = useCall();
    const { useCallCallingState, useParticipantCount, useLocalParticipant, useRemoteParticipants } = useCallStateHooks();
    const callingState = useCallCallingState();
    const participantCount = useParticipantCount();
    const localParticipant = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();
    const [isMinimized, setIsMinimized] = useState(false);

    // Enable the button again when the call is left
    useEffect(() => {
        if (callingState === CallingState.LEFT) {
            setIsCallInitialized(false);
        }
    }, [callingState]);

    const handleEndCall = async () => {
        try {
            await call.leave();
            setIsCallInitialized(false);
        } catch (error) {
            console.error('Error leaving call:', error);
        }
    };

    return (
        <StreamTheme>
            {callingState === CallingState.JOINED && (
                <div
                    className={`fixed inset-0 z-50 bg-black/90 flex flex-col ${isMinimized ? 'p-4' : 'p-0'}`}
                    style={{
                        transition: 'all 0.3s ease',
                        ...(isMinimized && {
                            position: 'fixed',
                            bottom: '20px',
                            right: '20px',
                            width: '320px',
                            height: '180px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        })
                    }}
                >
                    {/* Fullscreen Controls */}
                    <div className="absolute top-4 right-4 z-50 flex space-x-2">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="bg-white/10 hover:bg-white/20 p-2 rounded-full"
                        >
                            {isMinimized ? <Video className="text-white" /> : <Minimize2 className="text-white" />}
                        </button>
                        <button
                            onClick={handleEndCall}
                            className="bg-red-500/80 hover:bg-red-600/80 p-2 rounded-full"
                        >
                            <X className="text-white" />
                        </button>
                    </div>

                    {/* Main Video Layout */}
                    <div className={`flex-grow flex items-center justify-center ${isMinimized ? 'hidden' : ''}`}>
                        <SpeakerLayout participantsBarPosition='bottom' />
                    </div>

                    {/* Minimized View */}
                    {isMinimized && (
                        <div className="w-full h-full">
                            <ParticipantView participant={localParticipant} />
                        </div>
                    )}

                    {/* Floating Local Participant */}
                    {!isMinimized && (
                        <div
                            className="absolute bottom-4 left-4 w-60 h-36 rounded-xl shadow-lg overflow-hidden"
                        >
                            {localParticipant && <ParticipantView participant={localParticipant} />}
                        </div>
                    )}

                    {/* Remote Participants in Minimized Thumbnails */}
                    {!isMinimized && (
                        <div className="absolute bottom-4 right-4 flex space-x-2">
                            {remoteParticipants.map((participant) => (
                                <div
                                    key={participant.sessionId}
                                    className="w-24 h-16 rounded-lg overflow-hidden"
                                >
                                    <ParticipantView participant={participant} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Call Controls */}
                    {!isMinimized && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                            <CallControls />
                        </div>
                    )}
                </div>
            )}
        </StreamTheme>
    );
};

export default VideoCallButton;