"use client";

import Link from "next/link";
import { memo, Suspense, startTransition, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Box3, MathUtils, Vector3, type Group } from "three";
import { STORY_SCENES } from "@/features/storytelling/data/scenes";
import { fetchJsonWithCache } from "@/lib/client-api-cache";
import styles from "./CinematicStorytelling.module.css";

gsap.registerPlugin(ScrollTrigger);

const SCENE_SCROLL_LENGTH_MULTIPLIER = 2;
const SCENE_SCROLL_WEIGHTS = [4.7, 2.2, 2.2, 1];
const SCENE_TEXT_TRAVEL_DURATION = 1;
const SCENE_TEXT_EDGE_PADDING = 36;
const SCENE_TEXT_UNDER_MEDIA_SHIFT_Y = 150;
const SCENE_CUP_HOLD_DURATION = 0.75;
const SCENE_SWAP_MEDIA_HOLD_DURATION = 0.45;
const SCENE_TEXT_EDGE_EXIT_LEAD = 0.12;
const SCENE_PARALLAX_START_SCALE = 1.06;
const SCENE_PARALLAX_END_SCALE = 1;
const SCENE_PARALLAX_START_Y = 1.5;
const SCENE_PARALLAX_END_Y = -1.5;
const SCENE_PARALLAX_SCRUB = 0.55;
const SCENE_DEFAULT_TRANSITION_DURATION = 0.82;
const SCENE_DEFAULT_TRANSITION_OVERLAP = 0.12;
const SCENE_TWO_TO_THREE_TRANSITION_DURATION = 0.92;
const SCENE_TWO_TO_THREE_TRANSITION_OVERLAP = 0.16;
const SCENE_STACK_SHIFT_PERCENT = 3.4;
const SCENE_STACK_SCALE_STEP = 0.045;
const SCENE_STACK_OPACITY_STEP = 0.18;
const SCENE_STACK_DIM_STEP = 0.18;
const PROGRESS_STATE_EPSILON = 0.002;
const PROGRESS_STATE_PRECISION = 1000;
const STORY_BUTTON_SCROLL_DURATION_MS = 780;
const SCENE_THREE_POEM_LINES = [
  "Тихий аквариум.",
  "Медленно движется вода.",
  "Пузырьки поднимаются со дна.",
  "Свет дрожит на стекле.",
  "И среди этого плавает рыбка.",
  "Рыбку зовут Толик.",
  "Он никуда не спешит.",
  "Иногда он делает круг.",
  "Иногда просто замирает.",
  "И смотрит по ту сторону стекла.",
  "Туда где экран.",
  "Где камера.",
  "Где начинается стрим.",
  "И тогда становится ясно",
  "Толик это не просто рыба.",
  "Это характер по ту сторону воды.",
  "Это отражение,",
  "тень,",
  "часть мира...",
  "Это...",
  "История",
];
const SCENE_THREE_ADAPTIVE_LINES = new Set([
  "И смотрит по ту сторону стекла.",
  "Это характер по ту сторону воды.",
  "Пузырьки поднимаются со дна.",
  "И среди этого плавает рыбка.",
]);
const SCENE_TWO_MODEL_BASE_POSITION = {
  x: 0.32,
  y: -0.22,
  z: -0.18,
};

function clamp01(value: number): number {
  return Math.max(Math.min(value, 1), 0);
}

function smootherStep(t: number): number {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

function dampAngle(current: number, target: number, smoothing: number, delta: number): number {
  const shortestDelta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + shortestDelta * (1 - Math.exp(-smoothing * delta));
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
}

function getNumericStylePx(node: HTMLElement, prop: "left" | "right"): number {
  if (typeof window === "undefined") return 0;
  const raw = window.getComputedStyle(node).getPropertyValue(prop).trim();
  const value = Number.parseFloat(raw);
  return Number.isNaN(value) ? 0 : value;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

type Hotspot = {
  id: string;
  position: [number, number, number];
  text: string;
  command: string;
  execCommand: string;
  details: string;
  output: string[];
  focusZ: number;
  focusY: number;
};

type TwitchFollowersPayload = {
  followersCount?: number;
};

type SceneTwoPendingAnimation = {
  finalLines: string[];
};

function getMinimalConnectorRotationY(position: [number, number, number]): number {
  const [x, , z] = position;
  // Rotate selected point toward the right side (fixed info panel side) to minimize connector length.
  return Math.atan2(z, x) - 0.08;
}

const BRAIN_HOTSPOTS: Hotspot[] = [
  {
    id: "frontal",
    position: [-0.16, 0.2, -0.46],
    text: "1",
    command: "Лобная доля",
    execCommand: "brain_scan --region frontal_lobe --subject \"Глеб Борисович\"",
    details:
      "Проведен анализ лобной доли мозга Глеба Борисовича: выявлен высокий уровень стратегического планирования, быстрый выбор решений и устойчивый когнитивный контроль в стрессовых задачах.",
    output: [
      "node: frontal-lobe",
      "subject: Глеб Борисович Орлов",
      "status: все исправно",
      "focus: планирование и контроль поведения",
    ],
    focusZ: -0.04,
    focusY: -0.18,
  },
  {
    id: "temporal",
    position: [-0.42, 0.02, 0.22],
    text: "2",
    command: "Височная доля",
    execCommand: "brain_scan --region temporal_lobe --subject \"Глеб Борисович\"",
    details:
      "Проведен анализ височной доли мозга Глеба Борисовича: зафиксированы усиленная обработка слуховой информации, устойчивое удержание смыслов речи и точное извлечение эпизодической памяти.",
    output: [
      "node: temporal-lobe",
      "subject: Глеб Борисович Орлов",
      "status: все исправно",
      "focus: слух и консолидация памяти",
    ],
    focusZ: 0,
    focusY: -0.2,
  },
  {
    id: "parietal",
    position: [0.34, 0.44, -0.12],
    text: "3",
    command: "Теменная доля",
    execCommand: "brain_scan --region parietal_lobe --subject \"Глеб Борисович\"",
    details:
      "Проведен анализ теменной доли мозга Глеба Борисовича: подтверждены точная сенсорная интеграция, устойчивая пространственная ориентация и быстрый пересчет внимания между несколькими стимулами.",
    output: [
      "node: parietal-lobe",
      "subject: Глеб Борисович Орлов",
      "status: все исправно",
      "focus: сенсорная интеграция и внимание",
    ],
    focusZ: 0.06,
    focusY: -0.14,
  },
  {
    id: "occipital",
    position: [0.18, 0.26, 0.42],
    text: "4",
    command: "Затылочная доля",
    execCommand: "brain_scan --region occipital_lobe --subject \"Глеб Борисович\"",
    details:
      "Проведен анализ затылочной доли мозга Глеба Борисовича: зафиксированы высокая скорость визуального распознавания, стабильная обработка контрастов и уверенная декомпозиция сложных образов.",
    output: [
      "node: occipital-lobe",
      "subject: Глеб Борисович Орлов",
      "status: все исправно",
      "focus: визуальная обработка и распознавание",
    ],
    focusZ: 0.08,
    focusY: -0.12,
  },
];

function BrainHologramModel({
  selectedHotspotId,
}: {
  selectedHotspotId: string | null;
}) {
  const gltf = useGLTF("/assets/3d/brain_hologram.glb");
  const groupRef = useRef<Group | null>(null);
  const autoRotationRef = useRef(0);
  const modelCenterOffset = useMemo(() => {
    const box = new Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new Vector3());
    return new Vector3(-center.x, -center.y, -center.z);
  }, [gltf.scene]);
  const selectedHotspot = BRAIN_HOTSPOTS.find((hotspot) => hotspot.id === selectedHotspotId);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    if (!selectedHotspot) {
      autoRotationRef.current += delta * 0.2;
    }

    const targetRotationY = selectedHotspot
      ? getMinimalConnectorRotationY(selectedHotspot.position)
      : -0.3 + autoRotationRef.current;
    const targetX = SCENE_TWO_MODEL_BASE_POSITION.x;
    const targetZ = SCENE_TWO_MODEL_BASE_POSITION.z;
    const targetY = SCENE_TWO_MODEL_BASE_POSITION.y;
    const targetScale = selectedHotspot ? 0.74 : 0.68;
    group.position.x = MathUtils.damp(group.position.x, targetX, 4.2, delta);
    group.rotation.y = dampAngle(group.rotation.y, targetRotationY, 5.2, delta);
    group.position.z = MathUtils.damp(group.position.z, targetZ, 4.2, delta);
    group.position.y = MathUtils.damp(group.position.y, targetY, 4.2, delta);
    group.scale.x = MathUtils.damp(group.scale.x, targetScale, 4.2, delta);
    group.scale.y = MathUtils.damp(group.scale.y, targetScale, 4.2, delta);
    group.scale.z = MathUtils.damp(group.scale.z, targetScale, 4.2, delta);
  });

  return (
    <group
      ref={groupRef}
      position={[
        SCENE_TWO_MODEL_BASE_POSITION.x,
        SCENE_TWO_MODEL_BASE_POSITION.y,
        SCENE_TWO_MODEL_BASE_POSITION.z,
      ]}
      rotation={[0, -0.3, 0]}
      scale={0.68}
    >
      <group position={[modelCenterOffset.x, modelCenterOffset.y, modelCenterOffset.z]}>
        <primitive object={gltf.scene} />
        {BRAIN_HOTSPOTS.map((hotspot) =>
          selectedHotspotId === hotspot.id ? (
            <group key={hotspot.id} position={hotspot.position}>
              <mesh>
                <sphereGeometry args={[0.03, 28, 28]} />
                <meshStandardMaterial
                  color="#ff8a9a"
                  emissive="#ff2f57"
                  emissiveIntensity={2.8}
                />
              </mesh>
              <mesh scale={1.95}>
                <sphereGeometry args={[0.03, 24, 24]} />
                <meshBasicMaterial color="#ff6b86" transparent opacity={0.22} />
              </mesh>
            </group>
          ) : null,
        )}
      </group>
    </group>
  );
}

