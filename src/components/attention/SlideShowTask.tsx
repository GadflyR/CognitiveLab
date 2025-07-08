import React, { useState, useRef, useEffect } from "react";

/* ---------- slide data (longer bodies) ---------- */
interface Slide { title: string; body: string; }

const SLIDES: Slide[] = [
  {
    title: "Working Memory",
    body:
      `Working memory acts as the brain’s temporary scratch-pad, storing and manipulating small chunks of information in real time. It allows you to retain phone numbers long enough to dial them, or to keep the beginning of a sentence active in mind until you finish reading it. Since its capacity is limited to just a few items, we rely on chunking strategies—grouping bits of data into larger units—and rehearsal—silent repetition—to manage complex tasks. Enhancing working memory through targeted exercises can boost reasoning, problem-solving, and decision-making in everyday life. You’ll often notice it when you juggle multiple numbers or ideas in your head simultaneously.`
  },
  {
    title: "Selective Attention",
    body:
      `Selective attention enables us to focus on relevant stimuli amid a sea of distractions. When you hear your name called in a noisy café, or spot a red apple among green pears, selective attention has filtered out competing inputs. This process engages frontal and parietal brain regions, boosting neural signals for target features while dampening distractors. Over time, we learn to refine this filter—through training, mindfulness, or experience—so that our attention hones in more quickly on what matters and ignores what does not. This skill underpins everything from classroom learning to air-traffic control.`
  },
  {
    title: "Sustained Attention",
    body:
      `Sustained attention, or vigilance, is the capacity to maintain focus on a single task over prolonged periods. Professions such as air-traffic control, proofreading, and competitive sports demand exceptional vigilance to avoid costly errors. However, mental fatigue, circadian rhythms, and motivation levels deeply influence how long we can sustain attention without lapses. Research shows that breaks, task variation, and environmental adjustments—like lighting and noise control—help extend our vigilant window. Cultivating sustained attention also enhances endurance in learning, long-distance driving, and extended problem-solving sessions.`
  },
  {
    title: "Cognitive Load",
    body:
      `Cognitive load refers to the total amount of mental effort required to process information at any given time. When we attempt to process too many elements simultaneously, our limited working-memory capacity becomes overwhelmed, leading to errors and slowed performance. Instructional designers mitigate this by segmenting complex content into smaller, manageable units and using visual aids to reduce extraneous load. By balancing intrinsic, extraneous, and germane loads, learners can effectively integrate new material without overtaxing their mental resources. Understanding cognitive load theory empowers you to structure learning and work tasks for maximum efficiency.`
  },
  {
    title: "The Role of Sleep",
    body:
      `Sleep is far from idle—it is a critical period for memory consolidation and brain restoration. During slow-wave sleep, the hippocampus replays the day’s experiences, transferring facts and events into long-term storage, while REM sleep supports procedural skill refinement and emotional regulation. Chronic sleep deprivation disrupts these processes, impairing attention, learning, and mood stability. Optimal cognitive performance relies on maintaining consistent sleep schedules, creating a restful environment, and aligning sleep with natural circadian rhythms. Investing in quality sleep yields significant returns in daily focus, creativity, and resilience.`
  },
  {
    title: "Mind-Wandering",
    body:
      `Mind-wandering occurs when thoughts drift away from the current task, often occupying up to half of our waking hours. While spontaneous mind-wandering can spark creativity and problem-solving by connecting disparate ideas, it also correlates with reduced comprehension and increased errors during demanding tasks. Studies find that brief mindfulness or attentional-focus exercises can curb unintentional drift and restore on-task performance. By practicing moment-to-moment awareness, individuals learn to recognize and redirect their wandering thoughts, thereby improving concentration and task completion.`
  },
  {
    title: "Practice & Plasticity",
    body:
      `Deliberate practice drives neuroplastic changes, physically remodeling synaptic connections through repetition and feedback. Long-term potentiation strengthens frequently used pathways, while unused connections weaken or prune away. Over weeks and months, these structural changes expand grey matter in regions relevant to trained skills—taxi drivers develop larger hippocampal maps for navigation, and musicians refine auditory and motor cortex networks. Setting clear goals, obtaining timely feedback, and maintaining focused repetition are key ingredients for harnessing brain plasticity and achieving expertise.`
  },
  {
    title: "Phasic Alertness",
    body:
      `Phasic alertness describes brief surges in arousal and readiness triggered by warning cues—such as a flash or beep—just before an expected event. This transient boost, mediated by the locus coeruleus–norepinephrine system, sharpens sensory processing and accelerates reaction times. Phasic alertness is critical in contexts requiring rapid responses, like emergency driving or athletic start signals. Proper training can enhance phasic responsiveness, while fatigue and chronic stress diminish it, underscoring the importance of rest and recovery in high-stakes environments.`
  },
  {
    title: "Divided Attention",
    body:
      `Divided attention allows us to juggle multiple tasks by splitting cognitive resources, but it comes at a cost: performance on each task typically declines when demands exceed capacity. Dual-task experiments—such as talking on the phone while driving—illustrate this interference effect. Brain imaging reveals that simultaneous tasks compete for overlapping neural networks, leading to slower responses and increased error rates. Strategies like task scheduling, automation of routine tasks, and minimizing distractions can reduce the burden of divided attention and enhance multitasking efficiency.`
  },
  {
    title: "Attentional Blink",
    body:
      `The attentional blink phenomenon occurs when two target stimuli appear in rapid succession: the second often goes undetected if it follows the first within 200–500 milliseconds. This blink reflects a temporary bottleneck in our capacity for conscious awareness and serial processing. Understanding this window of non-awareness helps designers space critical alerts in high-pressure contexts, such as air traffic notifications or medical monitoring systems. Training and stimulus predictability can slightly mitigate the attentional blink, improving temporal selection under rapid conditions.`
  },
  {
    title: "Change Blindness",
    body:
      `Change blindness describes our failure to notice large changes in a visual scene when they coincide with a brief disruption—like a flicker or eye movement. It underscores our reliance on focused attention and memory for detecting alterations. Experiments reveal that even obvious scene modifications—such as removing a prominent object—can go unnoticed without proper attention allocation. Applications range from user-interface testing to surveillance monitoring, emphasizing the need for salient cues and minimal visual interruptions to ensure critical changes are perceived.`
  },
  {
    title: "Automaticity",
    body:
      `Through extensive practice, tasks can become automatic—requiring little conscious effort and freeing up attentional resources for other activities. Skilled typing, driving familiar routes, or playing a well-practiced instrument illustrate automaticity at work. While automatic processes boost efficiency and speed, they lack flexibility when novel or complex situations arise. Balancing repetition with intermittent variation helps maintain adaptability alongside automatic execution, ensuring that skilled behaviors can adjust to changing demands.`
  },
  {
    title: "Executive Attention",
    body:
      `Executive attention—governed by prefrontal cortex networks—oversees goal-directed behaviors, conflict resolution, and error monitoring. It allows us to inhibit distractions, switch between tasks, and update working-memory content based on shifting objectives. Deficits in executive attention manifest as impulsivity and poor decision-making in conditions like ADHD and frontal-lobe injury. Enhancing this system involves designing tasks with clear goals, frequent feedback, and opportunities for strategic planning and self-monitoring.`
  },
  {
    title: "Goal-Directed Attention",
    body:
      `Goal-directed attention is the top-down process by which current intentions and objectives bias perceptual systems toward relevant information. Maintaining task goals in working memory enables selective filtering of incoming stimuli aligned with those goals. For example, searching for a friend in a crowd relies on memorized facial features to guide attention. Training in goal-setting, visualization, and implementation intentions can strengthen this biasing mechanism, improving focus on pertinent cues and reducing susceptibility to distraction.`
  },
  {
    title: "Stimulus-Driven Attention",
    body:
      `Stimulus-driven attention operates in a bottom-up manner, capturing focus involuntarily in response to salient or unexpected events—like a sudden movement or loud noise. This mechanism is vital for survival, enabling rapid orientation toward potential threats or opportunities. However, in modern environments, irrelevant stimuli often hijack our attention, impeding task performance. Understanding the balance between top-down goals and bottom-up capture helps in designing environments and interfaces that minimize unwanted interruptions.`
  },
  {
    title: "Emotional Attention",
    body:
      `Emotional attention prioritizes processing of emotionally charged stimuli—such as faces expressing fear or joy—over neutral information. Neural circuits involving the amygdala and prefrontal cortex collaborate to bias attention toward cues with survival or social relevance. While this enhances detection of threats and rewards, excessive emotional capture can lead to fixation on negative or anxiety-provoking stimuli. Techniques like cognitive reappraisal and attentional training help regulate emotional attention, promoting resilience and balanced focus.`
  },
  {
    title: "Novelty Detection",
    body:
      `Detecting novel or deviant stimuli in our environment triggers the orienting response, reallocating attention to analyze unfamiliar elements. This mechanism relies on fronto-parietal networks and midbrain dopaminergic pathways, fostering learning and adaptation. Novelty detection signals us to update mental models and explore new opportunities. However, excessive novelty-seeking can fragment attention, so mindfulness and task structuring can help maintain focus while remaining open to important new information.`
  },
  {
    title: "Threat Detection",
    body:
      `Rapid threat detection is an evolutionarily conserved function, engaging fear circuits and sensory areas to flag potential danger. Amygdalar activation amplifies sensory processing and primes the body for fight-or-flight responses. While acute threat detection enhances survival, chronic hypervigilance underlies anxiety and stress disorders. Balanced exposure therapy, stress management, and environmental design can help recalibrate threat-detection systems for optimal performance without undue alertness.`
  },
  {
    title: "Resource Allocation",
    body:
      `Attention can be conceptualized as the allocation of limited cognitive resources among competing tasks and stimuli. Capacity and bottleneck theories model how these resources are pooled and distributed. Under high demand, tasks compete for shared neural substrates, leading to performance trade-offs. Techniques such as task prioritization, timeboxing, and cognitive offloading help manage resource allocation effectively, ensuring that critical tasks receive sufficient attentional investment.`
  },
  {
    title: "Attentional Networks",
    body:
      `Three core attentional networks—alerting, orienting, and executive control—coordinate different facets of attention. The alerting network modulates arousal, the orienting network shifts focus, and the executive network resolves conflicts and manages goals. Functional connectivity and dynamic interactions among these networks enable flexible adaptation to task demands. Training interventions, such as targeted cognitive exercises and neurofeedback, can selectively enhance specific networks for improved overall attention.`
  },
  {
    title: "Default Mode Network",
    body:
      `The default mode network (DMN) activates during rest, introspection, and mind-wandering, exhibiting anti-correlation with task-positive attention networks. While DMN engagement supports creativity and autobiographical memory, abrupt shifts into DMN during tasks cause lapses in focus. Understanding the push-pull between the DMN and attentional networks informs strategies for maintaining on-task engagement, such as scheduled breaks, mindfulness practice, and environmental cues to prompt reorientation.`
  },
  {
    title: "Prefrontal Cortex & Attention",
    body:
      `The dorsolateral prefrontal cortex (DLPFC) orchestrates complex attentional control by integrating working-memory content with sensory inputs and task goals. Lesions to this area impair goal maintenance and flexible switching between tasks. Functional imaging shows DLPFC activation during tasks requiring inhibition and strategic planning. Cognitive training that emphasizes goal management, mental set shifting, and response inhibition can strengthen DLPFC circuits, enhancing top-down attentional control.`
  },
  {
    title: "Locus Coeruleus & Arousal",
    body:
      `The locus coeruleus (LC) is the brain’s primary source of noradrenaline, regulating global arousal and attention levels. Tonic LC activity sets baseline alertness, while phasic bursts rapidly enhance responsiveness to salient stimuli. This modulatory system optimizes signal-to-noise ratios in cortical processing, improving both detection and discrimination capabilities. Dysregulation of LC-noradrenergic signaling is implicated in ADHD and mood disorders, highlighting the importance of balanced arousal for attention.`
  },
  {
    title: "Neurotransmitters in Attention",
    body:
      `Neurotransmitters such as dopamine, noradrenaline, and acetylcholine play pivotal roles in modulating attention and cognitive flexibility. Dopamine supports reward-based learning and working-memory maintenance, noradrenaline adjusts arousal and vigilance, and acetylcholine sharpens sensory tuning and attentional focus. Pharmacological studies illustrate how agonists and antagonists affect these systems, offering insights into treatments for attention-related disorders like ADHD and Alzheimer’s disease.`
  },
  {
    title: "Attentional Disorders",
    body:
      `Disorders such as ADHD, traumatic brain injury, and neglect syndrome involve dysregulation across attentional networks and neurotransmitter systems. Symptoms include distractibility, impulsivity, and difficulty sustaining focus. Diagnostic assessments measure reaction times, vigilance, and error rates under varying loads. Treatment approaches combine medication—such as stimulants targeting dopaminergic and noradrenergic pathways—with behavioral interventions, cognitive training, and environmental modifications to support attentional stability.`
  },
  {
    title: "Meditation & Attention",
    body:
      `Mindfulness meditation trains sustained and executive attention by cultivating nonjudgmental awareness of present-moment experience. Regular practice enhances neural markers of attentional control, such as increased fronto-parietal connectivity and reduced default-mode network intrusion. Studies show meditators exhibit fewer lapses in vigilance tasks and better conflict resolution. Incorporating short mindfulness breaks into high-demand workflows can improve focus, emotional regulation, and resilience to stress.`
  },
  {
    title: "Stress & Attention",
    body:
      `Acute stress triggers a narrowing of attention toward threat-related cues, driven by increased cortisol and adrenaline release. While beneficial for immediate survival, chronic stress impairs prefrontal function and cognitive flexibility, leading to burnout and attention deficits. Stress management techniques—like controlled breathing, time management, and social support—help regulate physiological responses and preserve attentional capacity during prolonged challenges.`
  },
  {
    title: "Nutrition & Attention",
    body:
      `Nutritional factors, including glucose levels, omega-3 fatty acids, and micronutrients like iron and zinc, influence cognitive performance and attentional stamina. Stable blood sugar supports sustained focus, while deficiencies in key nutrients correlate with increased mind-wandering and fatigue. Balanced meals with low-glycemic carbohydrates, lean proteins, and healthy fats provide the energy and building blocks required for optimal brain function and attentional control throughout the day.`
  },
  {
    title: "Exercise & Attention",
    body:
      `Physical exercise enhances attention by increasing cerebral blood flow, promoting neurotrophic factors like BDNF, and regulating neurotransmitter systems. Both acute aerobic workouts and long-term fitness training yield improvements in reaction time, executive function, and working-memory capacity. Incorporating brief exercise breaks—such as walks or stretching—into sedentary tasks can combat mental fatigue and restore attentional resources for improved productivity.`
  }
];

