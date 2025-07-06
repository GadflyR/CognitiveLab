/* NBackGame.tsx ----------------------------------------------------- */
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import { useInterval } from "../hooks/useInterval";
import { ProgressBar } from "./ProgressBar";
import { GameSettings } from "../types";

/* ---------- types ---------- */
export interface GameStats { hits:number; missed:number; attempts:number; accuracy:number; }
export interface NBackGameProps { settings:GameSettings; onFinish:(s:GameStats)=>void; }
interface Stimulus { id:number; letter:string; }

/* ---------- constants ---------- */
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const MATCH_RATE = 0.35;
const TUTORIAL = ["R","A","R","E","E"] as const; // 5-letter demo
const TUT_PACE_MS = 5000;

type Phase = "tut" | "confirm" | "ready" | "game";

export const NBackGame:React.FC<NBackGameProps> = ({ settings, onFinish }) => {
  /* --------------- phase & indices --------------- */
  const [phase,setPhase] = useState<Phase>("tut");
  const [tIdx,setTIdx]   = useState(-1);          // tutorial pointer
  const [idx,setIdx]     = useState(-1);          // main-game pointer
  const [readyCnt,setReadyCnt] = useState(3);     // 3-2-1

  /* --------------- game stats --------------- */
  const [hits,setHits] = useState(0);
  const [missed,setMissed] = useState(0);
  const [attempts,setAttempts] = useState(0);
  const pressed = useRef<Set<number>>(new Set());
  const [flash,setFlash] = useState<"none"|"press"|"hit"|"miss">("none");

  const [tutFb, setTutFb] =
  useState<null | { msg: string; color: "green" | "red" }>(null);
  /* fade-out timer */
  useEffect(() => {
    if (!tutFb) return;
    const t = setTimeout(() => setTutFb(null), 600);
    return () => clearTimeout(t);
  }, [tutFb]);

  /* --------------- random stream --------------- */
  const stream = useMemo<Stimulus[]>(() => {
    const out:Stimulus[]=[];
    for(let i=0;i<settings.total;i++){
      if(i<settings.n){
        out.push({id:i,letter:ALPHA[Math.floor(Math.random()*ALPHA.length)]});
        continue;
      }
      if(Math.random()<MATCH_RATE){
        out.push({id:i,letter:out[i-settings.n].letter});
      }else{
        let l=ALPHA[Math.floor(Math.random()*ALPHA.length)];
        while(l===out[i-settings.n].letter) l=ALPHA[Math.floor(Math.random()*ALPHA.length)];
        out.push({id:i,letter:l});
      }
    }
    return out;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  /* --------------- master ticker (paused in 'ready') --------------- */
  useInterval(()=>{
    if(phase==="tut")      setTIdx(i=>i+1);
    else if(phase==="game")setIdx(i=>i+1);
  },
  phase==="tut"  && tIdx < TUTORIAL.length      ? TUT_PACE_MS :
  phase==="game" && idx  < settings.total       ? settings.paceMs : null);

  /* --------------- after tutorial done → ready splash --------------- */
  useEffect(()=>{
    if(phase==="tut" && tIdx===TUTORIAL.length){
      setPhase("confirm"); setReadyCnt(3);
    }
  },[phase,tIdx]);

  /* --------------- ready-countdown timer --------------- */
  useInterval(()=>{
    if(phase!=="ready") return;
    setReadyCnt(c=>{
      if(c<=1){ setPhase("game"); setIdx(-1); return 0; }
      return c-1;
    });
  }, phase==="ready" ? 1000 : null);

  /* --------------- speech (both phases) --------------- */
  const say = (l:string)=>{
    if(!settings.useAudio) return;
    const u=new SpeechSynthesisUtterance(l); u.lang="en-US";
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  };
  useEffect(()=>{
    if(phase==="tut"  && tIdx>=0 && tIdx<TUTORIAL.length)  say(TUTORIAL[tIdx]);
    if(phase==="game" && idx >=0 && idx < stream.length)   say(stream[idx].letter);
  },[phase,tIdx,idx,settings.useAudio,stream]);

  /* --------------- missed detection (game only) --------------- */
  useEffect(()=>{
    if(phase!=="game") return;
    const p=idx-1;
    if(p<settings.n) return;
    if(p>=0 && p<stream.length){
      const wasMatch=stream[p].letter===stream[p-settings.n].letter;
      if(wasMatch && !pressed.current.has(p)) setMissed(m=>m+1);
    }
  },[phase, tIdx, idx, settings.n, stream]);

  /* --------------- flash reset --------------- */
  useEffect(()=>{ if(flash==="none") return;
    const t=setTimeout(()=>setFlash("none"),200); return()=>clearTimeout(t);
  },[flash]);

  /* --------------- key handler --------------- */
  const handleKey = useCallback((e:KeyboardEvent)=>{
    if(e.code!=="Space") return;

    /* ---------- TUTORIAL ---------- */
    if (phase === "tut") {
        /* pressing during first two letters: always “wrong” */
        if (tIdx < settings.n) {
          setFlash("miss");
          setTutFb({ msg: "Too early – just watch!", color: "red" });
          return;
        }
        const isMatch = TUTORIAL[tIdx] === TUTORIAL[tIdx - settings.n];
        setFlash(isMatch ? "hit" : "miss");
        setTutFb(
          isMatch
            ? { msg: "✅ Correct!",  color: "green" }
            : { msg: "❌ Not a match", color: "red" }
        );
        return;                       /* tutorial never logs stats */
      }
  
    /* ---------- REAL GAME ---------- */
    if(idx<settings.n){ setFlash("press"); return; }
    /* already handled this letter? → ignore further presses            */
    if (pressed.current.has(idx)) {
      setFlash("press");          // small visual nudge but no scoring
      return;
    }
    
    pressed.current.add(idx); setAttempts(a=>a+1);
    const match=stream[idx].letter===stream[idx-settings.n].letter;
    if(match){ setHits(h=>h+1); setFlash("hit"); }
    else      { setFlash("miss"); }
  },[phase, tIdx, idx, settings.n, stream]);
  useEffect(()=>{
    window.addEventListener("keydown",handleKey);
    return()=>window.removeEventListener("keydown",handleKey);
  },[handleKey]);

  /* --------------- finish --------------- */
  useEffect(()=>{
    if(phase!=="game"||idx!==settings.total) return;
    const last=idx-1;
    if(last>=settings.n){
      const wasMatch=stream[last].letter===stream[last-settings.n].letter;
      if(wasMatch && !pressed.current.has(last)) setMissed(m=>m+1);
    }
    const accuracy = attempts ? hits/attempts : 0;
    onFinish({hits,missed,attempts,accuracy});
  },[phase,idx,settings,hits,missed,attempts,onFinish,stream]);

  /* --------------- helpers --------------- */
  const curLetter =
    phase==="tut"
      ? (tIdx>=0&&tIdx<TUTORIAL.length ? TUTORIAL[tIdx] : "–")
      : (idx >=0&&idx <stream.length   ? stream[idx].letter : "–");

  const ringCls =
    flash==="hit" ?"ring-8 ring-lime-400 ring-offset-2":
    flash==="miss"?"ring-8 ring-rose-400 ring-offset-2":"";
  const pressCls = flash==="press"?"scale-90":"scale-100";

  /* tutorial hint text (large) */
  let tutText: string | null = null;
  if(phase==="tut" && tIdx>=0 && tIdx<TUTORIAL.length){
    if(tIdx<settings.n) tutText="Watch carefully. No key press yet.";
    else if(TUTORIAL[tIdx]===TUTORIAL[tIdx-settings.n])
      tutText=`Press Space now, because the letter is ${TUTORIAL[tIdx]} and `+
              `two steps back it was also ${TUTORIAL[tIdx]}!`;
    else tutText="Do not press – this is not a match.";
  }

  {phase === "tut" && tutFb && (
    <p className={`text-3xl font-extrabold ${tutFb.color === "green"
          ? "text-lime-600" : "text-rose-600"}`}>
      {tutFb.msg}
    </p>
  )}

  /* --------------- UI --------------- */
  return (
    <div className="glass-card w-full max-w-xl space-y-8">

      {/* header line */}
      <p className="text-center text-sm text-gray-600">
        {phase==="tut" ? "Tutorial – n = 2" :
         phase==="ready" ? "Get ready…" :
         <>Hit <kbd className="kbd">Space</kbd> when the current letter equals the one <b>n = 2</b> back.</>}
      </p>

      {/* ───────── Current + history (tutorial only) ───────── */}
      <div className={`flex items-center justify-center gap-8 transition-transform duration-150 ${pressCls} ${ringCls}`}>

      {/* LEFT: horizontal queue of previous letters – tutorial only */}
      {phase === "tut" && (
        <div className="flex flex-col items-center mr-2">
          <p className="text-xs text-gray-500 mb-1 tracking-wide">
            previous&nbsp;letters
          </p>

          <ul className="flex space-x-2">
            {/* show letters already passed, oldest on the left  */}
            {TUTORIAL.slice(0, Math.max(tIdx, 0)).map((l, i) => (
              <li key={i}
                  className="w-10 h-10 flex items-center justify-center
                            rounded-md bg-gray-100 font-semibold text-lg
                            text-indigo-700 shadow">
                {l}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* RIGHT: current stimulus */}
      <span className="select-none text-[10rem] font-extrabold tracking-widest
                      bg-gradient-to-br from-indigo-500 to-fuchsia-600 bg-clip-text
                      text-transparent drop-shadow-[0_5px_15px_rgba(99,102,241,0.45)]
                      animate-pulse">
        {curLetter}
      </span>
</div>

      {/* progress bar: tutorial(20%) + game(80%) */}
      <ProgressBar value={
        phase==="tut"   ? (Math.min(tIdx+1,TUTORIAL.length)/TUTORIAL.length)*0.2 :
        phase==="ready" ? 0.2 :
        0.2 + (Math.min(idx+1,settings.total)/settings.total)*0.8 }/>

      {/* tutorial hint */}
      {phase==="tut" && tutText &&
        <p className="text-center text-indigo-700 font-bold text-xl md:text-2xl">{tutText}</p>}

      {/* confirmation overlay ─ ask user */}
      {phase === "confirm" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center
                        bg-white/90 backdrop-blur-sm rounded-3xl p-6 space-y-6">
          <h3 className="text-2xl font-extrabold text-indigo-700">
            Tutorial finished!
          </h3>
          <p className="text-center text-gray-700 max-w-xs">
            In the real test the letters will appear <b>much faster&nbsp;(1.5&nbsp;s)</b> and
            the queue of previous letters will <b>disappear</b>.<br/>
            Would you like to play the tutorial again or start the real test?
          </p>

          <div className="flex gap-4">
            {/* repeat tutorial */}
            <button
              onClick={() => { setTIdx(-1); setPhase("tut"); }}
              className="rounded-full bg-gray-200 px-6 py-3 font-semibold text-gray-700 shadow">
              Play tutorial again
            </button>

            {/* go to ready-countdown */}
            <button
              onClick={() => { setReadyCnt(3); setPhase("ready"); }}
              className="rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white shadow hover:bg-indigo-700">
              Start real test
            </button>
          </div>
        </div>
      )}

      {/* ready overlay */}
      {phase==="ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl">
          <p className="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-4">
            Real test starts in
          </p>
          <p className="text-7xl md:text-8xl font-extrabold text-fuchsia-600">
            {readyCnt}
          </p>
        </div>
      )}

      {/* game stats */}
      {phase==="game" && (
        <div className="grid grid-cols-4 gap-6 text-center">
          <Stat label="Hits" value={hits}/>
          <Stat label="Missed" value={missed}/>
          <Stat label="Attempts" value={attempts}/>
          <Stat label="Index" value={Math.max(idx+1,0)}/>
        </div>
      )}
    </div>
  );
};

const Stat:React.FC<{label:string;value:number}> = ({label,value})=>(
  <div className="space-y-1">
    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
    <p className="text-lg font-semibold text-gray-800">{value}</p>
  </div>
);
