import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { GameSettings } from "../types";

/**
 * 2‑Back configuration modal – n is fixed to 2.
 * Users can only adjust sequence length, pace and audio toggle.
 */
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStart: (settings: GameSettings) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, onStart }) => {
  const [total, setTotal] = useState(30);
  const [pace, setPace] = useState(2500);
  const [audio, setAudio] = useState(false);

  const start = () => onStart({ n: 2, total, paceMs: pace, useAudio: audio });

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-20">
      {/* overlay */}
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-4 w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-2xl">
          <Dialog.Title className="text-center text-2xl font-extrabold text-indigo-700">
            2‑Back Settings
          </Dialog.Title>

          <div className="space-y-4">
            {/* sequence length */}
            <label className="block">
              <span className="font-medium"># of stimuli</span>
              <input
                type="number"
                min={3}
                value={total}
                onChange={(e) => setTotal(+e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>

            {/* pace */}
            <label className="block">
              <span className="font-medium">Pace (ms per stimulus)</span>
              <input
                type="number"
                min={500}
                step={100}
                value={pace}
                onChange={(e) => setPace(+e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>

            {/* audio toggle */}
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={audio}
                onChange={(e) => setAudio(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-indigo-600"
              />
              <span>Play letter audio</span>
            </label>
          </div>

          <button
            onClick={start}
            className="w-full rounded-2xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Start 2‑Back
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

// Named + default export so either import style works
export { SettingsModal };
export default SettingsModal;