/* ---------- helper: 5-number summary ---------- */
const fiveNumber = (arr: number[]) => {
  const a = [...arr].sort((x, y) => x - y);
  const q = (p: number) => {
    const idx = (a.length - 1) * p;
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    return lo === hi ? a[lo] : a[lo] + (a[hi] - a[lo]) * (idx - lo);
  };
  return { min: a[0], q1: q(0.25), med: q(0.5), q3: q(0.75), max: a[a.length-1] };
};

/* ---------- component ---------- */
export interface SlideStats { times: number[]; score: number; }

export const SlideShowTask: React.FC<{ onFinish: (s: SlideStats) => void; hideScore?: boolean; }> = ({ onFinish, hideScore }) => {
  const [idx, setIdx]   = useState(0);
  const [done, setDone] = useState<SlideStats | null>(null);
  const [showTut, setShowTut] = useState(true);

  const timesRef = useRef<number[]>([]);
  const startRef = useRef(performance.now());

  const MIN_CLICK = 1000;                      // ms – too-rushed threshold

  useEffect(() => {
    if (hideScore && done) onFinish(done)
  }, [done, hideScore, onFinish])

  /* ---------- advance / finish ---------- */
  const next = () => {
    const now = performance.now();
    timesRef.current.push(now - startRef.current);
    startRef.current = now;

    if (idx + 1 < SLIDES.length) {
      setIdx(i => i + 1);
    } else {
      const t   = timesRef.current;
      const mid = Math.floor(t.length / 2);
      const avg = (xs:number[]) => xs.reduce((s,v)=>s+v,0) / xs.length;

      const mean   = avg(t);
      const delta  = avg(t.slice(mid)) - avg(t.slice(0, mid));
      const rel    = delta / mean;                   // proportion slower
      const consist= Math.max(0, Math.min(100, 100 - rel * 120)); // gentler

      const factor =
        mean >= 2000 ? 1 :
        mean <= 1000 ? 0.2 :
        0.2 + 0.8 * ((mean - 1000) / 1000);

      const penalty = t.some(ms => ms < MIN_CLICK) ? 0.5 : 1;
      const score   = Math.round(consist * factor * penalty);

      setDone({ times: t, score });
    }
  };

  /* ---------- RESULT SCREEN ---------- */
  if (done && !hideScore) {
    const stats = fiveNumber(done.times);
    return (
      <div className="flex flex-col items-center gap-8 max-w-2xl bg-white/80 p-10 rounded-3xl shadow-lg">
        <h2 className="text-2xl font-extrabold text-indigo-700">Attention Score</h2>
        <p className="text-5xl font-bold text-indigo-600">{done.score}</p>

        <table className="text-sm text-left">
          <thead>
            <tr><th className="pr-4">Slide</th><th>Time (ms)</th></tr>
          </thead>
          <tbody>
            {done.times.map((ms,i)=>(
              <tr key={i}><td className="pr-4">{i+1}</td><td>{Math.round(ms)}</td></tr>
            ))}
          </tbody>
        </table>

        {/* 5-number summary */}
        <div className="mt-6 w-full max-w-sm">
          <h3 className="font-semibold text-indigo-700 mb-2">5-Number Summary</h3>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {[
              "Min","Q1","Median","Q3","Max"
            ].map(lbl=>(
              <span key={lbl} className="font-medium">{lbl}</span>
            ))}
            {[
              stats.min, stats.q1, stats.med, stats.q3, stats.max
            ].map((v,i)=>(<span key={i}>{Math.round(v)}</span>))}
          </div>
        </div>

        <button
          onClick={()=>onFinish(done)}
          className="rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white shadow hover:bg-indigo-700">
          Back to menu
        </button>
      </div>
    );
  }

  /* ---------- TUTORIAL OVERLAY ---------- */
  const Tutorial = () => (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4 backdrop-blur">
      <div className="relative w-full max-w-md space-y-6 rounded-3xl bg-white p-8 shadow-2xl">
        <button onClick={()=>setShowTut(false)}
          className="absolute right-4 top-4 text-xl font-bold text-gray-400 hover:text-gray-600">×</button>

        <div className="text-center space-y-4">
          <div className="text-5xl">🖼️</div>
          <h3 className="text-2xl font-bold text-indigo-700">Slide-Show Attention</h3>
          <p className="text-gray-700">
            Read each slide carefully. Your score rewards <em>consistent focus</em>{' '}
            across slides and penalises rushed clicks.
          </p>
        </div>

        <button
          onClick={()=>setShowTut(false)}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700">
          Start
        </button>
      </div>
    </div>
  );

  /* ---------- SLIDE VIEW ---------- */
  const slide = SLIDES[idx];
  return (
    <div className="flex flex-col items-center gap-12 max-w-2xl bg-white/80 p-10 rounded-3xl shadow-lg">
      <div className="space-y-6 text-left">
        <h2 className="text-2xl font-bold text-indigo-700">{slide.title}</h2>
        <p className="leading-relaxed text-gray-800 whitespace-pre-wrap">{slide.body}</p>
      </div>

      <button
        onClick={next}
        className="rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white shadow hover:bg-indigo-700">
        {idx + 1 < SLIDES.length ? "Next" : "Finish"}
      </button>

      {showTut && <Tutorial />}
    </div>
  );
};
