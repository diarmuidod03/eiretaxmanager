'use client';

import { useState } from 'react';
import { useAppStore, UserProfile } from '@/lib/store';
import { Save, User, Briefcase, Home, Users, Heart } from 'lucide-react';

const JOB_TITLES = [
  'Nurse', 'Teacher', 'Bricklayer', 'Carpenter', 'Electrician', 
  'Plumber', 'Mechanic', 'Chef', 'Hairdresser', 'Retail Assistant',
  'Engineer', 'Accountant', 'Solicitor', 'Doctor', 'Other'
];

export default function ProfileEditor() {
  const { userProfile, updateUserProfile } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(userProfile);

  const handleSave = () => {
    updateUserProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(userProfile);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Employment Status */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Briefcase className="w-4 h-4" />
            Employment Status
          </label>
          {isEditing ? (
            <select
              value={formData.employmentStatus || ''}
              onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            >
              <option value="">Select...</option>
              <option value="PAYE">PAYE</option>
              <option value="Self-Employed">Self-Employed</option>
              <option value="Both">Both</option>
            </select>
          ) : (
            <p className="text-gray-900">{formData.employmentStatus || 'Not set'}</p>
          )}
        </div>

        {/* Job Title */}
        {formData.employmentStatus && (formData.employmentStatus === 'PAYE' || formData.employmentStatus === 'Both') && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4" />
              Job Title
            </label>
            {isEditing ? (
              <select
                value={formData.jobTitle || ''}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              >
                <option value="">Select...</option>
                {JOB_TITLES.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900">{formData.jobTitle || 'Not set'}</p>
            )}
          </div>
        )}

        {/* Housing */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Home className="w-4 h-4" />
            Housing Situation
          </label>
          {isEditing ? (
            <select
              value={formData.housing || ''}
              onChange={(e) => setFormData({ ...formData, housing: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            >
              <option value="">Select...</option>
              <option value="Rent">Rent</option>
              <option value="Own with Mortgage">Own with Mortgage</option>
              <option value="Own outright">Own outright</option>
            </select>
          ) : (
            <p className="text-gray-900">{formData.housing || 'Not set'}</p>
          )}
        </div>

        {/* Family Status */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4" />
            Family Status
          </label>
          {isEditing ? (
            <select
              value={formData.familyStatus || ''}
              onChange={(e) => {
                const newStatus = e.target.value as any;
                setFormData({
                  ...formData,
                  familyStatus: newStatus,
                  // Reset year of marriage if not married
                  yearOfMarriage: newStatus === 'Married' ? formData.yearOfMarriage : null,
                  // Reset children ages if not Children
                  childrenAges: newStatus === 'Children' ? formData.childrenAges : [],
                });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            >
              <option value="">Select...</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Children">Children</option>
            </select>
          ) : (
            <p className="text-gray-900">{formData.familyStatus || 'Not set'}</p>
          )}
        </div>

        {/* Year of Marriage */}
        {formData.familyStatus === 'Married' && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4" />
              Year of Marriage
            </label>
            {isEditing ? (
              <input
                type="number"
                value={formData.yearOfMarriage || ''}
                onChange={(e) => setFormData({ ...formData, yearOfMarriage: parseInt(e.target.value) || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                placeholder="e.g., 1999"
                min="1900"
                max={new Date().getFullYear()}
              />
            ) : (
              <p className="text-gray-900">{formData.yearOfMarriage || 'Not set'}</p>
            )}
          </div>
        )}

        {/* Children Ages */}
        {formData.familyStatus === 'Children' && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4" />
              Number of Children Under 23
            </label>
            {isEditing ? (
              <input
                type="number"
                value={formData.childrenAges.length || ''}
                onChange={(e) => {
                  const count = parseInt(e.target.value) || 0;
                  setFormData({
                    ...formData,
                    childrenAges: Array(count).fill(0).map((_, i) => i),
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                placeholder="0"
                min="0"
              />
            ) : (
              <p className="text-gray-900">{formData.childrenAges.length || 0} children</p>
            )}
          </div>
        )}

        {/* Health Conditions */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Heart className="w-4 h-4" />
            Health Conditions
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasCoeliac}
                  onChange={(e) => setFormData({ ...formData, hasCoeliac: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-gray-700">Coeliac Disease</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasDiabetes}
                  onChange={(e) => setFormData({ ...formData, hasDiabetes: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-gray-700">Diabetes</span>
              </label>
            </div>
          ) : (
            <div className="space-y-1">
              {formData.hasCoeliac && <p className="text-gray-900">✓ Coeliac Disease</p>}
              {formData.hasDiabetes && <p className="text-gray-900">✓ Diabetes</p>}
              {!formData.hasCoeliac && !formData.hasDiabetes && <p className="text-gray-500">None</p>}
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Updating your profile will affect which tax reliefs are available and calculated for you.
          </p>
        </div>
      )}
    </div>
  );
}

