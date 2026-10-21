import React, { useState } from 'react';
import { Shield, Mic, Eye, Stethoscope, X } from 'lucide-react';
import { ClayButton } from './ClayButton';
import { ReadingBuddy } from '../types';

interface ParentalConsentModalProps {
  isOpen: boolean;
  buddy: ReadingBuddy;
  onConsentGranted: () => void;
  onClose: () => void;
}

export const ParentalConsentModal: React.FC<ParentalConsentModalProps> = ({
  isOpen,
  buddy,
  onConsentGranted,
  onClose,
}) => {
  const [hasConsented, setHasConsented] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-slate-200 shadow-2xl p-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#1E1B4B]">Guardian Consent & Privacy</h3>
              <p className="text-xs text-slate-500 font-medium">ReadWise AI Assessment Safeguards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="my-5 space-y-3.5 text-xs sm:text-sm text-slate-600">
          <p className="font-semibold text-slate-700">
            Before starting the reading assessment, please review how child data is handled:
          </p>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <Mic className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#1E1B4B]">Ephemeral Audio Processing</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Microphone audio is processed locally in real-time memory to calculate speech hesitation pauses and acoustic stability. Audio recordings are deleted immediately.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <Eye className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#1E1B4B]">Gaze Biomechanics Only</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Front-camera frames are used exclusively to calculate eye fixations and reading regressions. No facial imagery or child recordings are stored or uploaded.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
            <Stethoscope className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#1E1B4B]">Pre-Diagnostic Screening</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                ReadWise AI provides an educational statistical screening estimate, not a formal clinical diagnosis.
              </p>
            </div>
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
            <input
              type="checkbox"
              checked={hasConsented}
              onChange={(e) => setHasConsented(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-[#1E1B4B] leading-tight">
              I am the parent/guardian and grant permission to proceed with this reading trial session.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <ClayButton
            text="Accept & Begin Session 🚀"
            disabled={!hasConsented}
            color={buddy.themePrimary}
            shadowColor={buddy.themeShadow}
            fontSize={14}
            onClick={() => {
              if (hasConsented) {
                onConsentGranted();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
