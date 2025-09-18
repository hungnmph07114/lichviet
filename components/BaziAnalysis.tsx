import React, { useState, useCallback, useEffect } from 'react';
import type { BaziResult, UserProfile } from '../types';
import { analyzeBazi } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { CheckCircleIcon } from './icons';
import { LoadingView } from './LoadingView';
import { BAZI_LOADING_MESSAGES } from '../utils/loadingMessages';

interface BaziAnalysisProps {
  userProfile: UserProfile | null;
}

const PillarCard: React.FC<{ title: string; canChi: string; wuXing: string }> = ({ title, canChi, wuXing }) => (
    <div className="bg-slate-700 p-4 rounded-lg text-center shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:shadow-amber-500/10">
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-lg font-bold text-amber-400">{canChi}</p>
        <p className="text-sm text-cyan-400">{wuXing}</p>
    </div>
);

export const BaziAnalysis: React.FC<BaziAnalysisProps> = ({ userProfile }) => {
  const [formData, setFormData] = useState({
    birthDate: '',
    birthTime: '',
    gender: 'Nam',
  });
  const [result, setResult] = useState<BaziResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        birthDate: userProfile.birthDate || '',
        birthTime: userProfile.birthTime || '',
        gender: userProfile.gender || 'Nam',
      });
    }
  }, [userProfile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.birthDate) {
      setError("Vui lòng nhập ngày sinh.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const baziResult = await analyzeBazi(formData.birthDate, formData.birthTime, formData.gender);
      if (baziResult) {
        setResult(baziResult);
      } else {
        setError("Không thể phân tích Bát Tự. Vui lòng kiểm tra lại thông tin và thử lại.");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi kết nối đến dịch vụ AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-amber-400 mb-4">Phân Tích Bát Tự (Tử Vi)</h2>
        <p className="text-slate-400 mb-6">Nhập thông tin ngày sinh (dương lịch) của bạn để nhận luận giải chi tiết từ AI.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-slate-300 mb-1">Ngày Sinh</label>
              <input type="date" name="birthDate" id="birthDate" value={formData.birthDate} onChange={handleChange} required className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-amber-500 focus:border-amber-500"/>
            </div>
            <div>
              <label htmlFor="birthTime" className="block text-sm font-medium text-slate-300 mb-1">Giờ Sinh (nếu biết)</label>
              <input type="time" name="birthTime" id="birthTime" value={formData.birthTime} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-amber-500 focus:border-amber-500"/>
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-slate-300 mb-1">Giới Tính</label>
              <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-amber-500 focus:border-amber-500">
                <option>Nam</option>
                <option>Nữ</option>
                <option>Khác</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center">
            {loading ? <LoadingSpinner /> : 'Xem Luận Giải'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg">
          <LoadingView messages={BAZI_LOADING_MESSAGES} />
        </div>
      )}

      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">{error}</div>}

      {result && (
        <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg space-y-6 animate-fade-in">
          <div>
            <h3 className="text-xl font-semibold text-amber-400 mb-3">Tứ Trụ (Bốn Cột Trụ)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <PillarCard title="Trụ Năm" canChi={result.baziPillars.year.canChi} wuXing={result.baziPillars.year.wuXing} />
                <PillarCard title="Trụ Tháng" canChi={result.baziPillars.month.canChi} wuXing={result.baziPillars.month.wuXing} />
                <PillarCard title="Trụ Ngày" canChi={result.baziPillars.day.canChi} wuXing={result.baziPillars.day.wuXing} />
                <PillarCard title="Trụ Giờ" canChi={result.baziPillars.hour.canChi} wuXing={result.baziPillars.hour.wuXing} />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-amber-400 mb-2">Tổng Quan</h3>
            <p className="text-slate-300 bg-slate-700/50 p-4 rounded-md italic">{result.summary}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-amber-400 mb-2">Luận Giải Chi Tiết</h3>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{result.detailedAnalysis}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-amber-400 mb-3">Lời Khuyên Thực Tế</h3>
            <ul className="space-y-3">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircleIcon className="flex-shrink-0 mr-3 mt-1 text-emerald-400" />
                  <span className="text-slate-300">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};