const SceneFourFollowersCounter = memo(function SceneFourFollowersCounter({
  value,
}: {
  value: number | null;
}) {
  const formatter = useMemo(() => new Intl.NumberFormat("ru-RU"), []);
  const [animatedValue, setAnimatedValue] = useState<number | null>(value);
  const previousTargetRef = useRef<number | null>(value);

  useEffect(() => {
    if (value === null) {
      const rafId = window.requestAnimationFrame(() => {
        setAnimatedValue(null);
      });
      previousTargetRef.current = null;
      return () => {
        window.cancelAnimationFrame(rafId);
      };
    }

    const from = previousTargetRef.current ?? value;
    if (from === value) {
      const rafId = window.requestAnimationFrame(() => {
        setAnimatedValue(value);
      });
      previousTargetRef.current = value;
      return () => {
        window.cancelAnimationFrame(rafId);
      };
    }

    const durationMs = 1100;
    const startAt = performance.now();
    let rafId = 0;

    const frame = (now: number) => {
      const progress = clamp01((now - startAt) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      const nextValue = Math.round(from + (value - from) * eased);
      setAnimatedValue(nextValue);
      if (progress < 1) {
        rafId = window.requestAnimationFrame(frame);
        return;
      }
      previousTargetRef.current = value;
    };

    rafId = window.requestAnimationFrame(frame);
    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [value]);

  const renderedValue = animatedValue === null ? null : formatter.format(animatedValue);

  return (
    <p className={styles.sceneFourFollowersValue}>
      {renderedValue === null ? (
        "..."
      ) : (
        <span className={styles.sceneFourFollowersCounter} aria-label={`${renderedValue}`}>
          {Array.from(renderedValue).map((char, index) => (
            <span
              key={`followers-char-${index}`}
              className={/\d/u.test(char) ? styles.sceneFourFollowersCounterChar : styles.sceneFourFollowersCounterSeparator}
            >
              {char}
            </span>
          ))}
        </span>
      )}
    </p>
  );
});

export default function CinematicStorytelling() {
  const sceneTwoCommandsCount = BRAIN_HOTSPOTS.length + 2;
  const rootRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const storyTriggerRef = useRef<ScrollTrigger | null>(null);
  const sceneRefs = useRef<Array<HTMLElement | null>>([]);
  const contentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const keywordRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const bgRefs = useRef<Array<HTMLDivElement | null>>([]);
  const bannerRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const secondaryBannerRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const tertiaryBannerRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const quaternaryBannerRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const cupRefs = useRef<Array<HTMLImageElement | null>>([]);
  const sceneVideoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const cupSwapVideoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const cupSwapDimRefs = useRef<Array<HTMLDivElement | null>>([]);
  const sceneTwoTerminalLogRef = useRef<HTMLDivElement | null>(null);

  const [progress, setProgress] = useState(0);
  const [activeScene, setActiveScene] = useState(0);
  const [isStoryActive, setIsStoryActive] = useState(false);
  const [isDesktopStory, setIsDesktopStory] = useState(false);
  const [sceneTwoVisibleCount, setSceneTwoVisibleCount] = useState(0);
  const [sceneTwoSelectedHotspot, setSceneTwoSelectedHotspot] = useState<string | null>(null);
  const [sceneTwoPanelOpened, setSceneTwoPanelOpened] = useState(false);
  const [sceneTwoEndConfirmed, setSceneTwoEndConfirmed] = useState(false);
  const [sceneTwoExecutedCommands, setSceneTwoExecutedCommands] = useState<string[]>([]);
  const [sceneTwoTerminalLines, setSceneTwoTerminalLines] = useState<string[]>([]);
  const [sceneThreeVisibleLineCount, setSceneThreeVisibleLineCount] = useState(0);
  const [sceneThreeRestartUnlocked, setSceneThreeRestartUnlocked] = useState(false);
  const [sceneFourFollowersCount, setSceneFourFollowersCount] = useState<number | null>(null);
  const progressRef = useRef(progress);
  const activeSceneRef = useRef(activeScene);
  const sceneTwoTerminalLinesRef = useRef<string[]>([]);
  const sceneTwoLoggedCommandsRef = useRef<Set<string>>(new Set());
  const sceneTwoPendingAnimationRef = useRef<SceneTwoPendingAnimation | null>(null);
  const terminalTimersRef = useRef<number[]>([]);
  const sceneThreeVisibleLineCountRef = useRef(sceneThreeVisibleLineCount);
  const sceneThreeRestartUnlockedRef = useRef(sceneThreeRestartUnlocked);
  const selectedSceneTwoHotspot = BRAIN_HOTSPOTS.find((hotspot) => hotspot.id === sceneTwoSelectedHotspot) ?? null;
  const sceneTwoCommandsProgress = Math.min(
    sceneTwoExecutedCommands.length / Math.max(BRAIN_HOTSPOTS.length, 1),
    1,
  );
  const sceneTwoAllCommandsDone = sceneTwoExecutedCommands.length >= BRAIN_HOTSPOTS.length;
  const sceneTwoOrbitTarget: [number, number, number] = [
    SCENE_TWO_MODEL_BASE_POSITION.x,
    SCENE_TWO_MODEL_BASE_POSITION.y,
    SCENE_TWO_MODEL_BASE_POSITION.z,
  ];
  const sceneTwoCanvasDpr: [number, number] = isDesktopStory ? [1.35, 2] : [1, 1.5];
  const sceneWeightProgressThresholds = useMemo(() => {
    const sceneWeights = STORY_SCENES.map((_, index) => SCENE_SCROLL_WEIGHTS[index] ?? 1);
    const totalWeight = sceneWeights.reduce((sum, weight) => sum + weight, 0);
    return sceneWeights.map((_, index) => {
      const completedWeight = sceneWeights.slice(0, index + 1).reduce((sum, weight) => sum + weight, 0);
      return completedWeight / totalWeight;
    });
  }, []);
  const sceneStartProgressThresholds = useMemo(() => {
    const sceneWeights = STORY_SCENES.map((_, index) => SCENE_SCROLL_WEIGHTS[index] ?? 1);
    const totalWeight = sceneWeights.reduce((sum, weight) => sum + weight, 0);

    return STORY_SCENES.map((_, index) => {
      if (index === 0) return 0;
      const completedWeightBeforeScene = sceneWeights
        .slice(0, index)
        .reduce((sum, weight) => sum + weight, 0);
      return completedWeightBeforeScene / totalWeight;
    });
  }, []);
  const sceneStepPositions = useMemo(() => {
    const sceneCount = STORY_SCENES.length;
    if (sceneCount <= 1) return [0];
    return STORY_SCENES.map((_, index) => (index / (sceneCount - 1)) * 100);
  }, []);
  const sceneThreePlaybackStarted = sceneThreeVisibleLineCount > 0;
  const sceneThreeFinalLineVisible = sceneThreeVisibleLineCount >= SCENE_THREE_POEM_LINES.length;
  const sceneThreeControlsVisible = !sceneThreeFinalLineVisible || sceneThreeRestartUnlocked;
  const sceneThreeEndThreshold = sceneWeightProgressThresholds[2] ?? 1;
  const sceneThreeProgress = Math.min(sceneThreeVisibleLineCount / Math.max(SCENE_THREE_POEM_LINES.length, 1), 1);
  const displayedProgress = useMemo(() => {
    const sceneCount = STORY_SCENES.length;
    if (sceneCount <= 1) return 1;
    const maxIndex = sceneCount - 1;
    const segmentSize = 1 / maxIndex;

    if (activeScene === 0) {
      return 0;
    }

    if (activeScene === 1) {
      return segmentSize + segmentSize * sceneTwoCommandsProgress;
    }

    if (activeScene === 2) {
      return segmentSize * 2 + segmentSize * sceneThreeProgress;
    }

    return 1;
  }, [activeScene, sceneThreeProgress, sceneTwoCommandsProgress]);
  const sceneFourDescriptionLines = useMemo(
    () => splitSentences(STORY_SCENES[3]?.description ?? ""),
    [],
  );
  const sceneOneButtonUnlockThreshold = sceneWeightProgressThresholds[0] ?? 0;
  const storyButtonNavigationVisible =
    isDesktopStory &&
    isStoryActive &&
    activeScene >= 1 &&
    activeScene <= 2 &&
    progress >= Math.min(sceneOneButtonUnlockThreshold + 0.02, 1) &&
    sceneTwoEndConfirmed &&
    ((activeScene === 1 && sceneTwoAllCommandsDone) ||
      (activeScene === 2 && sceneTwoAllCommandsDone && sceneThreeFinalLineVisible));
  const canGoToPreviousScene = storyButtonNavigationVisible && activeScene >= 1;
  const canGoToNextScene = storyButtonNavigationVisible && activeScene < STORY_SCENES.length - 1;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const syncDesktopState = () => {
      setIsDesktopStory(media.matches);
    };

    syncDesktopState();
    media.addEventListener("change", syncDesktopState);
    return () => {
      media.removeEventListener("change", syncDesktopState);
    };
  }, []);
  useEffect(() => {
    sceneTwoTerminalLinesRef.current = sceneTwoTerminalLines;
  }, [sceneTwoTerminalLines]);

  useEffect(() => {
    if (!sceneTwoPanelOpened || activeScene !== 1) return;
    const terminalLog = sceneTwoTerminalLogRef.current;
    if (!terminalLog) return;
    const rafId = window.requestAnimationFrame(() => {
      terminalLog.scrollTop = terminalLog.scrollHeight;
    });
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [activeScene, sceneTwoPanelOpened, sceneTwoTerminalLines]);

  useEffect(() => {
    sceneThreeVisibleLineCountRef.current = sceneThreeVisibleLineCount;
  }, [sceneThreeVisibleLineCount]);

  useEffect(() => {
    sceneThreeRestartUnlockedRef.current = sceneThreeRestartUnlocked;
  }, [sceneThreeRestartUnlocked]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    activeSceneRef.current = activeScene;
  }, [activeScene]);

  useEffect(() => {
    if (!isDesktopStory || !isStoryActive || activeScene < 1 || activeScene > 2) {
      return;
    }

    const preventScroll = (event: Event) => {
      event.preventDefault();
    };

    const preventKeyboardScroll = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Spacebar"].includes(event.key)) {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", preventKeyboardScroll, { passive: false });

    return () => {
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", preventKeyboardScroll);
    };
  }, [activeScene, isDesktopStory, isStoryActive]);

  useEffect(() => {
    let isCancelled = false;

    const fetchFollowers = async (forceRefresh = false) => {
      try {
        const payload = await fetchJsonWithCache<TwitchFollowersPayload>("api:twitch-followers", "/api/twitch", {
          ttlMs: 45_000,
          forceRefresh,
        });

        if (isCancelled) return;
        const followersCount = payload.followersCount;
        if (typeof followersCount === "number") {
          setSceneFourFollowersCount((prev) =>
            prev === followersCount ? prev : followersCount,
          );
        }
      } catch {
        // Silently keep the latest known value.
      }
    };

    void fetchFollowers();
    const intervalId = window.setInterval(() => {
      void fetchFollowers(true);
    }, 60_000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const sceneThreeVideo = sceneVideoRefs.current[2];
    if (!sceneThreeVideo) return;

    sceneThreeVideo.preload = "auto";
    try {
      sceneThreeVideo.load();
    } catch {
      // Ignore browsers that reject imperative load here.
    }
  }, []);

  useEffect(() => {
    sceneVideoRefs.current.forEach((videoNode, index) => {
      if (!videoNode) return;
      const shouldPlay = Math.abs(activeScene - index) <= 1;
      if (shouldPlay) {
        void videoNode.play().catch(() => {
          // Ignore autoplay rejection from browser policies.
        });
        return;
      }
      videoNode.pause();
    });

    const cupSwapVideo = cupSwapVideoRefs.current[0];
    if (!cupSwapVideo) return;
    if (activeScene === 0) {
      void cupSwapVideo.play().catch(() => {
        // Ignore autoplay rejection from browser policies.
      });
      return;
    }
    cupSwapVideo.pause();
  }, [activeScene]);

  const ensureSceneTwoPromptLine = (): number => {
    const lines = [...sceneTwoTerminalLinesRef.current];
    const lastLine = lines[lines.length - 1] ?? "";
    if (lastLine === "C:\\brain>") {
      return lines.length - 1;
    }
    lines.push("C:\\brain>");
    updateSceneTwoTerminal(lines);
    return lines.length - 1;
  };

  const updateSceneTwoTerminal = (nextLines: string[]) => {
    sceneTwoTerminalLinesRef.current = nextLines;
    startTransition(() => {
      setSceneTwoTerminalLines(nextLines);
    });
  };

  const appendSceneTwoNextPromptLine = () => {
    const lines = [...sceneTwoTerminalLinesRef.current];
    const lastLine = lines[lines.length - 1] ?? "";
    if (lastLine !== "C:\\brain>") {
      lines.push("C:\\brain>");
      updateSceneTwoTerminal(lines);
    }
  };

  const clearSceneTwoTerminalTimers = () => {
    terminalTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    terminalTimersRef.current = [];
  };

  const finalizeSceneTwoTypingAnimation = () => {
    const pendingAnimation = sceneTwoPendingAnimationRef.current;
    if (!pendingAnimation) return;
    clearSceneTwoTerminalTimers();
    updateSceneTwoTerminal(pendingAnimation.finalLines);
    sceneTwoPendingAnimationRef.current = null;
  };

  const closeSceneTwoPanel = () => {
    setSceneTwoPanelOpened(false);
    setSceneTwoSelectedHotspot(null);
  };

  const runSceneTwoCommand = (hotspot: Hotspot) => {
    setSceneTwoSelectedHotspot(hotspot.id);
    setSceneTwoExecutedCommands((prev) => {
      if (prev.includes(hotspot.id)) return prev;
      return [...prev, hotspot.id];
    });
    if (sceneTwoLoggedCommandsRef.current.has(hotspot.id)) {
      return;
    }

    finalizeSceneTwoTypingAnimation();
    clearSceneTwoTerminalTimers();
    sceneTwoLoggedCommandsRef.current.add(hotspot.id);
    const commandLineIndex = ensureSceneTwoPromptLine();
    const baseLines = [...sceneTwoTerminalLinesRef.current];

    hotspot.execCommand.split("").forEach((char, index) => {
      const timer = window.setTimeout(() => {
        const nextLines = [...sceneTwoTerminalLinesRef.current];
        nextLines[commandLineIndex] = `${nextLines[commandLineIndex] ?? "C:\\brain>"}${char}`;
        updateSceneTwoTerminal(nextLines);
      }, 100 + index * 22);
      terminalTimersRef.current.push(timer);
    });

    const outputStartDelay = 100 + hotspot.execCommand.length * 22 + 180;
    const outputLines = [`[scan] ${hotspot.command}`, ...hotspot.output];
    const finalLines = [...baseLines];
    finalLines[commandLineIndex] = `C:\\brain>${hotspot.execCommand}`;
    finalLines.push(...outputLines, `> info ${hotspot.details}`, "C:\\brain>");
    sceneTwoPendingAnimationRef.current = { finalLines };

    outputLines.forEach((line, index) => {
      const timer = window.setTimeout(() => {
        const nextLines = [...sceneTwoTerminalLinesRef.current, line];
        updateSceneTwoTerminal(nextLines);
      }, outputStartDelay + index * 230);
      terminalTimersRef.current.push(timer);
    });

    const detailsStartDelay = outputStartDelay + outputLines.length * 230 + 120;
    let infoLineIndex = -1;
    const infoLineTimer = window.setTimeout(() => {
      const nextLines = [...sceneTwoTerminalLinesRef.current, "> info "];
      infoLineIndex = nextLines.length - 1;
      updateSceneTwoTerminal(nextLines);
    }, detailsStartDelay);
    terminalTimersRef.current.push(infoLineTimer);

    hotspot.details.split("").forEach((char, index) => {
      const timer = window.setTimeout(() => {
        if (infoLineIndex < 0) return;
        const nextLines = [...sceneTwoTerminalLinesRef.current];
        nextLines[infoLineIndex] = `${nextLines[infoLineIndex] ?? "> info "}${char}`;
        updateSceneTwoTerminal(nextLines);
      }, detailsStartDelay + 40 + index * 18);
      terminalTimersRef.current.push(timer);
    });

    const finalDelay = detailsStartDelay + 40 + hotspot.details.length * 18;
    const nextPromptTimer = window.setTimeout(() => {
      appendSceneTwoNextPromptLine();
    }, finalDelay);
    terminalTimersRef.current.push(nextPromptTimer);

    const completeTimer = window.setTimeout(() => {
      sceneTwoPendingAnimationRef.current = null;
    }, finalDelay + 40);
    terminalTimersRef.current.push(completeTimer);
  };

  const runSceneTwoPanelCommand = (command: "start" | "end") => {
    if (command === "start") {
      setSceneTwoPanelOpened(true);
      setSceneTwoEndConfirmed(false);
    } else {
      closeSceneTwoPanel();
      setSceneTwoEndConfirmed(sceneTwoAllCommandsDone);
    }

    if (sceneTwoLoggedCommandsRef.current.has(command)) {
      return;
    }

    finalizeSceneTwoTypingAnimation();
    clearSceneTwoTerminalTimers();
    sceneTwoLoggedCommandsRef.current.add(command);
    const commandLineIndex = ensureSceneTwoPromptLine();
    const baseLines = [...sceneTwoTerminalLinesRef.current];
    const finalLines = [...baseLines];
    finalLines[commandLineIndex] = `C:\\brain>${command}`;
    finalLines.push("C:\\brain>");
    sceneTwoPendingAnimationRef.current = { finalLines };

    command.split("").forEach((char, index) => {
      const timer = window.setTimeout(() => {
        const nextLines = [...sceneTwoTerminalLinesRef.current];
        nextLines[commandLineIndex] = `${nextLines[commandLineIndex] ?? "C:\\brain>"}${char}`;
        updateSceneTwoTerminal(nextLines);
      }, 90 + index * 22);
      terminalTimersRef.current.push(timer);
    });

    const toggleTimer = window.setTimeout(
      () => {
        appendSceneTwoNextPromptLine();
      },
      90 + command.length * 22,
    );
    terminalTimersRef.current.push(toggleTimer);

    const completeTimer = window.setTimeout(() => {
      sceneTwoPendingAnimationRef.current = null;
    }, 90 + command.length * 22 + 40);
    terminalTimersRef.current.push(completeTimer);
  };

  useEffect(() => {
    if (activeScene !== 1) {
      clearSceneTwoTerminalTimers();
      sceneTwoPendingAnimationRef.current = null;
      startTransition(() => {
        setSceneTwoVisibleCount(0);
        setSceneTwoSelectedHotspot(null);
        setSceneTwoPanelOpened(false);
        setSceneTwoEndConfirmed(false);
      });
      updateSceneTwoTerminal([]);
      sceneTwoTerminalLinesRef.current = [];
      sceneTwoLoggedCommandsRef.current = new Set();
      sceneTwoPendingAnimationRef.current = null;
      return;
    }

    startTransition(() => {
      setSceneTwoVisibleCount(0);
      setSceneTwoSelectedHotspot(null);
      setSceneTwoEndConfirmed(false);
    });
    sceneTwoLoggedCommandsRef.current = new Set();
    const timers: number[] = [];

    Array.from({ length: sceneTwoCommandsCount }).forEach((_, index) => {
      const timer = window.setTimeout(() => {
        setSceneTwoVisibleCount(index + 1);
      }, 220 + index * 500);
      timers.push(timer);
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      clearSceneTwoTerminalTimers();
    };
  }, [activeScene, sceneTwoCommandsCount]);

  useEffect(() => {
    const scenes = sceneRefs.current.filter(Boolean) as HTMLElement[];
    if (!scenes.length) return;

    if (!isDesktopStory) {
      scenes.forEach((scene) => {
        gsap.killTweensOf(scene);
        const darkenLayer = scene.querySelector(`.${styles.sceneTransitionDarken}`) as HTMLDivElement | null;
        if (darkenLayer) {
          gsap.killTweensOf(darkenLayer);
          gsap.set(darkenLayer, { clearProps: "opacity,visibility" });
        }
        gsap.set(scene, {
          clearProps: "opacity,visibility,transform,pointerEvents,zIndex",
        });
      });
      return;
    }

    scenes.forEach((scene, index) => {
      const darkenLayer = scene.querySelector(`.${styles.sceneTransitionDarken}`) as HTMLDivElement | null;
      const delta = activeScene - index;
      const stackDepth = Math.min(Math.max(delta, 0), 3);
      const isActiveScene = delta === 0;
      const isPastScene = delta > 0;
      const isUpcomingScene = delta < 0;
      const shouldHideScene = delta > 1 || isUpcomingScene;
      const nextOpacity = shouldHideScene
        ? 0
        : isActiveScene
          ? 1
          : Math.max(0.22, 0.66 - stackDepth * SCENE_STACK_OPACITY_STEP);
      const nextYPercent = shouldHideScene ? 0 : isActiveScene ? 0 : stackDepth * SCENE_STACK_SHIFT_PERCENT;
      const nextScale = shouldHideScene ? 1 : 1 - stackDepth * SCENE_STACK_SCALE_STEP;
      const nextDimOpacity = shouldHideScene ? 1 : Math.min(stackDepth * SCENE_STACK_DIM_STEP, 0.54);

      gsap.killTweensOf(scene);
      gsap.set(scene, {
        zIndex: shouldHideScene ? 1 : 30 - stackDepth,
        pointerEvents: isActiveScene ? "auto" : "none",
      });
      gsap.to(scene, {
        autoAlpha: nextOpacity,
        yPercent: nextYPercent,
        scale: nextScale,
        force3D: true,
        duration: isStoryActive ? 0.52 : 0.22,
        ease: "power2.out",
        overwrite: "auto",
      });
      if (darkenLayer) {
        gsap.killTweensOf(darkenLayer);
        gsap.to(darkenLayer, {
          autoAlpha: nextDimOpacity,
          duration: isStoryActive ? 0.52 : 0.22,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    });
  }, [activeScene, isDesktopStory, isStoryActive]);

  useEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    if (!root || !viewport) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      return;
    }

    const mm = gsap.matchMedia();
    let lenis: Lenis | null = null;
    let rafId = 0;

    mm.add("(min-width: 1024px)", () => {
      const scenes = sceneRefs.current.filter(Boolean) as HTMLElement[];
      const contents = contentRefs.current;
      const keywords = keywordRefs.current;
      const bgs = bgRefs.current;
      const banners = bannerRefs.current;
      const secondaryBanners = secondaryBannerRefs.current;
      const tertiaryBanners = tertiaryBannerRefs.current;
      const quaternaryBanners = quaternaryBannerRefs.current;
      const cups = cupRefs.current;
      const cupSwapVideos = cupSwapVideoRefs.current;
      const cupSwapDims = cupSwapDimRefs.current;
      const contentNodes = contents.filter(Boolean) as HTMLDivElement[];
      const keywordNodes = keywords.filter(Boolean) as HTMLParagraphElement[];
      const bgNodes = bgs.filter(Boolean) as HTMLDivElement[];
      const bannerNodes = banners.filter(Boolean) as HTMLParagraphElement[];
      const secondaryBannerNodes = secondaryBanners.filter(Boolean) as HTMLParagraphElement[];
      const tertiaryBannerNodes = tertiaryBanners.filter(Boolean) as HTMLParagraphElement[];
      const quaternaryBannerNodes = quaternaryBanners.filter(Boolean) as HTMLParagraphElement[];
      const cupNodes = cups.filter(Boolean) as HTMLImageElement[];
      const cupSwapVideoNodes = cupSwapVideos.filter(Boolean) as HTMLVideoElement[];
      const cupSwapDimNodes = cupSwapDims.filter(Boolean) as HTMLDivElement[];
      if (!scenes.length) return undefined;

      lenis = new Lenis({
        duration: 1.15,
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1,
      });

      const updateOnLenis = () => ScrollTrigger.update();
      lenis.on("scroll", updateOnLenis);

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = window.requestAnimationFrame(raf);
      };
      rafId = window.requestAnimationFrame(raf);

      const ctx = gsap.context(() => {
        gsap.set(scenes, { yPercent: 0, scale: 1, transformOrigin: "center top" });
        gsap.set(contentNodes, { autoAlpha: 0, y: 34 });
        gsap.set(keywordNodes, { autoAlpha: 0, y: 26, scale: 1.05 });
        gsap.set(bgNodes, {
          scale: SCENE_PARALLAX_START_SCALE,
          yPercent: SCENE_PARALLAX_START_Y,
          transformOrigin: "center center",
          force3D: true,
        });
        gsap.set(bannerNodes, { autoAlpha: 1, xPercent: 0, x: -2000 });
        gsap.set(secondaryBannerNodes, { autoAlpha: 0, x: 2000 });
        gsap.set(tertiaryBannerNodes, { autoAlpha: 0 });
        gsap.set(quaternaryBannerNodes, { autoAlpha: 0, y: 16 });
        gsap.set(cupNodes, { autoAlpha: 0, scale: 0.9, y: 20 });
        gsap.set(cupSwapVideoNodes, { autoAlpha: 0, scale: 0.9, y: 20 });
        gsap.set(cupSwapDimNodes, { autoAlpha: 0 });

        const sceneWeights = STORY_SCENES.map((_, index) => SCENE_SCROLL_WEIGHTS[index] ?? 1);
        const totalWeight = sceneWeights.reduce((sum, weight) => sum + weight, 0);
        const sceneThresholds = sceneWeights.map((_, index) => {
          const completedWeight = sceneWeights.slice(0, index + 1).reduce((sum, weight) => sum + weight, 0);
          return completedWeight / totalWeight;
        });

        const sceneStartAt = sceneWeights.reduce<number[]>((acc, weight, index) => {
          if (index === 0) {
            acc.push(0);
            return acc;
          }
          acc.push(acc[index - 1] + sceneWeights[index - 1]);
          return acc;
        }, []);

        const timeline = gsap.timeline({
          defaults: { ease: "none", autoRound: false },
          scrollTrigger: {
            trigger: root,
            pin: viewport,
            start: "top top",
            // Main pacing control: increase multiplier for longer cinematic storytelling.
            end: `+=${window.innerHeight * STORY_SCENES.length * SCENE_SCROLL_LENGTH_MULTIPLIER}`,
            scrub: SCENE_PARALLAX_SCRUB,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onToggle: (self) => setIsStoryActive(self.isActive),
            onUpdate: (self) => {
              const nextProgress =
                Math.round(self.progress * PROGRESS_STATE_PRECISION) / PROGRESS_STATE_PRECISION;
              const nextActive = sceneThresholds.findIndex((threshold) => self.progress < threshold);
              const resolvedActive = nextActive === -1 ? STORY_SCENES.length - 1 : nextActive;
              if (
                self.direction < 0 &&
                resolvedActive === 2 &&
                sceneThreeVisibleLineCountRef.current >= SCENE_THREE_POEM_LINES.length &&
                !sceneThreeRestartUnlockedRef.current
              ) {
                startTransition(() => {
                  setSceneThreeRestartUnlocked(true);
                });
              }
              if (Math.abs(nextProgress - progressRef.current) >= PROGRESS_STATE_EPSILON) {
                progressRef.current = nextProgress;
                startTransition(() => {
                  setProgress(nextProgress);
                });
              }
              if (activeSceneRef.current !== resolvedActive) {
                activeSceneRef.current = resolvedActive;
                startTransition(() => {
                  setActiveScene(resolvedActive);
                });
              }
            },
          },
        });
        storyTriggerRef.current = timeline.scrollTrigger ?? null;

        const transitionDuration = SCENE_DEFAULT_TRANSITION_DURATION;
        for (let i = 0; i < scenes.length; i += 1) {
          const scene = scenes[i];
          const content = contents[i];
          const keyword = keywords[i];
          const bg = bgs[i];
          const banner = banners[i];
          const secondaryBanner = secondaryBanners[i];
          const tertiaryBanner = tertiaryBanners[i];
          const quaternaryBanner = quaternaryBanners[i];
          const cup = cups[i];
          const cupSwapVideo = cupSwapVideos[i];
          const cupSwapDim = cupSwapDims[i];
          const at = sceneStartAt[i];

          if (i > 0) {
            const isSceneTwoToThreeTransition = i === 2;
            const sceneTransitionDuration = isSceneTwoToThreeTransition
              ? SCENE_TWO_TO_THREE_TRANSITION_DURATION
              : transitionDuration;
            const sceneTransitionEase = isSceneTwoToThreeTransition ? "power2.inOut" : "power2.inOut";
            const sceneTransitionStartAt = isSceneTwoToThreeTransition
              ? at - SCENE_TWO_TO_THREE_TRANSITION_OVERLAP
              : at - SCENE_DEFAULT_TRANSITION_OVERLAP;
            const prevScene = scenes[i - 1];
            const prevContent = contents[i - 1];
            const prevKeyword = keywords[i - 1];
            const prevBanner = banners[i - 1];
            const prevSecondaryBanner = secondaryBanners[i - 1];
            const prevTertiaryBanner = tertiaryBanners[i - 1];
            const prevQuaternaryBanner = quaternaryBanners[i - 1];
            const prevCup = cups[i - 1];
            const prevCupSwapVideo = cupSwapVideos[i - 1];
            const prevCupSwapDim = cupSwapDims[i - 1];
            const prevSceneDarkenLayer =
              (prevScene.querySelector(`.${styles.sceneTransitionDarken}`) as HTMLDivElement | null);
            const nextSceneDarkenLayer =
              (scene.querySelector(`.${styles.sceneTransitionDarken}`) as HTMLDivElement | null);
            const prevSceneThreeTransitionDim =
              i === 3
                ? (prevScene.querySelector(`.${styles.sceneThreeTransitionDim}`) as HTMLDivElement | null)
                : null;

            if (prevSceneDarkenLayer) {
              timeline.fromTo(
                prevSceneDarkenLayer,
                { autoAlpha: 0 },
                {
                  autoAlpha: 0.9,
                  duration: sceneTransitionDuration,
                  ease: "power2.inOut",
                  immediateRender: false,
                },
                sceneTransitionStartAt,
              );
            }

            if (nextSceneDarkenLayer) {
              timeline.fromTo(
                nextSceneDarkenLayer,
                { autoAlpha: 1 },
                {
                  autoAlpha: 0,
                  duration: sceneTransitionDuration,
                  ease: "power2.inOut",
                  immediateRender: false,
                },
                sceneTransitionStartAt,
              );
            }

            if (prevSceneThreeTransitionDim) {
              timeline.fromTo(
                prevSceneThreeTransitionDim,
                { autoAlpha: 0 },
                {
                  autoAlpha: 1,
                  duration: sceneTransitionDuration,
                  ease: "power1.inOut",
                  immediateRender: false,
                },
                sceneTransitionStartAt,
              );
            }

            if (prevContent) {
              timeline.to(
                prevContent,
                {
                  autoAlpha: 0,
                  y: -26,
                  duration: sceneTransitionDuration * 0.7,
                  ease: sceneTransitionEase,
                },
                sceneTransitionStartAt,
              );
            }

            if (prevKeyword) {
              timeline.to(
                prevKeyword,
                {
                  autoAlpha: 0,
                  y: -18,
                  duration: sceneTransitionDuration * 0.7,
                  ease: sceneTransitionEase,
                },
                sceneTransitionStartAt,
              );
            }

            if (prevBanner) {
              timeline.to(
                prevBanner,
                {
                  autoAlpha: 1,
                  x: () => prevScene.clientWidth + prevBanner.offsetWidth + 80,
                  duration: transitionDuration * 0.75,
                },
                at - SCENE_TEXT_EDGE_EXIT_LEAD,
              );
            }

            if (prevSecondaryBanner) {
              timeline.to(
                prevSecondaryBanner,
                {
                  autoAlpha: 1,
                  x: () => -(prevSecondaryBanner.offsetWidth + 80),
                  duration: transitionDuration * 0.75,
                },
                at - SCENE_TEXT_EDGE_EXIT_LEAD,
              );
            }

            if (prevTertiaryBanner) {
              timeline.to(
                prevTertiaryBanner,
                {
                  autoAlpha: 0,
                  duration: transitionDuration * 0.45,
                },
                at - SCENE_TEXT_EDGE_EXIT_LEAD,
              );
            }

            if (prevQuaternaryBanner) {
              timeline.to(
                prevQuaternaryBanner,
                {
                  autoAlpha: 0,
                  duration: transitionDuration * 0.45,
                },
                at - SCENE_TEXT_EDGE_EXIT_LEAD,
              );
            }

            if (prevCup) {
              timeline.to(
                prevCup,
                {
                  autoAlpha: 0,
                  scale: 0.9,
                  y: 20,
                  duration: transitionDuration * 0.5,
                },
                at,
              );
            }

            if (prevCupSwapVideo) {
              timeline.to(
                prevCupSwapVideo,
                {
                  autoAlpha: 0,
                  scale: 0.9,
                  y: 20,
                  duration: transitionDuration * 0.5,
                },
                at,
              );
            }

            if (prevCupSwapDim) {
              timeline.to(
                prevCupSwapDim,
                {
                  autoAlpha: 0,
                  duration: transitionDuration * 0.5,
                },
                at,
              );
            }
          }

          if (bg) {
            const bgDuration = i === 0 ? (sceneWeights[i] ?? 1) : (sceneWeights[i] ?? 1) + 0.2;
            const isStaticParallaxScene = i === 2 || i === 3;
            timeline.fromTo(
              bg,
              {
                scale: isStaticParallaxScene ? 1 : SCENE_PARALLAX_START_SCALE,
                yPercent: isStaticParallaxScene ? 0 : SCENE_PARALLAX_START_Y,
              },
              {
                scale: isStaticParallaxScene ? 1 : SCENE_PARALLAX_END_SCALE,
                yPercent: isStaticParallaxScene ? 0 : SCENE_PARALLAX_END_Y,
                duration: bgDuration,
                immediateRender: false,
                force3D: true,
              },
              at,
            );
          }

          if (content) {
            timeline.fromTo(
              content,
              { autoAlpha: 0, y: 36 },
              { autoAlpha: 1, y: 0, duration: 0.35 },
              at + 0.1,
            );
          }

          if (keyword) {
            timeline.fromTo(
              keyword,
              { autoAlpha: 0, y: 22, scale: 1.06 },
              { autoAlpha: 0.2, y: 0, scale: 1, duration: 0.36 },
              at + 0.14,
            );
          }

          if (banner) {
            timeline.fromTo(
              banner,
              {
                autoAlpha: 1,
                x: () => -(banner.offsetWidth + 120),
              },
              {
                autoAlpha: 1,
                x: () => {
                  const sceneWidth = scene.clientWidth;
                  const bannerLeft = getNumericStylePx(banner, "left");
                  return Math.max(
                    sceneWidth - banner.offsetWidth - bannerLeft - SCENE_TEXT_EDGE_PADDING,
                    0,
                  );
                },
                duration: SCENE_TEXT_TRAVEL_DURATION,
              },
              at,
            );
          }

          if (secondaryBanner) {
            timeline.fromTo(
              secondaryBanner,
              {
                autoAlpha: 1,
                x: () => scene.clientWidth + secondaryBanner.offsetWidth + 80,
              },
              {
                autoAlpha: 1,
                x: () => {
                  const secondaryLeft = getNumericStylePx(secondaryBanner, "left");
                  return Math.max(SCENE_TEXT_EDGE_PADDING - secondaryLeft, 0);
                },
                duration: SCENE_TEXT_TRAVEL_DURATION,
              },
              at,
            );
          }

          if (tertiaryBanner && i === 0) {
            timeline.fromTo(
              tertiaryBanner,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.28, immediateRender: false },
              at + SCENE_TEXT_TRAVEL_DURATION + 0.02,
            );
          }

          if (i === 0) {
            const revealAt = at + SCENE_TEXT_TRAVEL_DURATION + 0.34;

            if (cup) {
              timeline.fromTo(
                cup,
                { autoAlpha: 0, scale: 0.9, y: 20 },
                { autoAlpha: 0.92, scale: 1, y: 0, duration: 0.36, immediateRender: false },
                revealAt,
              );
            }

            if (quaternaryBanner) {
              timeline.fromTo(
                quaternaryBanner,
                { autoAlpha: 0, y: 16 },
                { autoAlpha: 1, y: 0, duration: 0.32, immediateRender: false },
                revealAt + 0.04,
              );
            }

            const swapAt = revealAt + 0.42 + SCENE_CUP_HOLD_DURATION;

            if (cup) {
              timeline.to(
                cup,
                { autoAlpha: 0, scale: 0.9, y: 20, duration: 0.34 },
                swapAt,
              );
            }

            if (cupSwapVideo) {
              timeline.fromTo(
                cupSwapVideo,
                { autoAlpha: 0, scale: 0.9, y: 20 },
                { autoAlpha: 0.94, scale: 1, y: 0, duration: 0.34, immediateRender: false },
                swapAt,
              );
            }

            if (cupSwapDim) {
              timeline.fromTo(
                cupSwapDim,
                { autoAlpha: 0 },
                { autoAlpha: 0.62, duration: 0.34, immediateRender: false },
                swapAt,
              );
            }

            if (tertiaryBanner) {
              timeline.to(
                tertiaryBanner,
                { y: SCENE_TEXT_UNDER_MEDIA_SHIFT_Y, duration: 0.34 },
                swapAt,
              );
            }

            if (quaternaryBanner) {
              timeline.to(
                quaternaryBanner,
                { y: SCENE_TEXT_UNDER_MEDIA_SHIFT_Y, duration: 0.34 },
                swapAt,
              );
            }

            if (cupSwapVideo) {
              // Hold the second media on screen a bit longer before Scene 02 starts.
              timeline.to(
                {},
                { duration: SCENE_SWAP_MEDIA_HOLD_DURATION },
                swapAt + 0.34,
              );
            }
          }

        }
      }, root);

      if (typeof document !== "undefined" && "fonts" in document) {
        void document.fonts.ready.then(() => {
          ScrollTrigger.refresh();
        });
      }

      return () => {
        storyTriggerRef.current = null;
        ctx.revert();
        if (rafId) window.cancelAnimationFrame(rafId);
        lenis?.destroy();
        lenis = null;
      };
    });

    return () => {
      storyTriggerRef.current = null;
      mm.revert();
      if (rafId) window.cancelAnimationFrame(rafId);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  const moveToStoryScene = (sceneIndex: number) => {
    const storyTrigger = storyTriggerRef.current;
    if (!storyTrigger) return;

    const safeSceneIndex = Math.max(0, Math.min(sceneIndex, STORY_SCENES.length - 1));
    const sceneStartProgress = sceneStartProgressThresholds[safeSceneIndex] ?? 0;
    const sceneEndProgress = sceneWeightProgressThresholds[safeSceneIndex] ?? 1;
    const sceneSpan = Math.max(sceneEndProgress - sceneStartProgress, 0);
    const sceneProgress =
      safeSceneIndex === 0
        ? sceneStartProgress
        : Math.min(sceneStartProgress + Math.min(sceneSpan * 0.22, 0.045), sceneEndProgress);
    const targetScrollTop = storyTrigger.start + (storyTrigger.end - storyTrigger.start) * sceneProgress + 2;
    const startScrollTop = window.scrollY;
    const startedAt = performance.now();

    const animateScroll = (now: number) => {
      const progressValue = clamp01((now - startedAt) / STORY_BUTTON_SCROLL_DURATION_MS);
      const easedProgress = easeInOutCubic(progressValue);
      const nextScrollTop = startScrollTop + (targetScrollTop - startScrollTop) * easedProgress;

      window.scrollTo({
        top: nextScrollTop,
        behavior: "auto",
      });

      if (progressValue < 1) {
        window.requestAnimationFrame(animateScroll);
      }
    };

    window.requestAnimationFrame(animateScroll);
  };

  const handleSceneThreePlaybackStart = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (sceneThreeFinalLineVisible) {
      if (!sceneThreeRestartUnlocked) return;
      setSceneThreeVisibleLineCount(1);
      setSceneThreeRestartUnlocked(false);
      return;
    }

    const nextVisibleLineCount = sceneThreeVisibleLineCount + 1;
    if (nextVisibleLineCount >= SCENE_THREE_POEM_LINES.length) {
      event.currentTarget.blur();
      window.requestAnimationFrame(() => {
        const root = rootRef.current;
        if (!root) return;
        const storyTrigger = ScrollTrigger.getAll().find((trigger) => trigger.vars.trigger === root);
        if (!storyTrigger) return;
        const endScroll = storyTrigger.start + (storyTrigger.end - storyTrigger.start) * sceneThreeEndThreshold;
        window.scrollTo({
          top: Math.max(endScroll - 24, storyTrigger.start),
          behavior: "auto",
        });
      });
    }

    setSceneThreeVisibleLineCount(nextVisibleLineCount);
  };

  return (
    <section id="about" ref={rootRef} className={styles.root}>
      <div ref={viewportRef} className={styles.viewport}>
        <div className={styles.sceneStack}>
          {STORY_SCENES.map((scene, index) => {
            const isPassedScene = isDesktopStory && index < activeScene;
            const shouldKeepSceneOneMounted = index === 0;
            const shouldRenderSceneAssets =
              shouldKeepSceneOneMounted ||
              !isDesktopStory ||
              (index >= activeScene - 1 && index <= activeScene + 1);
            const shouldRenderHeavyScene =
              shouldKeepSceneOneMounted ||
              !isDesktopStory ||
              !isPassedScene ||
              index === activeScene - 1;

            return <article
              key={scene.id}
              ref={(node) => {
                sceneRefs.current[index] = node;
              }}
              className={`${styles.scene} ${
                index === 1 || index === 2 ? styles.sceneFullBleed : ""
              } ${index === activeScene ? styles.sceneActive : ""}`}
            >
              <div
                ref={(node) => {
                  bgRefs.current[index] = node;
                }}
                className={styles.sceneBg}
                style={{ background: scene.gradient }}
                aria-hidden="true"
              >
                <div className={styles.sceneTransitionDarken} aria-hidden="true" />
                {scene.bgVideoSrc && shouldRenderHeavyScene ? (
                  <video
                    ref={(node) => {
                      sceneVideoRefs.current[index] = node;
                    }}
                    className={styles.sceneVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload={index === 2 ? "auto" : "metadata"}
                  >
                    <source src={encodeURI(scene.bgVideoSrc)} type="video/webm" />
                  </video>
                ) : null}
              </div>
              {index !== 0 && index !== 1 && index !== 2 && shouldRenderHeavyScene ? (
                <div
                  ref={(node) => {
                    contentRefs.current[index] = node;
                  }}
                  className={`${styles.content} ${index === 3 ? styles.sceneFourContent : ""}`}
                >
                  {index !== 3 ? <p className={styles.eyebrow}>{scene.eyebrow}</p> : null}
                  <h2 className={`${styles.title} ${index === 3 ? styles.sceneFourTitle : ""}`}>{scene.title}</h2>
                  {index === 3 ? (
                    <div className={styles.sceneFourFollowers} aria-live="polite">
                      <p className={styles.sceneFourFollowersLabel}>нас уже</p>
                      <SceneFourFollowersCounter value={sceneFourFollowersCount} />
                    </div>
                  ) : null}
                  {index === 3 ? (
                    <div
                      className={`${styles.sceneFourDescriptionLines} ${
                        activeScene === 3 ? styles.sceneFourDescriptionLinesVisible : ""
                      }`}
                      aria-label="Описание сцены 4"
                    >
                      {sceneFourDescriptionLines.map((line, lineIndex) => (
                        <p
                          key={`scene-four-line-${lineIndex}`}
                          className={styles.sceneFourDescriptionLine}
                          style={{ ["--line-index" as string]: lineIndex } as { [key: string]: number }}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.description}>{scene.description}</p>
                  )}
                  {scene.cta ? (
                    <Link className={styles.cta} href={scene.cta.href} prefetch={false}>
                      {scene.cta.label}
                    </Link>
                  ) : null}
                </div>
              ) : null}
              {index !== 0 && index !== 1 && index !== 2 && index !== STORY_SCENES.length - 1 && shouldRenderHeavyScene ? (
                <p
                  ref={(node) => {
                    keywordRefs.current[index] = node;
                  }}
                  className={styles.keyword}
                >
                  {scene.keyword}
                </p>
              ) : null}
              {index === 2 && shouldRenderHeavyScene ? <div className={styles.sceneThreeTransitionDim} aria-hidden="true" /> : null}
              {index === 2 && shouldRenderHeavyScene ? (
                <div className={styles.sceneThreePoem} aria-label="Стих сцены 3">
                  <div
                    className={`${styles.sceneThreeFinalDim} ${
                      activeScene === 2 && sceneThreeFinalLineVisible ? styles.sceneThreeFinalDimActive : ""
                    }`}
                    aria-hidden="true"
                  />
                  <div
                    className={`${styles.sceneThreePoemControls} ${
                      activeScene === 2 && sceneThreeControlsVisible ? styles.sceneThreePoemControlsVisible : ""
                    }`}
                  >
                    <button
                      type="button"
                      className={styles.sceneThreePoemButton}
                      onClick={handleSceneThreePlaybackStart}
                    >
                      {sceneThreeFinalLineVisible
                        ? "Начать заново"
                        : sceneThreePlaybackStarted
                          ? "Следующая строка"
                          : "Показать слова"}
                    </button>
                  </div>
                  <div
                    className={`${styles.sceneThreePoemInner} ${
                      activeScene === 2 && sceneThreePlaybackStarted ? styles.sceneThreePoemInnerVisible : ""
                    }`}
                  >
                    {SCENE_THREE_POEM_LINES.map((line, lineIndex) => {
                      const isVisible =
                        activeScene === 2 &&
                        sceneThreeVisibleLineCount > 0 &&
                        lineIndex === sceneThreeVisibleLineCount - 1;
                      return (
                        <p
                          key={`scene-three-poem-line-${lineIndex}`}
                          className={`${styles.sceneThreePoemLine} ${
                            SCENE_THREE_ADAPTIVE_LINES.has(line) ? styles.sceneThreePoemLineAdaptive : ""
                          }`}
                          style={
                            {
                              opacity: isVisible ? 1 : 0,
                              transform: isVisible
                                ? "translate(-50%, -50%)"
                                : "translate(-50%, calc(-50% + 12px))",
                            } as { [key: string]: string | number }
                          }
                        >
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              {index === 1 && shouldRenderHeavyScene ? (
                <div className={styles.sceneModelStage}>
                  <div className={styles.sceneModelGridBackdrop} aria-hidden="true" />
                  <div className={styles.sceneTwoSidebar}>
                    <div className={styles.sceneTwoIntroCard}>
                      <h2 className={styles.sceneTwoIntroTitle}>{STORY_SCENES[1]?.title}</h2>
                      <p className={styles.sceneTwoIntroText}>
                        Сначала нажми <span>start</span>, чтобы начать. Затем выбирай пункты слева:
                        ты увидишь подсветку нужной области, а справа появится понятное объяснение.
                      </p>
                    </div>
                    <div className={styles.sceneTwoCommands}>
                      <button
                        type="button"
                        className={`${styles.sceneTwoItem} ${
                          sceneTwoVisibleCount > 0 ? styles.sceneTwoItemVisible : ""
                        } ${sceneTwoPanelOpened ? styles.sceneTwoItemActive : ""}`}
                        onClick={() => runSceneTwoPanelCommand("start")}
                        aria-label="Открыть правую командную плашку"
                      >
                        <span className={styles.sceneTwoItemPrompt}>&gt;</span>
                        <span className={styles.sceneTwoItemLabel}>start</span>
                      </button>
                      {BRAIN_HOTSPOTS.map((hotspot, hotspotIndex) => {
                        const isDone = sceneTwoExecutedCommands.includes(hotspot.id);
                        return (
                          <button
                            key={hotspot.id}
                            type="button"
                            className={`${styles.sceneTwoItem} ${
                              hotspotIndex + 1 < sceneTwoVisibleCount ? styles.sceneTwoItemVisible : ""
                            } ${sceneTwoSelectedHotspot === hotspot.id ? styles.sceneTwoItemActive : ""} ${
                              isDone ? styles.sceneTwoItemDone : ""
                            }`}
                            onClick={() => runSceneTwoCommand(hotspot)}
                            aria-label={`Выполнить команду ${hotspot.command}`}
                          >
                            <span className={styles.sceneTwoItemPrompt}>&gt;</span>
                            <span className={styles.sceneTwoItemLabel}>{hotspot.command}</span>
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        className={`${styles.sceneTwoItem} ${
                          sceneTwoVisibleCount >= sceneTwoCommandsCount ? styles.sceneTwoItemVisible : ""
                        } ${!sceneTwoPanelOpened ? styles.sceneTwoItemActive : ""}`}
                        onClick={() => runSceneTwoPanelCommand("end")}
                        aria-label="Закрыть правую командную плашку"
                      >
                        <span className={styles.sceneTwoItemPrompt}>&gt;</span>
                        <span className={styles.sceneTwoItemLabel}>end</span>
                      </button>
                    </div>
                    <div className={styles.sceneTwoChecks} aria-label="Прогресс выполнения команд">
                      {BRAIN_HOTSPOTS.map((hotspot, checkIndex) => {
                        const isDone = sceneTwoExecutedCommands.includes(hotspot.id);
                        return (
                          <span
                            key={`check-${hotspot.id}`}
                            className={`${styles.sceneTwoCheckItem} ${isDone ? styles.sceneTwoCheckDone : ""}`}
                            aria-label={`Команда ${checkIndex + 1} ${isDone ? "выполнена" : "не выполнена"}`}
                          >
                            {isDone ? "✓" : ""}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div
                    className={`${styles.sceneTwoTerminalPanel} ${
                      activeScene === 1 && sceneTwoPanelOpened ? styles.sceneTwoTerminalPanelVisible : ""
                    }`}
                  >
                    <div
                      className={styles.sceneTwoFixedPanel}
                    >
                      <div className={styles.sceneTwoWindowBar}>
                        <p className={styles.sceneTwoWindowTitle}>SASAVOT141 Console [Version 1.0.141]</p>
                        <button
                          type="button"
                          className={styles.sceneTwoCloseButton}
                          onClick={closeSceneTwoPanel}
                          aria-label="Закрыть консоль"
                        >
                          ×
                        </button>
                      </div>
                      <div ref={sceneTwoTerminalLogRef} className={styles.sceneTwoFixedLog}>
                        {sceneTwoTerminalLines.length === 0 ? (
                          <p className={styles.sceneTwoFixedCommand}>C:\\brain&gt; <span className={styles.sceneTwoCursor}>_</span></p>
                        ) : null}
                        {sceneTwoTerminalLines.map((line, lineIndex) => (
                          <p
                            key={`${line}-${lineIndex}`}
                            className={`${styles.sceneTwoFixedLineText} ${
                              line.trimStart().startsWith("C:\\brain>") || line.trimStart().startsWith(">")
                                ? styles.sceneTwoFixedLineTextCommand
                                : ""
                            } ${
                              line.trimStart().startsWith("C:\\brain>")
                                ? styles.sceneTwoFixedPromptLine
                                : ""
                            } ${
                              line.toLowerCase().includes("все исправно")
                                ? styles.sceneTwoFixedLineTextOk
                                : ""
                            }`}
                          >
                            {line}
                            {lineIndex === sceneTwoTerminalLines.length - 1 ? (
                              <span className={styles.sceneTwoCursor}>_</span>
                            ) : null}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Canvas
                    className={styles.sceneModelCanvas}
                    dpr={sceneTwoCanvasDpr}
                    frameloop={activeScene === 1 ? "always" : "never"}
                    camera={{ position: [0, 0.2, 3.3], fov: 34 }}
                    gl={{ antialias: true, powerPreference: "default" }}
                  >
                    <ambientLight intensity={0.9} />
                    <directionalLight position={[2.5, 3, 2]} intensity={1.4} />
                    <directionalLight position={[-2.5, -1.5, -2]} intensity={0.4} />
                    <Suspense fallback={null}>
                      <BrainHologramModel
                        selectedHotspotId={sceneTwoSelectedHotspot}
                      />
                      <OrbitControls
                        makeDefault
                        target={sceneTwoOrbitTarget}
                        enableRotate
                        enablePan={false}
                        enableZoom={false}
                        enableDamping
                        dampingFactor={0.15}
                        rotateSpeed={0.22}
                        minDistance={2.2}
                        maxDistance={6}
                      />
                    </Suspense>
                  </Canvas>
                </div>
              ) : null}
              {index === 0 && shouldRenderHeavyScene ? (
                <>
                  <p
                    ref={(node) => {
                      bannerRefs.current[index] = node;
                    }}
                    className={styles.scrollBanner}
                  >
                    ВЕЛИКИЙ ХОУБИСТ
                  </p>
                  <p
                    ref={(node) => {
                      secondaryBannerRefs.current[index] = node;
                    }}
                    className={styles.scrollBannerSecondary}
                  >
                    Мэр города Курска
                  </p>
                  <p
                    ref={(node) => {
                      tertiaryBannerRefs.current[index] = node;
                    }}
                    className={styles.scrollBannerTertiary}
                  >
                    SLAY KING
                  </p>
                  <img
                    ref={(node) => {
                      cupRefs.current[index] = node;
                    }}
                    className={styles.cupBackdrop}
                    src={encodeURI("/assets/icons/cup.png")}
                    alt=""
                    aria-hidden="true"
                  />
                  <video
                    ref={(node) => {
                      cupSwapVideoRefs.current[index] = node;
                    }}
                    className={styles.cupBackdropSwap}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    aria-hidden="true"
                  >
                    <source src={encodeURI("/assets/bg/глеб_слей_сцена1.webm")} type="video/webm" />
                  </video>
                  <div
                    ref={(node) => {
                      cupSwapDimRefs.current[index] = node;
                    }}
                    className={styles.cupSwapDim}
                    aria-hidden="true"
                  />
                  <p
                    ref={(node) => {
                      quaternaryBannerRefs.current[index] = node;
                    }}
                    className={styles.scrollBannerQuaternary}
                  >
                    2025
                  </p>
                </>
              ) : null}
            </article>;
          })}
        </div>
      </div>

      <div
        className={`${styles.progressDock} ${isStoryActive && activeScene <= 2 ? styles.progressDockVisible : ""}`}
        aria-hidden="true"
      >
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${displayedProgress * 100}%` }} />
          {STORY_SCENES.map((scene, index) => (
            <span
              key={scene.id}
              className={`${styles.progressStep} ${index <= activeScene ? styles.progressStepActive : ""}`}
              style={{ left: `${sceneStepPositions[index] ?? 0}%` }}
            />
          ))}
        </div>
      </div>

      <div
        className={`${styles.storySceneNav} ${
          storyButtonNavigationVisible ? styles.storySceneNavVisible : ""
        }`}
      >
        <button
          type="button"
          className={`${styles.storySceneNavButton} ${styles.storySceneNavButtonUp} ${
            canGoToPreviousScene ? styles.storySceneNavButtonVisible : styles.storySceneNavButtonHidden
          }`}
          onClick={() => moveToStoryScene(activeScene - 1)}
          disabled={!canGoToPreviousScene}
          aria-hidden={!canGoToPreviousScene}
          tabIndex={canGoToPreviousScene ? 0 : -1}
        >
          <span className={styles.storySceneNavArrow} aria-hidden="true">↑</span>
          <span>Назад</span>
        </button>

        <button
          type="button"
          className={`${styles.storySceneNavButton} ${
            canGoToNextScene ? styles.storySceneNavButtonVisible : styles.storySceneNavButtonHidden
          }`}
          onClick={() => moveToStoryScene(activeScene + 1)}
          disabled={!canGoToNextScene}
          aria-hidden={!canGoToNextScene}
          tabIndex={canGoToNextScene ? 0 : -1}
        >
          <span>Далее</span>
          <span className={styles.storySceneNavArrow} aria-hidden="true">↓</span>
        </button>
      </div>
    </section>
  );
}
