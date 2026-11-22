import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Wrench,
  Shield,
  AlertCircle,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  FileText,
  Play,
  Check,
} from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../app/AuthContext';
import { useOffline } from '../../app/OfflineContext';
import { Button, Card, Badge } from '../../components/Button';

const InventionCreate = () => {
  const { user } = useAuth();
  const { saveDraft, savedDraft, clearDraft } = useOffline();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => {
    if (savedDraft) return savedDraft;
    return {
      title: '',
      category: 'Agriculture',
      region: user?.state || 'Gujarat',
      description: '',
      durability_notes: '',
      image_url: '/images/inventions/solar-drip.svg',
      blueprint_url: '/images/blueprints/solar-drip-blueprint.svg',
      sketch_url: '/images/blueprints/solar-drip-blueprint.svg',
      video_url: '',
      scaling_stage: 'RAW_PROTOTYPE',
      estimated_co2_savings_kg: 100,
      estimated_water_savings_liters: 2000,
      assembly_steps: [
        { step: 1, title: 'Frame Preparation', details: 'Cut and square scrap pipes for the main support.', audio_text: '' },
      ],
      materials: [
        { item_name: 'Scrap Steel Pipe', quantity: '2 meters', unit_cost: 350, local_source: 'Local scrap dealer', optimized_alternative: '', estimated_savings: 0 },
      ],
    };
  });

  const [uploadingField, setUploadingField] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [similarityResults, setSimilarityResults] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [optimizerResults, setOptimizerResults] = useState(null);
  const [optLoading, setOptLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto-save draft on modification
  useEffect(() => {
    saveDraft(formData);
  }, [formData]);

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField(fieldName);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiClient.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, [fieldName]: res.data.url }));
    } catch (err) {
      alert(err.response?.data?.detail || 'File upload failed. Ensure the format is PNG, JPG, SVG, WebP, PDF, or MP4.');
    } finally {
      setUploadingField(null);
    }
  };

  // Voice speech-to-text input using Web Speech API
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Indian English, handles accents well
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData((prev) => ({
        ...prev,
        description: prev.description ? `${prev.description} ${transcript}` : transcript,
      }));
    };

    recognition.start();
  };

  // Rule-based Duplicate / Novelty Check
  const handleCheckSimilarity = async () => {
    if (!formData.title || !formData.description) {
      alert('Please enter a title and description first.');
      return;
    }
    setSimLoading(true);
    try {
      const res = await apiClient.post('/inventions/similarity-check', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
      });
      setSimilarityResults(res.data);
    } catch (e) {
      alert('Similarity check failed.');
    } finally {
      setSimLoading(false);
    }
  };

  // Rule-based Material Optimizer
  const handleOptimizeMaterials = async () => {
    if (formData.materials.length === 0) return;
    setOptLoading(true);
    try {
      const res = await apiClient.post('/inventions/material-optimization', {
        materials: formData.materials,
      });
      setOptimizerResults(res.data);
      if (res.data.suggestions) {
        setFormData((prev) => ({ ...prev, materials: res.data.suggestions }));
      }
    } catch (e) {
      alert('Material optimization failed.');
    } finally {
      setOptLoading(false);
    }
  };

  const handleAddStep = () => {
    setFormData((prev) => ({
      ...prev,
      assembly_steps: [
        ...prev.assembly_steps,
        { step: prev.assembly_steps.length + 1, title: '', details: '', audio_text: '' },
      ],
    }));
  };

  const handleRemoveStep = (index) => {
    setFormData((prev) => ({
      ...prev,
      assembly_steps: prev.assembly_steps.filter((_, i) => i !== index),
    }));
  };

  const handleAddMaterial = () => {
    setFormData((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        { item_name: '', quantity: '1 Unit', unit_cost: 100, local_source: '', optimized_alternative: '', estimated_savings: 0 },
      ],
    }));
  };

  const handleRemoveMaterial = (index) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  const formatErrorMessage = (err) => {
    if (!err) return 'Failed to publish innovation. Please verify the form fields.';
    const detail = err.response?.data?.detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d) => {
          const loc = Array.isArray(d.loc) ? d.loc.filter((x) => x !== 'body').join('.') : '';
          const msg = d.msg || d.message || JSON.stringify(d);
          return loc ? `${loc}: ${msg}` : msg;
        })
        .join('; ');
    }
    if (typeof detail === 'string') return detail;
    if (detail && typeof detail === 'object') return detail.message || detail.error || JSON.stringify(detail);
    return err.message || 'Failed to publish innovation. Please verify the form fields.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || formData.title.trim().length < 2) {
      setError('Please enter an innovation title (at least 2 characters).');
      return;
    }

    if (!formData.description || formData.description.trim().length < 3) {
      setError('Please provide a brief description explaining what this machine solves.');
      return;
    }

    // Sanitize materials: ensure unit_cost is a valid number and item_name is present
    const cleanMaterials = (formData.materials || [])
      .filter((m) => m && m.item_name && m.item_name.trim())
      .map((m) => ({
        item_name: m.item_name.trim(),
        quantity: m.quantity?.trim() || '1 Unit',
        unit_cost: parseFloat(m.unit_cost) || 0,
        local_source: m.local_source?.trim() || 'Local workshop',
        optimized_alternative: m.optimized_alternative || '',
        estimated_savings: parseFloat(m.estimated_savings) || 0,
      }));

    const finalMaterials =
      cleanMaterials.length > 0
        ? cleanMaterials
        : [
            {
              item_name: 'Standard Hardware Components',
              quantity: '1 Set',
              unit_cost: 500,
              local_source: 'Local workshop',
              optimized_alternative: '',
              estimated_savings: 0,
            },
          ];

    // Sanitize assembly steps: ensure title or details is present
    const cleanSteps = (formData.assembly_steps || [])
      .filter((s) => s && ((s.title && s.title.trim()) || (s.details && s.details.trim())))
      .map((s, idx) => ({
        step: idx + 1,
        title: s.title?.trim() || `Step ${idx + 1}`,
        details: s.details?.trim() || 'Follow assembly blueprint specs.',
        audio_text: s.audio_text || '',
      }));

    const finalSteps =
      cleanSteps.length > 0
        ? cleanSteps
        : [
            {
              step: 1,
              title: 'Workshop Preparation & Assembly',
              details: 'Assemble components according to schematic blueprint.',
              audio_text: '',
            },
          ];

    const payload = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category || 'Agriculture',
      region: formData.region || user?.state || 'Gujarat',
      materials: finalMaterials,
      assembly_steps: finalSteps,
      estimated_co2_savings_kg: parseFloat(formData.estimated_co2_savings_kg) || 120,
      estimated_water_savings_liters: parseFloat(formData.estimated_water_savings_liters) || 5000,
      image_url: formData.image_url || '/images/inventions/solar-drip.svg',
      blueprint_url: formData.blueprint_url || '/images/blueprints/solar-drip-blueprint.svg',
      sketch_url: formData.sketch_url || '/images/blueprints/solar-drip-blueprint.svg',
    };

    setSubmitting(true);

    try {
      const res = await apiClient.post('/inventions', payload);
      clearDraft();
      navigate(`/inventions/${res.data.id}`);
    } catch (err) {
      console.error('Publish invention error:', err);
      setError(formatErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-8"
    >
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Submit Grassroots Innovation</h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish your frugal blueprint for community replication, grant funding, and cryptographic timestamp proof.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 shadow-2xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1 font-semibold leading-relaxed">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Invention Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Gravity Drip Kit with Upcycled Barrel"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Agriculture">Agriculture</option>
                <option value="Water & Irrigation">Water & Irrigation</option>
                <option value="Renewable Energy">Renewable Energy</option>
                <option value="Health & Sanitation">Health & Sanitation</option>
                <option value="Small Farm Machinery">Small Farm Machinery</option>
                <option value="Education & Crafts">Education & Crafts</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Description & Voice Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Detailed Description</label>
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  isRecording
                    ? 'bg-red-500 text-white border-red-600 animate-pulse'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-teal-600" />}
                <span>{isRecording ? 'Listening (Speak now)...' : 'Dictate with Voice'}</span>
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the problem, the frugal engineering solution, and how rural farmers benefit..."
              className="w-full p-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Visual Showcase, Blueprints & Video (Direct File Upload) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50/60 via-slate-50 to-sky-50/60 border border-teal-200/80 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
                  Zero Generic Photos • Direct Computer Upload
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-700">Hardware Documentation</span>
              </div>
              <h3 className="text-sm font-black text-slate-900 mt-1">
                Upload Real Prototype Visuals, Blueprints & Demo Video
              </h3>
              <p className="text-xs text-slate-500">
                Officials and investors need real engineering proofs. Upload files directly from your computer or provide URLs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Working Prototype Photo */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-teal-600" /> Prototype Photo
                  </label>
                  {uploadingField === 'image_url' && (
                    <span className="text-[10px] text-teal-600 font-bold animate-pulse">Uploading...</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'image_url')}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="/images/inventions/... or URL"
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 font-mono"
                  />
                </div>

                {formData.image_url ? (
                  <div className="relative w-full h-28 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <img
                      src={formData.image_url}
                      alt="Prototype preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden absolute inset-0 items-center justify-center flex-col text-slate-400 bg-slate-50 text-xs">
                      <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                      <span>Photo Preview</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-20 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs gap-1.5 bg-slate-50">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    <span>Upload or paste photo URL</span>
                  </div>
                )}
              </div>

              {/* 2. Technical Blueprint / CAD */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-600" /> CAD Blueprint / Schematic
                  </label>
                  {uploadingField === 'blueprint_url' && (
                    <span className="text-[10px] text-teal-600 font-bold animate-pulse">Uploading...</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Blueprint</span>
                    <input
                      type="file"
                      accept=".svg,.png,.jpg,.jpeg,.pdf"
                      onChange={(e) => handleFileUpload(e, 'blueprint_url')}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={formData.blueprint_url}
                    onChange={(e) => setFormData({ ...formData, blueprint_url: e.target.value })}
                    placeholder="/images/blueprints/... or URL"
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 font-mono"
                  />
                </div>

                {formData.blueprint_url ? (
                  <div className="relative w-full h-28 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 p-1 flex items-center justify-center">
                    <img
                      src={formData.blueprint_url}
                      alt="Blueprint preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden absolute inset-0 items-center justify-center flex-col text-sky-300 bg-slate-900 text-xs">
                      <FileText className="w-6 h-6 mb-1 text-sky-400" />
                      <span>CAD Blueprint Schema</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-20 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs gap-1.5 bg-slate-50">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Upload technical schematic (.svg, .png, .pdf)</span>
                  </div>
                )}
              </div>

              {/* 3. Workshop Pencil Sketch */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" /> Workshop Pencil Sketch
                  </label>
                  {uploadingField === 'sketch_url' && (
                    <span className="text-[10px] text-teal-600 font-bold animate-pulse">Uploading...</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-700 text-white hover:bg-amber-800 transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Sketch</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'sketch_url')}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={formData.sketch_url}
                    onChange={(e) => setFormData({ ...formData, sketch_url: e.target.value })}
                    placeholder="Sketch URL or local path"
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 font-mono"
                  />
                </div>

                {formData.sketch_url ? (
                  <div className="relative w-full h-28 rounded-lg overflow-hidden bg-amber-50 border border-amber-200 p-1 flex items-center justify-center">
                    <img
                      src={formData.sketch_url}
                      alt="Sketch preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden absolute inset-0 items-center justify-center flex-col text-amber-800 bg-amber-50 text-xs">
                      <Wrench className="w-6 h-6 mb-1 text-amber-600" />
                      <span>Workshop Sketch Preview</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-20 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs gap-1.5 bg-slate-50">
                    <Wrench className="w-4 h-4 text-slate-400" />
                    <span>Upload hand-drawn fabrication sketch</span>
                  </div>
                )}
              </div>

              {/* 4. Demo Video */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-sky-600" /> Working Demo Video
                  </label>
                  {uploadingField === 'video_url' && (
                    <span className="text-[10px] text-teal-600 font-bold animate-pulse">Uploading...</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Video</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={(e) => handleFileUpload(e, 'video_url')}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="YouTube link or uploaded video path"
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 font-mono"
                  />
                </div>

                {formData.video_url && (
                  <div className="text-[11px] text-sky-800 bg-sky-50 p-2 rounded-lg border border-sky-100 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                    <span className="truncate">Video linked: {formData.video_url}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Validation & Market-Readiness Stage */}
            <div className="pt-2 border-t border-teal-200/60">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Current Validation & Market-Readiness Stage *
              </label>
              <select
                value={formData.scaling_stage}
                onChange={(e) => setFormData({ ...formData, scaling_stage: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="RAW_PROTOTYPE">Stage 1: Raw Prototype (Initial workshop build / proof-of-concept)</option>
                <option value="PEER_VALIDATED">Stage 2: Peer Validated (Reviewed by local makers, safety vetted)</option>
                <option value="FIELD_TESTED">Stage 3: Field-Tested (Verified across real farming/irrigation conditions)</option>
                <option value="MARKET_READY">Stage 4: Market-Ready / Scaling (Ready for official procurement & batch tooling)</option>
              </select>
            </div>
          </div>

          {/* Similarity & Novelty Check */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-teal-600" />
                  <span>Rule-Based Novelty & Prior Art Check</span>
                </h4>
                <p className="text-[11px] text-slate-500">Heuristically scans existing open blueprints for overlap.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleCheckSimilarity} isLoading={simLoading}>
                Check Similarity
              </Button>
            </div>

            {similarityResults && (
              <div className="pt-2 text-xs text-slate-700 space-y-1">
                <div className="font-semibold text-teal-800">{similarityResults.message}</div>
                {similarityResults.matches?.map((m) => (
                  <div key={m.id} className="text-[11px] text-slate-600 pl-2 border-l-2 border-teal-500">
                    Overlap with #{m.id} "{m.title}" ({m.score}% match)
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Materials & Local Optimizer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Bill of Materials (BOM)</h3>
                <p className="text-xs text-slate-500">List components and local fabrication sources.</p>
              </div>
              <Button type="button" variant="amber" size="sm" onClick={handleOptimizeMaterials} isLoading={optLoading}>
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Optimize with Local Scrap
              </Button>
            </div>

            {optimizerResults && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                Potential Savings: <span className="font-bold">₹{parseFloat(optimizerResults.potential_savings)}</span> via upcycled scrap substitutions!
              </div>
            )}

            <div className="space-y-2">
              {formData.materials.map((mat, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={mat.item_name}
                    onChange={(e) => {
                      const updated = [...formData.materials];
                      updated[idx].item_name = e.target.value;
                      setFormData({ ...formData, materials: updated });
                    }}
                    className="col-span-4 px-2 py-1 text-xs rounded border border-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Qty"
                    value={mat.quantity}
                    onChange={(e) => {
                      const updated = [...formData.materials];
                      updated[idx].quantity = e.target.value;
                      setFormData({ ...formData, materials: updated });
                    }}
                    className="col-span-2 px-2 py-1 text-xs rounded border border-slate-300"
                  />
                  <input
                    type="number"
                    placeholder="Cost ₹"
                    value={mat.unit_cost}
                    onChange={(e) => {
                      const updated = [...formData.materials];
                      updated[idx].unit_cost = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, materials: updated });
                    }}
                    className="col-span-2 px-2 py-1 text-xs rounded border border-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Local source"
                    value={mat.local_source}
                    onChange={(e) => {
                      const updated = [...formData.materials];
                      updated[idx].local_source = e.target.value;
                      setFormData({ ...formData, materials: updated });
                    }}
                    className="col-span-3 px-2 py-1 text-xs rounded border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(idx)}
                    className="col-span-1 text-slate-400 hover:text-red-600 flex justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" size="sm" onClick={handleAddMaterial}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Material
            </Button>
          </div>

          {/* Assembly Steps */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Step-by-Step Assembly Instructions</h3>
            <div className="space-y-3">
              {formData.assembly_steps.map((st, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-800">Step {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="text-slate-400 hover:text-red-600 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Step Title (e.g. Tank Fitting)"
                    value={st.title}
                    onChange={(e) => {
                      const updated = [...formData.assembly_steps];
                      updated[idx].title = e.target.value;
                      setFormData({ ...formData, assembly_steps: updated });
                    }}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-300"
                  />
                  <textarea
                    rows={2}
                    placeholder="Exact instructions, measurements, and precautions..."
                    value={st.details}
                    onChange={(e) => {
                      const updated = [...formData.assembly_steps];
                      updated[idx].details = e.target.value;
                      setFormData({ ...formData, assembly_steps: updated });
                    }}
                    className="w-full p-2 text-xs rounded border border-slate-300"
                  />
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" size="sm" onClick={handleAddStep}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Assembly Step
            </Button>
          </div>

          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3.5 text-base font-extrabold shadow-lg hover:shadow-teal-500/30 shimmer-btn-fx"
              isLoading={submitting}
            >
              <Sparkles className="w-5 h-5 mr-2 text-amber-300" />
              Publish Open Hardware Invention
            </Button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
};

export default InventionCreate;
