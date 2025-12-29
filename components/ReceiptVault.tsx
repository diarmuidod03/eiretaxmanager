'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, Receipt } from '@/lib/store';
import { extractReceiptData } from '@/lib/ocr';
import { Camera, Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ReceiptVault() {
  const router = useRouter();
  const { receipts, addReceipt, deleteReceipt, calculateEstimatedRefund } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<any>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const result = await extractReceiptData(file);
      setOcrResult(result);
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to process receipt. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveReceipt = () => {
    if (!ocrResult || !previewUrl) return;

    const receipt: Receipt = {
      id: Date.now().toString(),
      date: ocrResult.date || new Date().toISOString().split('T')[0],
      amount: ocrResult.amount,
      category: ocrResult.category,
      merchant: ocrResult.merchant,
      imageUrl: previewUrl,
      ocrText: '',
      hasMed2Form: ocrResult.category === 'Non-Routine Dental' ? false : true,
      encrypted: false,
    };

    addReceipt(receipt);
    calculateEstimatedRefund();
    setShowUploadModal(false);
    setPreviewUrl(null);
    setOcrResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this receipt?')) {
      deleteReceipt(id);
      calculateEstimatedRefund();
    }
  };

  const categoryColors: Record<string, string> = {
    'GP/Consultant': 'bg-blue-100 text-blue-800',
    'Prescriptions': 'bg-green-100 text-green-800',
    'Non-Routine Dental': 'bg-red-100 text-red-800',
    'Nursing Home': 'bg-purple-100 text-purple-800',
    'Dietary': 'bg-yellow-100 text-yellow-800',
    'Guide Dog': 'bg-indigo-100 text-indigo-800',
    'Other': 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Receipt Vault</h1>
            <p className="text-gray-600">Medical & General Expenses</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Scan Receipt
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600">Total Receipts</p>
            <p className="text-2xl font-bold text-gray-900">{receipts.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              €{receipts.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600">Estimated Relief</p>
            <p className="text-2xl font-bold text-primary-600">
              €{(receipts.reduce((sum, r) => {
                const rate = r.category === 'Nursing Home' ? 0.4 : 0.2;
                return sum + r.amount * rate;
              }, 0)).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Receipts List */}
        <div className="space-y-4">
          {receipts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No receipts yet</p>
              <p className="text-sm text-gray-500">Start scanning receipts to track your expenses</p>
            </div>
          ) : (
            receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="bg-white rounded-xl shadow-md p-6 flex items-start gap-4"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {receipt.imageUrl && (
                    <img
                      src={receipt.imageUrl}
                      alt="Receipt"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{receipt.merchant}</h3>
                      <p className="text-sm text-gray-600">
                        {format(new Date(receipt.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(receipt.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-900">€{receipt.amount.toFixed(2)}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[receipt.category] || categoryColors.Other}`}
                    >
                      {receipt.category}
                    </span>
                    {receipt.category === 'Non-Routine Dental' && !receipt.hasMed2Form && (
                      <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Med 2 Required
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Scan Receipt</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setPreviewUrl(null);
                  setOcrResult(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {!previewUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Upload a receipt image</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Choose File
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {isProcessing ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Processing receipt...</p>
                    </div>
                  ) : ocrResult ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Receipt preview"
                        className="w-full rounded-lg border"
                      />
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-semibold">€{ocrResult.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[ocrResult.category] || categoryColors.Other}`}
                          >
                            {ocrResult.category}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Merchant:</span>
                          <span className="font-medium">{ocrResult.merchant}</span>
                        </div>
                        {ocrResult.date && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium">{ocrResult.date}</span>
                          </div>
                        )}
                        {ocrResult.category === 'Non-Routine Dental' && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                            <p className="text-sm text-yellow-800">
                              <strong>Important:</strong> You&apos;ll need a Med 2 Form signed by your dentist for this claim.
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleSaveReceipt}
                        className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Save Receipt
                      </button>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

