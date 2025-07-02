export type Stimulus = {
    id: number;
    letter: string;   // A–Z
    audio?: HTMLAudioElement;
  };
  
  export interface GameSettings {
    n: number;
    total: number;
    paceMs: number;   // time per stimulus
    useAudio: boolean;
  }
  