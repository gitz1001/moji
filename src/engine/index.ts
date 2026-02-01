export { useTypingEngine } from './useTypingEngine';
export { generateWords } from './textGenerator';
export { calculateMetrics } from './metrics';
export { calculateConsistency } from './consistency';
export { generateInsight } from './insights';
export { generateWeaknessWords, calculateTargetPace } from './drills';
export type {
    EngineState,
    EngineSnapshot,
    TypingMetrics,
    WordState,
    EngineConfig,
    KeystrokeEvent,
    ErrorEvent,
    ConsistencyMetrics,
    Insight,
    DrillMode,
} from './types';
