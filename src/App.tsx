import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Moon, Sun, Music, Sparkles, BookOpen, X } from 'lucide-react';
import { OUTFITS, OutfitConfig, OutfitId } from './config/outfits';
import { loadAndProcessSprite, ProcessedSprite } from './utils/spriteProcessor';
import { ShayanStage, CharacterAction, SceneEffectTrigger } from './components/ShayanStage';
import { soundEngine } from './audio/soundEngine';
import { VoiceMimic, VoiceState } from './audio/voiceMimic';
import {
  ABC_LESSONS,
  BANGLA_LESSONS,
  ENGLISH_COMPANION,
  MATH_LESSONS_BN,
  MATH_LESSONS_EN,
  MATH_QUIZZES,
  LessonItem,
  MathQuizItem,
} from './data/tutorLessons';
import { speakTutorText } from './audio/tutorSpeech';
import './App.css';

const SNACK_EMOJIS = ['🍦', '🍎', '🥭', '🧃', '🍪'];

export function App() {
  const [outfitId, setOutfitId] = useState<OutfitId>('polo');
  const [sprites, setSprites] = useState<Record<string, ProcessedSprite>>({});
  const [loading, setLoading] = useState(true);

  const [voiceState, setVoiceState] = useState<VoiceState>('off');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const cutePitch = false;
  const [micLevel, setMicLevel] = useState(0);

  const [action, setAction] = useState<CharacterAction>('idle');
  const [actionTrigger, setActionTrigger] = useState(0);
  const [snackIndex, setSnackIndex] = useState(0);
  const snackEmoji = SNACK_EMOJIS[snackIndex % SNACK_EMOJIS.length];
  const [isSleeping, setIsSleeping] = useState(false);
  const [isDancing, setIsDancing] = useState(false);
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [tutorTab, setTutorTab] = useState<'bangla' | 'math' | 'abc' | 'english'>('bangla');
  const [mathLang, setMathLang] = useState<'bn' | 'en'>('bn');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'try' | null>(null);
  const [findTarget, setFindTarget] = useState<LessonItem | null>(null);
  const [findOptions, setFindOptions] = useState<LessonItem[]>([]);
  const [findMissedIds, setFindMissedIds] = useState<string[]>([]);
  const [findFeedback, setFindFeedback] = useState<'correct' | 'clue' | null>(null);
  const [findClueText, setFindClueText] = useState<string>('');
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null);
  const [isTutorSpeaking, setIsTutorSpeaking] = useState(false);
  const [sceneEffect, setSceneEffect] = useState<SceneEffectTrigger | null>(null);
  const [stars, setStars] = useState(0);

  const mouthLevelRef = useRef(0);
  const voiceMimicRef = useRef<VoiceMimic | null>(null);
  const actionTimeoutRef = useRef<number | null>(null);
  const cancelSpeechRef = useRef<(() => void) | null>(null);

  const currentOutfit: OutfitConfig =
    OUTFITS.find((o) => o.id === outfitId) || OUTFITS[0];

  // Load & process active outfit immediately for instant startup, then cache others on demand
  useEffect(() => {
    if (sprites[outfitId]) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const processed = await loadAndProcessSprite(currentOutfit);
        if (!cancelled) {
          setSprites((prev) => ({ ...prev, [outfitId]: processed }));
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to process outfit', outfitId, err);
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [outfitId, currentOutfit, sprites]);

  // Initialize VoiceMimic
  useEffect(() => {
    const mimic = new VoiceMimic({
      onStateChange: (next, err) => {
        setVoiceState(next);
        setVoiceError(err || null);
      },
      onMouthLevel: (lvl) => {
        mouthLevelRef.current = lvl;
      },
      onMicLevel: (lvl) => {
        setMicLevel(lvl);
      },
    });
    voiceMimicRef.current = mimic;

    return () => {
      mimic.stop();
      cancelSpeechRef.current?.();
      soundEngine.stopDanceMusic();
    };
  }, []);

  useEffect(() => {
    voiceMimicRef.current?.setPitchRate(cutePitch ? 1.36 : 1.0);
  }, [cutePitch]);

  const triggerTemporaryAction = useCallback(
    (next: CharacterAction, durationMs = 1100) => {
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
      }
      setIsSleeping(false);
      setIsDancing(false);
      soundEngine.stopDanceMusic();

      setAction(next);
      setActionTrigger((n) => n + 1);

      actionTimeoutRef.current = window.setTimeout(() => {
        setAction('idle');
      }, durationMs);
    },
    []
  );

  const handleToggleMic = async () => {
    soundEngine.playPop(580);
    if (voiceState === 'off' || voiceState === 'error') {
      setIsSleeping(false);
      await voiceMimicRef.current?.start();
    } else {
      voiceMimicRef.current?.stop();
    }
  };

  const handleHitZone = (zone: 'head' | 'cheek' | 'belly' | 'feet') => {
    if (isSleeping) {
      setIsSleeping(false);
      setAction('idle');
      soundEngine.playSparkle();
      return;
    }

    if (zone === 'head') {
      soundEngine.playGiggle();
      triggerTemporaryAction('giggle', 950);
    } else if (zone === 'cheek') {
      soundEngine.playSurprised();
      triggerTemporaryAction('surprised', 850);
    } else if (zone === 'belly') {
      soundEngine.playGiggle();
      triggerTemporaryAction('tickle', 1200);
    } else {
      soundEngine.playBoing();
      triggerTemporaryAction('hop', 700);
    }
  };

  const handleFeed = () => {
    const nextIdx = (snackIndex + 1) % SNACK_EMOJIS.length;
    setSnackIndex(nextIdx);
    soundEngine.playChomp();
    triggerTemporaryAction('eat', 1150);
  };

  const handleToggleDance = () => {
    if (isDancing) {
      setIsDancing(false);
      setAction('idle');
      soundEngine.stopDanceMusic();
    } else {
      setIsSleeping(false);
      setIsDancing(true);
      setAction('dance');
      setActionTrigger((n) => n + 1);
      soundEngine.startDanceMusic();
    }
  };

  const handleToggleSleep = () => {
    soundEngine.playPop(340);
    if (isSleeping) {
      setIsSleeping(false);
      setAction('idle');
      soundEngine.playSparkle();
    } else {
      setIsDancing(false);
      soundEngine.stopDanceMusic();
      setIsSleeping(true);
      setAction('sleep');
      soundEngine.playSnore();
    }
  };

  const handleSelectOutfit = (id: OutfitId) => {
    soundEngine.playSparkle();
    setOutfitId(id);
    setShowWardrobe(false);
  };

  const speakText = useCallback(
    (text: string, lang: 'en-US' | 'bn-BD') => {
      cancelSpeechRef.current?.();
      cancelSpeechRef.current = speakTutorText(
        text,
        lang,
        cutePitch,
        (lvl) => {
          mouthLevelRef.current = lvl;
        },
        () => setIsTutorSpeaking(true),
        () => setIsTutorSpeaking(false)
      );
    },
    [cutePitch]
  );

  const handlePlayLesson = (item: LessonItem) => {
    setIsSleeping(false);
    setIsDancing(false);
    soundEngine.stopDanceMusic();
    soundEngine.playPop(640);
    setActiveLesson(item);
    setSceneEffect((prev) => ({
      type: item.effectType,
      emoji: item.effectEmoji || item.emoji,
      trigger: (prev?.trigger || 0) + 1,
    }));
    speakText(item.speechText, item.lang);
  };

  const handleStartFindGame = () => {
    const pool = tutorItems.length >= 4 ? tutorItems : BANGLA_LESSONS;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const target = shuffled[0];
    const distractors = shuffled.slice(1, 4);
    const fourOptions = [target, ...distractors].sort(() => Math.random() - 0.5);

    setFindTarget(target);
    setFindOptions(fourOptions);
    setFindMissedIds([]);
    setFindFeedback(null);
    setFindClueText('');
    soundEngine.playPop(680);
    speakText(
      target.lang === 'bn-BD'
        ? `বলো তো, কোনটি ${target.title}?`
        : `Which one is ${target.title}?`,
      target.lang
    );
  };

  const handleAnswerFind = (item: LessonItem) => {
    if (!findTarget) return;
    if (item.id === findTarget.id) {
      setFindFeedback('correct');
      setFindClueText(
        findTarget.lang === 'bn-BD'
          ? `দারুণ! তুমি পেরেছো! ${findTarget.speechText}`
          : `Awesome! You did it! ${findTarget.speechText}`
      );
      setStars((s) => s + 2);
      soundEngine.playSparkle();
      triggerTemporaryAction('giggle', 1000);
      setActiveLesson(findTarget);
      setSceneEffect((prev) => ({
        type: findTarget.effectType,
        emoji: findTarget.effectEmoji || findTarget.emoji,
        trigger: (prev?.trigger || 0) + 1,
      }));
      speakText(
        findTarget.lang === 'bn-BD'
          ? `দারুণ বন্ধু! তুমি পেরেছো! ${findTarget.speechText}`
          : `Awesome friend! You did it! ${findTarget.speechText}`,
        findTarget.lang
      );
      window.setTimeout(() => {
        handleStartFindGame();
      }, 2600);
    } else {
      // Positive encouragement + gentle clue (zero negative words!)
      setFindFeedback('clue');
      setFindMissedIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
      const clueBn = `দারুণ চেষ্টা! ওটা তো ${item.title}! ছোট্ট একটা ক্লু দিই: ${findTarget.speechText}`;
      const clueEn = `Great try! That one is ${item.title}. Here is a clue: ${findTarget.speechText}`;
      setFindClueText(findTarget.lang === 'bn-BD' ? clueBn : clueEn);
      soundEngine.playPop(520);
      speakText(findTarget.lang === 'bn-BD' ? clueBn : clueEn, findTarget.lang);
    }
  };

  const currentQuiz: MathQuizItem = MATH_QUIZZES[quizIndex % MATH_QUIZZES.length];

  const handleAskQuiz = (q: MathQuizItem = currentQuiz, lang: 'bn' | 'en' = mathLang) => {
    setQuizFeedback(null);
    soundEngine.playPop(600);
    speakText(lang === 'bn' ? q.questionBn : q.questionEn, lang === 'bn' ? 'bn-BD' : 'en-US');
  };

  const handleAnswerQuiz = (val: number) => {
    if (val === currentQuiz.answer) {
      setQuizFeedback('correct');
      soundEngine.playSparkle();
      triggerTemporaryAction('giggle', 1000);
      speakText(
        mathLang === 'bn' ? currentQuiz.praiseBn : currentQuiz.praiseEn,
        mathLang === 'bn' ? 'bn-BD' : 'en-US'
      );
      window.setTimeout(() => {
        setQuizFeedback(null);
        setQuizIndex((i) => (i + 1) % MATH_QUIZZES.length);
      }, 2200);
    } else {
      setQuizFeedback('try');
      soundEngine.playBoing();
      speakText(
        mathLang === 'bn' ? 'আবার চেষ্টা করো বন্ধু!' : 'Try again friend!',
        mathLang === 'bn' ? 'bn-BD' : 'en-US'
      );
    }
  };

  const starBadge = stars >= 25 ? '👑' : stars >= 10 ? '🏆' : stars >= 5 ? '🥉' : '⭐';

  const tutorItems =
    tutorTab === 'abc'
      ? ABC_LESSONS
      : tutorTab === 'bangla'
        ? BANGLA_LESSONS
        : tutorTab === 'math'
          ? mathLang === 'bn'
            ? MATH_LESSONS_BN
            : MATH_LESSONS_EN
          : ENGLISH_COMPANION;

  const statusText = (() => {
    if (isSleeping) return '😴 Sleeping... Tap Shayan to wake up!';
    if (isDancing) return '💃 Dance Party!';
    if (isTutorSpeaking && activeLesson) return `📚 ${activeLesson.title}`;
    if (voiceState === 'listening') return '👂 Shayan is listening...';
    if (voiceState === 'speaking') return '🗣️ Shayan is talking!';
    if (voiceState === 'ready') return '🎤 Talk to Shayan! (or tap 📚 Learn)';
    if (voiceState === 'error') return `⚠️ Mic unavailable: ${voiceError}`;
    return '👋 Tap Shayan, Mic, or 📚 Learn!';
  })();

  return (
    <div className={`game-shell ${showTutor ? 'tutor-open' : ''}`}>
      <div className="stage-area">
        {/* Main Interactive Canvas */}
        <ShayanStage
          outfit={currentOutfit}
          sprite={sprites[outfitId] || null}
          voiceState={voiceState}
          mouthLevelRef={mouthLevelRef}
          action={action}
          actionTrigger={actionTrigger}
          snackEmoji={snackEmoji}
          isSleeping={isSleeping}
          compact={showTutor}
          sceneEffect={sceneEffect}
          onCatchProp={() => {
            soundEngine.playSparkle();
            setStars((s) => s + 1);
          }}
          onHitZone={handleHitZone}
        />

        {loading && (
          <div className="loading-overlay">
            <div className="loading-card">
              <Sparkles size={32} className="spin-icon" />
              <p>Getting Shayan ready...</p>
            </div>
          </div>
        )}

        {/* Top HUD */}
        <header className="top-hud">
          <div className="title-pill">
            <span className="title-badge">Talking Shayan</span>
            <span className="status-text">{statusText}</span>
          </div>

          <div className="top-actions">
            {stars > 0 && (
              <div className="stars-pill" title="Stars earned!">
                {starBadge} {stars}
              </div>
            )}
            <button
              className={`hud-icon-btn ${isSleeping ? 'night' : 'day'}`}
              onClick={handleToggleSleep}
              title={isSleeping ? 'Wake Up' : 'Sleep Mode'}
              aria-label="Toggle Sleep Mode"
            >
              {isSleeping ? <Sun size={22} /> : <Moon size={22} />}
            </button>
          </div>
        </header>

        {/* Active Bilingual Lesson Flashcard (Top-Left Board) */}
        {activeLesson && (
          <div
            className="lesson-flashcard"
            onClick={() => handlePlayLesson(activeLesson)}
            title="Tap to hear Shayan say it again!"
          >
            <span className="flashcard-emoji">{activeLesson.emoji}</span>
            <div className="flashcard-text">
              <div className="flashcard-top-row">
                <span className="flashcard-symbol">{activeLesson.symbol}</span>
                {activeLesson.sign && (
                  <span className="flashcard-sign">{activeLesson.sign}</span>
                )}
              </div>
              <span className="flashcard-title">{activeLesson.title}</span>
              <span className="flashcard-translation">{activeLesson.translation}</span>
            </div>
            <button
              className="flashcard-close"
              onClick={(e) => {
                e.stopPropagation();
                setActiveLesson(null);
              }}
              aria-label="Close flashcard"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Wardrobe Drawer */}
        {showWardrobe && (
          <div className="wardrobe-bar">
            {OUTFITS.map((o) => (
              <button
                key={o.id}
                className={`outfit-chip ${o.id === outfitId ? 'selected' : ''}`}
                onClick={() => handleSelectOutfit(o.id)}
              >
                <span className="outfit-emoji">{o.emoji}</span>
                <span>{o.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Bottom Toy Dock (5 big kid-friendly buttons) */}
        <footer className="bottom-dock">
          <div className="dock-group">
            <button
              className="toy-btn snack-btn"
              onClick={handleFeed}
              title="Feed Shayan a Yummy Snack!"
            >
              <span>{snackEmoji}</span>
            </button>

            <button
              className={`toy-btn dance-btn ${isDancing ? 'active' : ''}`}
              onClick={handleToggleDance}
              title="Dance Party"
            >
              <Music size={24} />
            </button>
          </div>

          {/* Central Big Mic Button */}
          <button
            className={`mic-btn ${voiceState}`}
            onClick={handleToggleMic}
            style={{
              boxShadow:
                voiceState === 'ready' || voiceState === 'listening'
                  ? `0 0 0 ${6 + micLevel * 18}px rgba(34, 197, 94, 0.35), 0 8px 20px rgba(0,0,0,0.3)`
                  : undefined,
            }}
            title={voiceState === 'off' ? 'Talk to Shayan!' : 'Stop Mic'}
          >
            {voiceState === 'off' || voiceState === 'error' ? (
              <MicOff size={30} />
            ) : (
              <Mic size={30} />
            )}
          </button>

          <div className="dock-group">
            <button
              className={`toy-btn tutor-btn ${showTutor ? 'active' : ''}`}
              onClick={() => {
                soundEngine.playPop();
                setShowWardrobe(false);
                setShowTutor((t) => !t);
              }}
              title="Learn Bangla, ABC & Math"
            >
              <BookOpen size={24} />
            </button>

            <button
              className={`toy-btn wardrobe-btn ${showWardrobe ? 'active' : ''}`}
              onClick={() => {
                soundEngine.playPop();
                setShowTutor(false);
                setShowWardrobe((w) => !w);
              }}
              title="More Characters, Dresses & Hairstyles"
              aria-label="More Characters, Dresses & Hairstyles"
            >
              <span>{currentOutfit.emoji}</span>
            </button>
          </div>
        </footer>
      </div>

      {/* Split-Screen Docked Tutor & Language Practice Keyboard (never covers Shayan or floor!) */}
      {showTutor && (
        <div className="tutor-drawer">
          <div className="tutor-header">
            <div className="tutor-tabs">
              <button
                className={`tutor-tab ${tutorTab === 'bangla' ? 'active' : ''}`}
                onClick={() => {
                  soundEngine.playPop();
                  setFindTarget(null);
                  setTutorTab('bangla');
                }}
              >
                🇧🇩 বাংলা
              </button>
              <button
                className={`tutor-tab ${tutorTab === 'math' ? 'active' : ''}`}
                onClick={() => {
                  soundEngine.playPop();
                  setFindTarget(null);
                  setTutorTab('math');
                }}
              >
                🔢 ১ ২ ৩
              </button>
              <button
                className={`tutor-tab ${tutorTab === 'abc' ? 'active' : ''}`}
                onClick={() => {
                  soundEngine.playPop();
                  setFindTarget(null);
                  setTutorTab('abc');
                }}
              >
                🔤 ABC
              </button>
              <button
                className={`tutor-tab ${tutorTab === 'english' ? 'active' : ''}`}
                onClick={() => {
                  soundEngine.playPop();
                  setFindTarget(null);
                  setTutorTab('english');
                }}
              >
                🎨 রঙ/মজা
              </button>
              <button
                className={`tutor-tab find-tab ${findTarget ? 'active' : ''}`}
                onClick={handleStartFindGame}
                title="Find & Tap!"
              >
                🎯 খেলা
              </button>
            </div>
            <button
              className="tutor-close"
              onClick={() => setShowTutor(false)}
              aria-label="Close Learn Panel"
            >
              <X size={18} />
            </button>
          </div>

          {findTarget ? (
            <div className="find-quiz-box">
              <div className={`find-banner ${findFeedback || ''}`}>
                <span>
                  🎯{' '}
                  {findTarget.lang === 'bn-BD'
                    ? `বলো তো, কোনটি "${findTarget.title}"?`
                    : `Which one is "${findTarget.title}"?`}
                </span>
                <button
                  className="find-cancel"
                  onClick={() => {
                    setFindTarget(null);
                    setFindFeedback(null);
                  }}
                >
                  ✕
                </button>
              </div>

              {findClueText && (
                <div className={`find-clue-msg ${findFeedback || ''}`}>
                  {findFeedback === 'correct' ? '🌟 ' : '💡 '}
                  {findClueText}
                </div>
              )}

              <div className="find-four-grid">
                {findOptions.map((opt) => {
                  const isMissed = findMissedIds.includes(opt.id);
                  const isWon = findFeedback === 'correct' && opt.id === findTarget.id;
                  return (
                    <button
                      key={opt.id}
                      className={`find-option-card ${isWon ? 'won' : ''} ${
                        isMissed ? 'missed-soft' : ''
                      }`}
                      onClick={() => handleAnswerFind(opt)}
                    >
                      <span className="find-opt-emoji">{opt.emoji}</span>
                      <span className="find-opt-symbol">{opt.symbol}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {tutorTab === 'math' && (
                <div className="math-panel-bar">
                  <div className="math-lang-switch">
                    <button
                      className={`lang-pill ${mathLang === 'bn' ? 'active' : ''}`}
                      onClick={() => {
                        soundEngine.playPop();
                        setMathLang('bn');
                      }}
                    >
                      🇧🇩 বাংলায়
                    </button>
                    <button
                      className={`lang-pill ${mathLang === 'en' ? 'active' : ''}`}
                      onClick={() => {
                        soundEngine.playPop();
                        setMathLang('en');
                      }}
                    >
                      🇬🇧 English
                    </button>
                  </div>

                  <div className="math-quiz-card">
                    <div className="quiz-top">
                      <span className="quiz-visual">{currentQuiz.visual}</span>
                      <button
                        className="quiz-ask-btn"
                        onClick={() => handleAskQuiz()}
                      >
                        🔊 {mathLang === 'bn' ? 'শুনো' : 'Ask'}
                      </button>
                    </div>
                    <div className="quiz-options">
                      {currentQuiz.options.map((opt) => (
                        <button
                          key={opt.value}
                          className={`quiz-opt-btn ${
                            quizFeedback === 'correct' && opt.value === currentQuiz.answer
                              ? 'correct'
                              : ''
                          }`}
                          onClick={() => handleAnswerQuiz(opt.value)}
                        >
                          {mathLang === 'bn' ? opt.labelBn : opt.labelEn}
                        </button>
                      ))}
                    </div>
                    {quizFeedback === 'correct' && (
                      <div className="quiz-msg ok">
                        🎉 {mathLang === 'bn' ? 'দারুণ! একদম ঠিক!' : 'Awesome! Correct!'}
                      </div>
                    )}
                    {quizFeedback === 'try' && (
                      <div className="quiz-msg ok">
                        💡 {mathLang === 'bn' ? 'দারুণ চেষ্টা! আরেকটু ভাবো তো!' : 'Great try! Look closely!'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="tutor-grid">
                {tutorItems.map((item) => (
                  <button
                    key={item.id}
                    className={`lesson-tile ${activeLesson?.id === item.id ? 'active' : ''}`}
                    onClick={() => handlePlayLesson(item)}
                  >
                    {item.sign && <span className="tile-sign-badge">{item.sign}</span>}
                    <span className="tile-emoji">{item.emoji}</span>
                    <span className="tile-symbol">{item.symbol}</span>
                    <span className="tile-title">{item.title}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
