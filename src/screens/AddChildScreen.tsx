import React, { useState } from 'react';
import { ClayButton } from '../components/ClayButton';
import { profileService } from '../services/profileService';
import { ReadingBuddy } from '../types';

interface AddChildScreenProps {
  buddy: ReadingBuddy;
  onChildAdded: () => void;
  onCancel: () => void;
}

export const AddChildScreen: React.FC<AddChildScreenProps> = ({
  buddy,
  onChildAdded,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('9');
  const [grade, setGrade] = useState('Grade 4');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your child’s name.');
      return;
    }
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 3 || parsedAge > 18) {
      setError('Please enter a valid age between 3 and 18.');
      return;
    }
    if (!grade.trim()) {
      setError('Please enter a grade/class level.');
      return;
    }

    setLoading(true);
    await profileService.addChild({
      name: name.trim(),
      age: parsedAge,
      grade: grade.trim(),
      language: language.trim() || 'English',
    });
    setLoading(false);
    onChildAdded();
  };

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-xl">
        <h2 className="text-2xl font-black text-[#1E1B4B] mb-1">
          Add Child Profile
        </h2>
        <p className="text-xs text-slate-500 font-medium mb-6">
          Create a profile to personalize reading assessments and track cognitive growth over time.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1E1B4B] mb-1.5">
              Child&apos;s Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arun, Maya, Leo"
              required
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-[#1E1B4B] placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1E1B4B] mb-1.5">
                Age
              </label>
              <input
                type="number"
                min="3"
                max="18"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-[#1E1B4B] focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1B4B] mb-1.5">
                Class / Grade
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. Grade 4"
                required
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-[#1E1B4B] focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1B4B] mb-1.5">
              Primary Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-[#1E1B4B] focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="Hindi">Hindi</option>
              <option value="French">French</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <ClayButton
              text={loading ? 'Saving...' : 'Save Profile 💾'}
              disabled={loading}
              color={buddy.themePrimary}
              shadowColor={buddy.themeShadow}
              onClick={() => handleSubmit({ preventDefault: () => {} } as any)}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
