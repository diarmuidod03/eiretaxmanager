'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAppStore, UserProfile } from '@/lib/store';
import { MessageCircle, ArrowRight, Check } from 'lucide-react';
import AuthGuard from './AuthGuard';

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
  options?: string[];
  inputType?: 'text' | 'select' | 'multi-select' | 'number';
  field?: keyof UserProfile;
}

const JOB_TITLES = [
  'Nurse', 'Teacher', 'Bricklayer', 'Carpenter', 'Electrician', 
  'Plumber', 'Mechanic', 'Chef', 'Hairdresser', 'Retail Assistant',
  'Engineer', 'Accountant', 'Solicitor', 'Doctor', 'Other'
];

function OnboardingContent() {
  const router = useRouter();
  const { userProfile: initialProfile, updateUserProfile, setHasCompletedOnboarding, userId, hasCompletedOnboarding } = useAppStore();
  const [localProfile, setLocalProfile] = useState<UserProfile>(initialProfile);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: "Hi! I'm your Shadow Accountant. Let's find every euro of tax relief you're entitled to. First, what's your employment status?",
      options: ['PAYE', 'Self-Employed', 'Both'],
      field: 'employmentStatus',
    },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleOptionSelect = (option: string, field?: keyof UserProfile) => {
    // Update local profile immediately
    let updatedProfile: UserProfile = { ...localProfile };
    if (field) {
      const update: Partial<UserProfile> = {};
      if (field === 'employmentStatus') {
        update.employmentStatus = option as 'PAYE' | 'Self-Employed' | 'Both';
      } else if (field === 'jobTitle') {
        update.jobTitle = option;
      } else if (field === 'housing') {
        update.housing = option as 'Rent' | 'Own with Mortgage' | 'Own outright';
      } else if (field === 'familyStatus') {
        update.familyStatus = option as 'Single' | 'Married' | 'Children';
      }
      updatedProfile = { ...localProfile, ...update };
      setLocalProfile(updatedProfile);
      updateUserProfile(update);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: option,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Determine next question based on current answer - use updated profile
    setTimeout(() => {
      const nextMessage = getNextMessageWithProfile(updatedProfile);
      if (nextMessage && nextMessage.text !== 'Perfect! I\'ve set up your profile. Let\'s start maximizing your tax relief! 🎉') {
        setMessages((prev) => [...prev, nextMessage]);
        setCurrentStep((prev) => prev + 1);
      } else if (nextMessage) {
        // Final message
        setMessages((prev) => [...prev, nextMessage]);
        setHasCompletedOnboarding(true);
        updateUserProfile(updatedProfile); // Final sync
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    }, 500);
  };

  const getNextMessageWithProfile = (profile: UserProfile): Message | null => {
    if (!profile.employmentStatus) {
      return null;
    }

    if (!profile.jobTitle && (profile.employmentStatus === 'PAYE' || profile.employmentStatus === 'Both')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        text: 'What\'s your job title? (This helps us find your Flat Rate Expenses)',
        options: JOB_TITLES,
        inputType: 'select',
        field: 'jobTitle',
      };
    }

    if (!profile.housing) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        text: 'What\'s your housing situation?',
        options: ['Rent', 'Own with Mortgage', 'Own outright'],
        field: 'housing',
      };
    }

    if (!profile.familyStatus) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        text: 'What\'s your family status?',
        options: ['Single', 'Married', 'Children'],
        field: 'familyStatus',
      };
    }

    if (profile.familyStatus === 'Married' && !profile.yearOfMarriage) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        text: 'What year did you get married? (You may be eligible for Year of Marriage Review)',
        inputType: 'number',
        field: 'yearOfMarriage',
      };
    }

    if (profile.familyStatus === 'Children' && profile.childrenAges.length === 0) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        text: 'How many children do you have under 23? (Enter number)',
        inputType: 'number',
        field: 'childrenAges',
      };
    }

    if (profile.hasCoeliac === false && profile.hasDiabetes === false) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        text: 'Do you have Coeliac disease or Diabetes? (This enables Special Foods category)',
        options: ['Yes, Coeliac', 'Yes, Diabetes', 'Both', 'No'],
        field: 'hasCoeliac',
      };
    }

    // Final message
    return {
      id: Date.now().toString(),
      type: 'bot',
      text: 'Perfect! I\'ve set up your profile. Let\'s start maximizing your tax relief! 🎉',
    };
  };

  const handleNumberInput = (value: string, field: keyof UserProfile) => {
    const update: Partial<UserProfile> = {};
    if (field === 'yearOfMarriage') {
      update.yearOfMarriage = parseInt(value) || null;
    } else if (field === 'childrenAges') {
      const count = parseInt(value) || 0;
      update.childrenAges = Array(count).fill(0).map((_, i) => i);
    }
    const updatedProfile = { ...localProfile, ...update };
    setLocalProfile(updatedProfile);
    updateUserProfile(update);

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: value,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    setTimeout(() => {
      const nextMessage = getNextMessageWithProfile(updatedProfile);
      if (nextMessage && nextMessage.text !== 'Perfect! I\'ve set up your profile. Let\'s start maximizing your tax relief! 🎉') {
        setMessages((prev) => [...prev, nextMessage]);
        setCurrentStep((prev) => prev + 1);
      } else if (nextMessage) {
        // Final message
        setMessages((prev) => [...prev, nextMessage]);
        setHasCompletedOnboarding(true);
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    }, 500);
  };

  const handleHealthAnswer = (answer: string) => {
    const hasCoeliac = answer.includes('Coeliac') || answer === 'Both';
    const hasDiabetes = answer.includes('Diabetes') || answer === 'Both';
    const updatedProfile = { ...localProfile, hasCoeliac, hasDiabetes };
    setLocalProfile(updatedProfile);
    updateUserProfile({ hasCoeliac, hasDiabetes });

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: answer,
    };

    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const nextMessage = getNextMessageWithProfile(updatedProfile);
      if (nextMessage && nextMessage.text !== 'Perfect! I\'ve set up your profile. Let\'s start maximizing your tax relief! 🎉') {
        setMessages((prev) => [...prev, nextMessage]);
      } else if (nextMessage) {
        // Final message
        setMessages((prev) => [...prev, nextMessage]);
        setHasCompletedOnboarding(true);
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    }, 500);
  };

  // Redirect if already completed onboarding
  useEffect(() => {
    if (hasCompletedOnboarding && userId) {
      router.push('/dashboard');
    }
  }, [hasCompletedOnboarding, userId, router]);

  const currentMessage = messages[messages.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl h-[600px] flex flex-col">
          {/* Header */}
          <div className="bg-primary-600 text-white p-4 rounded-t-2xl flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            <h1 className="text-xl font-bold">ÉireTax Manager</h1>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t p-4 bg-gray-50 rounded-b-2xl">
            {currentMessage?.text === 'Perfect! I\'ve set up your profile. Let\'s start maximizing your tax relief! 🎉' ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">Redirecting to your dashboard...</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : currentMessage?.options ? (
              <div className="space-y-2">
                {currentMessage.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      if (currentMessage.field === 'hasCoeliac' || currentMessage.field === 'hasDiabetes') {
                        handleHealthAnswer(option);
                      } else {
                        handleOptionSelect(option, currentMessage.field);
                      }
                    }}
                    className="w-full text-left px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors flex items-center justify-between"
                  >
                    <span>{option}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            ) : currentMessage?.inputType === 'number' ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && currentMessage.field) {
                      handleNumberInput(inputValue, currentMessage.field);
                    }
                  }}
                  placeholder="Enter number..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                />
                <button
                  onClick={() => {
                    if (currentMessage.field) {
                      handleNumberInput(inputValue, currentMessage.field);
                    }
                  }}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Onboarding() {
  return (
    <AuthGuard>
      <OnboardingContent />
    </AuthGuard>
  );
}

