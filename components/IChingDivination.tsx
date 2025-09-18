
import React, { useState, useCallback } from 'react';
import type { IChingResult } from '../types';
import { interpretIChing } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { LoadingView } from './LoadingView';
import { ICHING_LOADING_MESSAGES } from '../utils/loadingMessages';

const HexagramLine: React.FC<{ isBroken: boolean }> = ({ isBroken }) => (
  <div className={`h-2 rounded-full mx-auto ${isBroken ? 'w-full' : 'w-full bg-slate-200'}`}>
    {isBroken ? (
      <div className="flex justify-between items-center h-full">
        <div className="w-5/12 h-full bg-slate-200 rounded-l-full"></div>
        <div className="w-2/12 h-full"></div>
        <div className="w-5/12 h-full bg-slate-200 rounded-r-full"></div>
      </div>
    ) : null}
  </div>
);

// Pre-computed visual representations for all 64 hexagrams
const HEXAGRAM_LINES: boolean[][] = [
    [false, false, false, false, false, false], [true, true, true, true, true, true], [false, true, true, true, false, true], [true, false, true, true, true, false],
    [false, true, true, false, true, true], [true, true, false, true, true, false], [true, true, true, true, false, true], [true, false, true, true, true, true],
    [false, true, false, false, false, false], [false, false, false, false, true, false], [false, false, false, true, true, true], [true, true, true, false, false, false],
    [false, false, true, false, false, false], [false, false, false, true, false, false], [true, true, false, true, true, true], [true, true, true, false, true, true],
    [false, true, true, false, false, true], [true, false, false, true, true, false], [true, false, true, true, false, false], [false, false, true, true, false, true],
    [false, false, true, false, true, false], [false, true, false, true, false, false], [true, true, true, false, false, true], [true, false, false, true, true, true],
    [true, false, false, false, false, false], [false, false, false, false, false, true], [true, false, false, true, false, true], [true, false, true, false, false, true],
    [true, true, false, false, false, false], [false, false, false, false, true, true], [false, true, false, true, false, true], [true, false, true, false, true, false],
    [false, true, true, false, true, false], [false, true, false, true, true, false], [false, true, true, true, true, false], [false, true, true, true, false, false],
    [true, true, false, false, true, true], [true, true, false, true, false, true], [true, false, true, false, true, true], [true, true, false, true, false, false],
    [false, false, true, true, true, false], [false, true, true, true, true, true], [true, true, true, true, true, false], [false, false, true, true, false, true],
    [false, true, false, false, true, false], [false, true, false, false, false, true], [true, false, false, false, true, false], [false, true, false, true, true, true],
    [false, false, true, false, false, true], [true, false, false, true, false, false], [false, false, true, false, true, true], [true, true, false, true, false, true],
    [false, false, false, true, true, false], [false, true, true, false, false, false], [true, false, true, true, false, true], [true, false, true, false, false, false],
    [false, false, false, true, false, true], [true, true, false, false, false, true], [false, true, false, true, false, false], [false, true, false, false, true, true]
];

export const IChingDivination: React.FC = () => {
  const [result, setResult] = useState<IChingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hexagramNumber, setHexagramNumber] = useState<number | null>(null);

  const handleDraw = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const num = Math.floor(Math.random() * 64) + 1;
    setHexagramNumber(num);

    try {
      const iChingResult = await interpretIChing(num);
      if (iChingResult) {
        setResult(iChingResult);
      } else {
        setError("Không thể luận giải quẻ. Vui lòng thử lại.");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi kết nối đến dịch vụ AI.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold text-amber-400 mb-4">Gieo Quẻ Kinh Dịch</h2>
        <p className="text-slate-400 mb-6">Tập trung vào câu hỏi của bạn và nhấn nút để gieo một quẻ Kinh Dịch ngẫu nhiên.</p>
        <button onClick={handleDraw} disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center mx-auto">
          {loading ? <LoadingSpinner /> : 'Gieo Quẻ'}
        </button>
      </div>

      {loading && (
        <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg">
          <LoadingView messages={ICHING_LOADING_MESSAGES} />
        </div>
      )}

      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">{error}</div>}

      {result && hexagramNumber && (
        <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg space-y-6 animate-fade-in flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4 flex flex-col items-center">
            <h3 className="text-lg font-bold text-amber-400 mb-2">Quẻ số {hexagramNumber}</h3>
            <h4 className="text-xl font-semibold text-center mb-4">{result.hexagramName}</h4>
            <div className="w-24 space-y-2">
              {HEXAGRAM_LINES[hexagramNumber - 1].slice().reverse().map((isBroken, i) => (
                <HexagramLine key={i} isBroken={isBroken} />
              ))}
            </div>
          </div>
          <div className="md:w-3/4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-2">Tóm tắt</h3>
              <p className="text-slate-300 bg-slate-700/50 p-3 rounded-md italic">{result.summary}</p>
            </div>
             <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-2">Thoán Từ (Lời quẻ)</h3>
              <p className="text-slate-300 whitespace-pre-wrap">{result.judgment}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-2">Lời Khuyên</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {result.practicalAdvice.map((adv, i) => <li key={i}>{adv}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
