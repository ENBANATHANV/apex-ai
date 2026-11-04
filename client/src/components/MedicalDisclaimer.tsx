import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface MedicalDisclaimerProps {
  compact?: boolean;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ compact }) => {
  return (
    <div
      className={`rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-200/90 ${
        compact ? 'p-2.5 text-xs' : 'p-4 text-xs sm:text-sm'
      } flex items-start gap-3`}
    >
      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-amber-300">Medical & Health Disclaimer: </span>
        <span>
          FitTrack AI workouts and nutritional calculations are designed for informational and educational fitness purposes only.
          They do not constitute medical advice or a clinical diagnosis. Always consult with a licensed physician before starting any rigorous training or meal plan.
        </span>
      </div>
    </div>
  );
};
