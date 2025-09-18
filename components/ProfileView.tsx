import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../types';
import { CheckCircleIcon, UserCircleIcon } from './icons';

interface ProfileViewProps {
  userProfile: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userProfile, onSaveProfile }) => {
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    birthDate: '',
    birthTime: '',
    gender: 'Nam',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData(userProfile);
    }
  }, [userProfile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value } as UserProfile));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000); // Hide after 3 seconds
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg">
        <div className="flex flex-col items-center text-center mb-6">
            <UserCircleIcon className="w-16 h-16 text-slate-500" />
            <h2 className="text-2xl font-bold text-amber-400 mt-4">Thông Tin Cá Nhân</h2>
            <p className="text-slate-400 mt-2">Cung cấp thông tin dưới đây sẽ giúp AI đưa ra những luận giải và lời khuyên được cá nhân hóa dành riêng cho bạn.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Họ và Tên</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-amber-500 focus:border-amber-500" placeholder="Nguyễn Văn A" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-slate-300 mb-1">Ngày Sinh (Dương lịch)</label>
              <input type="date" name="birthDate" id="birthDate" value={formData.birthDate} onChange={handleChange} required className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-amber-500 focus:border-amber-500" />
            </div>
            <div>
              <label htmlFor="birthTime" className="block text-sm font-medium text-slate-300 mb-1">Giờ Sinh (nếu biết)</label>
              <input type="time" name="birthTime" id="birthTime" value={formData.birthTime} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-amber-500 focus:border-amber-500" />
            </div>
          </div>
           <div>
              <label htmlFor="gender" className="block text-sm font-medium text-slate-300 mb-1">Giới Tính</label>
              <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-amber-500 focus:border-amber-500">
                <option>Nam</option>
                <option>Nữ</option>
                <option>Khác</option>
              </select>
            </div>

          <div className="pt-2 flex items-center justify-end gap-4">
             {showSuccess && (
                <div className="flex items-center gap-2 text-emerald-400 animate-fade-in">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Đã lưu thành công!</span>
                </div>
            )}
            <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-md transition-colors">
              Lưu Thông Tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
