"use client";

import { useState } from "react";
import type { AiModel } from "@/types/AiModel";
import {AI_MODELS} from "@/components/config/ai-models";
import { useAnalysisStream } from "@/components/analysis/AnalysisStreamProvider";

export default function StartAnalyzeForm() {
    const [step, setStep] = useState(0);
    const [selectedModel, setSelectedModel] = useState<AiModel | null>(null);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState("");

    const {
        analysis: streamingAnalysis,
        startAnalysis,
    } = useAnalysisStream();

    const isAnalyzing =
    streamingAnalysis.status === "starting" ||
    streamingAnalysis.status === "streaming";
    
    const handleCancel = () => {
        setStep(0);
        setCvFile(null);
        setSelectedModel(null);
        setJobDescription("");
    };

    const handleCvChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        if (file.type !== "application/pdf") {
            alert("Please upload a PDF file.");
            e.target.value = "";
            return;
        }

        setCvFile(file);
    };

    const handleAnalyze = () => {
        if (!cvFile) {
            alert(
            "Please upload a CV file before analyzing."
            );
            return;
        }

        if (!selectedModel) {
            alert(
            "Please select an AI model before analyzing."
            );
            return;
        }

        if (
            !jobDescription.trim()
        ) {
            alert(
            "Please provide a job description before analyzing."
            );
            return;
        }

        void startAnalysis({
            resume: cvFile,
            jobDescription:
            jobDescription.trim(),
            aiModel:
            selectedModel.id,
        });
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
                
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white">
                        AI Resume Analyzer
                    </h2>
                    <p className="text-sm text-gray-400 mt-2">
                        Upload your CV and compare it against a job description.
                    </p>
                </div>

                <div className="flex items-center gap-3 mb-8">
                    {[0, 1, 2].map((item) => (
                        <div key={item} className="flex-1">
                            <div
                                className={`h-1.5 rounded-full transition ${
                                    step >= item
                                        ? "bg-blue-600"
                                        : "bg-gray-800"
                                }`}
                            />
                        </div>
                    ))}
                </div>

                {step === 0 && (
                    <div className="text-center py-8">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 border border-blue-500/30">
                            <span className="text-3xl">📄</span>
                        </div>

                        <h3 className="text-xl font-semibold text-white mb-3">
                            Start CV Analysis
                        </h3>

                        <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto">
                            Upload your resume and provide a job description to get an AI-powered match analysis.
                        </p>

                        <button
                            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition font-semibold text-white shadow-lg"
                            onClick={() => setStep(1)}
                        >
                            Analyze Curriculum Vitae (CV)
                        </button>
                    </div>
                )}

                {step === 1 && (
                    <div>
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-white">
                                Upload CV
                            </h3>
                            <p className="text-sm text-gray-400 mt-2">
                                Please upload your CV as a PDF file.
                            </p>
                        </div>

                        <label className="flex flex-col items-center justify-center w-full min-h-48 border-2 border-dashed border-gray-700 rounded-2xl bg-gray-800/40 hover:bg-gray-800/70 hover:border-blue-500/50 transition cursor-pointer">
                            <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-900 border border-gray-700">
                                    <span className="text-2xl">⬆️</span>
                                </div>

                                <p className="text-sm font-medium text-gray-300">
                                    Click to upload your CV
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    PDF files only
                                </p>
                            </div>

                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleCvChange}
                                className="hidden"
                            />
                        </label>

                        {cvFile && (
                            <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
                                <p className="text-sm text-green-400 font-medium">
                                    Selected: {cvFile.name}
                                </p>
                            </div>
                        )}

                        <div className="mt-6">
                            <label className="block mb-2 text-sm font-medium text-gray-300">
                                Select AI Model
                            </label>
                            <select
                                value={selectedModel?.id ?? ""}
                                onChange={(e) => {
                                    const model = AI_MODELS.find(
                                        (m) => m.id === e.target.value
                                    );
                                    setSelectedModel(model || null);
                                }}
                                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            >
                                <option value="" disabled>
                                    -- Select a model --
                                </option>
                                {AI_MODELS.map((model) => (
                                    <option key={model.id} value={model.id}>
                                        {model.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition font-medium border border-gray-700"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                disabled={!cvFile || !selectedModel}
                                className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition font-semibold text-white shadow-lg"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-white">
                                Job Description
                            </h3>
                            <p className="text-sm text-gray-400 mt-2">
                                Paste the job description you want to compare your CV against.
                            </p>
                        </div>

                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Enter the job description..."
                            className="w-full min-h-52 resize-none px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />

                        {cvFile && (
                            <div className="mt-4 rounded-lg bg-gray-800/60 border border-gray-700 px-4 py-3">
                                <p className="text-xs text-gray-500 mb-1">
                                    Selected CV
                                </p>
                                <p className="text-sm text-gray-300 truncate">
                                    {cvFile.name}
                                </p>
                            </div>
                        )}

                        {streamingAnalysis.error && (
                            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
                                <p className="text-sm text-red-400">
                                    {streamingAnalysis.error}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 mt-8">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="py-3 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition font-medium border border-gray-700"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="py-3 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition font-medium border border-gray-700"
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !jobDescription.trim()}
                                className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition font-semibold text-white shadow-lg"
                            >
                                {isAnalyzing ? "Analyzing..." : "Analyze"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}