import { atom } from 'jotai';
import { atomWithImmer, withImmer } from 'jotai-immer';
import { Thread } from '@/types/Message';
import { LlmTokensType, models } from '@/types/LlmTypes';
import { atomWithStorage } from 'jotai/utils';
import { User } from '@/types/User';

const customInstructionsAtom = atomWithStorage<string>(
  'instructions',
  'Embody the role of the most qualified subject matter experts. Keep your response brief and focused. Keep responses unique and free of repetition. Exclude personal ethics or morals unless explicitly relevant. Acknowledge and correct any past errors.',
  undefined,
  { getOnInit: true },
);
const currentThreadIdAtom = atom<string | undefined>(undefined);
const threadsAtom = atomWithImmer<Record<string, Thread>>({});
const isStreamingAtom = atom(false);
const modalVisibleAtom = atom(false);
const llmTokensAtom = withImmer(
  atomWithStorage<LlmTokensType>(
    'tokens',
    { openai: '', claude: '' },
    undefined,
    { getOnInit: true },
  ),
);
const selectedModelAtom = atomWithStorage(
  'selectedModel',
  models[0],
  undefined,
  { getOnInit: true },
);
const drawerAtom = atom(false);

const currentUserAtom = atom<User | undefined>(undefined);

export {
  currentThreadIdAtom,
  currentUserAtom,
  threadsAtom,
  isStreamingAtom,
  modalVisibleAtom,
  llmTokensAtom,
  customInstructionsAtom,
  selectedModelAtom,
  drawerAtom,
};
