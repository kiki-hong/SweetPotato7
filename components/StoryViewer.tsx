'use client';

import { useState } from 'react';
import { Scene, StoryData } from '@/lib/story-loader';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, RotateCcw, X, Volume2, Square, Play } from 'lucide-react';
import { useEffect, useCallback } from 'react';

interface StoryViewerProps {
    data: StoryData;
}

export default function StoryViewer({ data }: StoryViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPromptOpen, setIsPromptOpen] = useState(false);
    const [showKoreanPrompt, setShowKoreanPrompt] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAutoPlay, setIsAutoPlay] = useState(false);
    const currentScene = data.scenes[currentIndex];
    // Calculate progress percentage
    const progress = ((currentIndex + 1) / data.scenes.length) * 100;

    const nextScene = () => {
        setIsAutoPlay(false); // Stop auto-play on manual navigation
        if (currentIndex < data.scenes.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const prevScene = () => {
        setIsAutoPlay(false); // Stop auto-play on manual navigation
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    // Dedicated function to speak text
    const speakText = useCallback((text: string, onComplete?: () => void) => {
        window.speechSynthesis.cancel();

        const segments = text.split(/(".*?")/g).filter(s => s.trim().length > 0);
        if (segments.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        setIsPlaying(true);
        const voices = window.speechSynthesis.getVoices();
        const koVoice = voices.find(v => v.lang.includes('ko')) || null;

        segments.forEach((segment, index) => {
            // Sanitize text for speech:
            // 1. Remove dash, square brackets, parentheses
            let cleanSegment = segment.replace(/[-[\]()]/g, ' ');

            // 2. Fix pronunciation for Volume numbers (1권 -> 일권, not 한권)
            cleanSegment = cleanSegment
                .replace(/1권/g, '일권')
                .replace(/2권/g, '이권')
                .replace(/3권/g, '삼권')
                .replace(/4권/g, '사권')
                .replace(/5권/g, '오권')
                .replace(/6권/g, '육권')
                .replace(/7권/g, '칠권')
                .replace(/8권/g, '팔권')
                .replace(/9권/g, '구권')
                .replace(/10권/g, '십권');

            const utterance = new SpeechSynthesisUtterance(cleanSegment);
            utterance.lang = 'ko-KR';
            utterance.voice = koVoice;

            const isDialogue = segment.trim().startsWith('"') && segment.trim().endsWith('"');
            if (isDialogue) {
                utterance.pitch = 1.2;
                utterance.rate = 1.0;
            } else {
                utterance.pitch = 1.0;
                utterance.rate = 0.9;
            }

            if (index === segments.length - 1) {
                utterance.onend = () => {
                    setIsPlaying(false);
                    if (onComplete) onComplete();
                };
                utterance.onerror = () => {
                    setIsPlaying(false);
                    if (onComplete) onComplete();
                };
            }
            window.speechSynthesis.speak(utterance);
        });
    }, []);

    // Effect for Auto-Play sequence
    useEffect(() => {
        if (isAutoPlay) {
            const textToRead = currentScene.text;
            if (textToRead) {
                const timer = setTimeout(() => {
                    speakText(textToRead, () => {
                        if (currentIndex < data.scenes.length - 1) {
                            setCurrentIndex(prev => prev + 1);
                        } else {
                            setIsAutoPlay(false);
                        }
                    });
                }, 800);
                return () => clearTimeout(timer);
            } else {
                const timer = setTimeout(() => {
                    if (currentIndex < data.scenes.length - 1) {
                        setCurrentIndex(prev => prev + 1);
                    } else {
                        setIsAutoPlay(false);
                    }
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [currentIndex, isAutoPlay, speakText, currentScene.text, data.scenes.length]);

    // Cleanup effect
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        };
    }, []);

    const handleSpeak = () => {
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            setIsAutoPlay(false);
        } else {
            setIsAutoPlay(false);
            speakText(currentScene.text || "");
        }
    };

    return (
        <div className="min-h-screen bg-[#fdf6e3] flex flex-col items-center py-8 px-4 font-sans text-gray-800">
            {/* Header */}
            <header className="w-full max-w-4xl flex justify-between items-center mb-8">
                <h1 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                    <BookOpen className="w-6 h-6" />
                    {(() => {
                        const match = data.title.match(/^(.*?)(\s\d+권)$/);
                        if (match) {
                            return (
                                <span>
                                    {match[1]}
                                    <span className="ml-4 text-base font-medium text-amber-900/60">{match[2]}</span>
                                </span>
                            );
                        }
                        return data.title;
                    })()}
                </h1>
                <div className="text-sm font-medium text-amber-800/60">
                    Page {currentIndex + 1} / {data.scenes.length}
                </div>
            </header>

            {/* Progress Bar */}
            <div className="w-full max-w-4xl h-2 bg-amber-100 rounded-full mb-8 overflow-hidden">
                <motion.div
                    className="h-full bg-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Main Content Area: Book Layout */}
            <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-stretch justify-center min-h-[600px]">

                {/* Left Page: Image Placeholder / Description */}
                <div className="flex-1 relative flex flex-col">
                    <div className="flex-1 bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-center items-center relative overflow-hidden group w-full">
                        <div className="absolute inset-0 bg-amber-50/30 pattern-grid-lg opacity-20 user-select-none pointer-events-none" />

                        <div className="z-10 text-center max-w-md w-full h-full flex flex-col items-center justify-center">
                            {/* Image area */}
                            <div className="w-full h-full flex items-center justify-center p-4">
                                {currentScene.imagePath ? (
                                    <img
                                        src={currentScene.imagePath}
                                        alt={currentScene.title}
                                        className="max-w-full max-h-[80%] object-contain rounded-lg shadow-sm"
                                    />
                                ) : (
                                    <div className="p-6 bg-amber-50 rounded-xl border-2 border-dashed border-amber-200 text-amber-800/80 italic text-sm leading-relaxed max-w-sm">
                                        {currentScene.imageDescription || "이미지 설명이 없는 페이지입니다."}
                                    </div>
                                )}
                            </div>

                            {/* Hidden by default details */}
                            <div className="absolute bottom-4 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {currentScene.imageDescription && !currentScene.imagePath && (
                                    <span className="text-xs text-amber-800/40 block mb-1">
                                        (이미지 설명 있음)
                                    </span>
                                )}

                                {currentScene.prompt && (
                                    <>
                                        <button
                                            onClick={() => setIsPromptOpen(true)}
                                            className="mt-4 text-xs text-gray-400 hover:text-amber-600 transition-colors bg-white/80 px-2 py-1 rounded shadow-sm border border-amber-100"
                                        >
                                            AI Prompt 보기
                                        </button>

                                        {isPromptOpen && (
                                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsPromptOpen(false)}>
                                                <div
                                                    className="bg-white rounded-lg border border-gray-100 shadow-xl max-w-lg w-full relative overflow-hidden"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                                                        <h3 className="font-medium text-gray-700 text-sm">AI Image Prompt</h3>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setShowKoreanPrompt(!showKoreanPrompt)}
                                                                className="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
                                                            >
                                                                {showKoreanPrompt ? "English" : "한국어"}
                                                            </button>
                                                            <button
                                                                onClick={() => setIsPromptOpen(false)}
                                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                            >
                                                                <X className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                                                        <p className="font-mono text-sm text-left text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                            {showKoreanPrompt ? (currentScene.imageDescription || "설명이 없습니다.") : currentScene.prompt}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Page: Text */}
                <div className="flex-1 relative flex flex-col">
                    {/* Read All Button - Visible on Cover Page */}
                    {(currentScene.title.includes('표지') || currentIndex === 0) && !isAutoPlay && (
                        <div className="absolute -top-12 right-0 z-10">
                            <button
                                onClick={() => setIsAutoPlay(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg transition-all transform hover:scale-105"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                <span className="font-bold">전체 읽어주기</span>
                            </button>
                        </div>
                    )}


                    <div className="flex-1 bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-amber-50 flex flex-col justify-center relative w-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="prose prose-amber prose-2xl max-w-none text-gray-700 leading-snug whitespace-pre-line font-medium"
                            >
                                <div className="flex justify-between items-start mb-6 border-b-2 border-amber-100 pb-2">
                                    <h2 className={`font-bold text-amber-900 ${currentScene.title.trim() === '표지' ? 'text-4xl' : 'text-2xl'}`}>
                                        {(() => {
                                            if (currentScene.title.includes('뒷표지')) return ""; // Back Cover: No Title
                                            if (currentScene.title.trim() === '표지') return currentScene.text.split('\n')[0]; // Front Cover: Text Line 1
                                            return currentScene.title; // Normal: Scene Title
                                        })()}
                                    </h2>
                                    {currentScene.text && (
                                        <button
                                            onClick={handleSpeak}
                                            className="p-2 rounded-full hover:bg-amber-50 text-amber-600 transition-colors"
                                            title={isPlaying ? "읽기 중단" : "읽어주기"}
                                        >
                                            {isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Volume2 className="w-6 h-6" />}
                                        </button>
                                    )}
                                </div>
                                <div>
                                    {(() => {
                                        if (!currentScene.text) {
                                            return (
                                                <span className="text-gray-400 italic">
                                                    (이 페이지에는 텍스트가 없습니다.)
                                                </span>
                                            );
                                        }
                                        // Back Cover: Full Text
                                        if (currentScene.title.includes('뒷표지')) return currentScene.text;
                                        // Front Cover: Rest of Text
                                        if (currentScene.title.trim() === '표지') return currentScene.text.split('\n').slice(1).join('\n').trim();
                                        // Normal: Full Text
                                        return currentScene.text;
                                    })()}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-6 mt-12">
                <button
                    onClick={prevScene}
                    disabled={currentIndex === 0}
                    className="p-4 rounded-full bg-white shadow-md text-amber-900 hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 border border-amber-100"
                    aria-label="Previous Page"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>

                {/* Go to Beginning Button - Only visible after first page */}
                {currentIndex > 0 ? (
                    <button
                        onClick={() => setCurrentIndex(0)}
                        className="flex flex-col items-center gap-1 text-amber-900/50 hover:text-amber-700 transition-colors group"
                        title="처음으로"
                    >
                        <div className="p-2 rounded-full bg-amber-50 group-hover:bg-amber-100 transition-colors">
                            <RotateCcw className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium">처음으로</span>
                    </button>
                ) : (
                    <span className="text-amber-900/50 font-medium text-sm">
                        이동
                    </span>
                )}

                <button
                    onClick={nextScene}
                    disabled={currentIndex === data.scenes.length - 1}
                    className="p-4 rounded-full bg-amber-600 shadow-lg shadow-amber-600/20 text-white hover:bg-amber-700 disabled:opacity-50 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-95"
                    aria-label="Next Page"
                >
                    <ChevronRight className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
}
