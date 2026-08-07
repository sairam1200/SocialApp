"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { StepIndicator } from "./StepIndicator";
import {
  StepOneAbout,
  StepTwoInterests,
  StepThreeSocials,
  StepFourReview,
  ProfileFormData,
  Interest,
} from "./ProfileSteps";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/apiClient.service";
import { completeOnboardingAction } from "@/actions/token.actions";

const DEFAULT_FORM_DATA: ProfileFormData = {
  username: "",
  email: "",
  bio: "",
  interests: [],
  connectedAccounts: {},
  profileImage: null,
  profileImagePreview: undefined,
};

export default function ProfileCreationSystem() {
  const [step, setStep] = useState<number>(1);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const [topics, setTopics] = useState<Interest[]>([]);
  const [formData, setFormData] = useState<ProfileFormData>(DEFAULT_FORM_DATA);

  const loadTopics = useCallback(async () => {
    try {
      const result = await apiClient.Onboarding.getTopicsAsync();
      setTopics(result.data ?? []);
    } catch {
      // Topic loading is non-fatal; the step remains empty and cannot submit.
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await apiClient.Token.currentAsync();

        setFormData((current) => ({
          ...current,
          username: current.username || user.username || "",
          email: current.email || user.email || "",
          profileImagePreview:
            current.profileImagePreview || user.photo || undefined,
        }));

        if (user.onboardingStep === "Completed") {
          router.replace("/discover");
          return;
        }

        await loadTopics();
      } catch {
        // silent
      }
    };

    init();
  }, [loadTopics, router]);
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("profile_wizard_data");

      const savedStep = localStorage.getItem("profile_wizard_step");

      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);

          setFormData({
            ...DEFAULT_FORM_DATA,
            ...parsed,
          });
        } catch {
          // silent
        }
      }

      if (savedStep) {
        const parsedStep = Number(savedStep);

        if (!Number.isNaN(parsedStep) && parsedStep >= 1 && parsedStep <= 4) {
          setStep(parsedStep);
        }
      }
    } catch {
      // silent
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const timer = setTimeout(() => {
      const dataToSave = { ...formData };
      delete dataToSave.profileImagePreview;
      try {
        localStorage.setItem("profile_wizard_data", JSON.stringify(dataToSave));
        localStorage.setItem("profile_wizard_step", step.toString());
      } catch {
        // silent
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData, step, isLoaded]);
  const handleStep1Next = async () => {
    await apiClient.Onboarding.saveStep1Async({
      username: formData.username, // Assuming you want to use fullName as username for now, adjust as needed
      bio: formData.bio,
    });

    setStep(2);
  };
  const handleStep2Next = async () => {
    try {
      setError("");

      if (formData.interests.length === 0) {
        toast.error("Please select at least one interest.");
        return;
      }

      await apiClient.Onboarding.saveStep2Async({
        topicIds: formData.interests,
      });

      toast.success("Interests saved successfully!");

      setStep(3);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save interests.",
      );
    }
  };
  const handleStep3Next = async () => {
    try {
      setIsSubmitting(true);

      const response = await apiClient.Onboarding.saveStep3Async({
        connectedAccounts: formData.connectedAccounts,
      });

      if (!response?.success && !response?.succeeded) {
        throw new Error(
          response?.message ?? "Failed to save connected accounts",
        );
      }

      toast.success("Connected profiles saved");

      setStep(4);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save connected accounts",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleStep4Submit = async () => {
    try {
      setIsSubmitting(true);

      const response = await completeOnboardingAction();

      if (!response.success) {
        throw new Error(response.message || "Failed to complete onboarding");
      }

      localStorage.removeItem("profile_wizard_data");

      localStorage.removeItem("profile_wizard_step");

      // Store new JWT with updated onboardingStep claim
      // The server action rotates the HTTP-only session cookie when the
      // onboarding endpoint returns an updated access token.

      // Refresh stored currentUser with fresh data from backend
      try {
        const currentUser = await apiClient.Token.currentAsync();
        void currentUser;
      } catch {
        // non-critical — the new JWT carries the updated onboardingStep
      }

      toast.success("Onboarding completed successfully!");
      router.replace("/discover");
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to complete onboarding",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleInterestToggle = (topicId: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(topicId)
        ? prev.interests.filter((id) => id !== topicId)
        : [...prev.interests, topicId],
    }));
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
        profileImagePreview: reader.result as string,
      }));

      toast.success("Image uploaded successfully!");
    };

    reader.readAsDataURL(file);
  };

  const handleSkip = async () => {
    try {
      const result = await completeOnboardingAction();
      if (!result.success) throw new Error(result.message);
      localStorage.removeItem("profile_wizard_data");
      localStorage.removeItem("profile_wizard_step");
      toast.success("Onboarding skipped");
      router.replace("/discover");
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch {
      router.replace("/discover");
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="mx-auto my-[-25px] rounded-2xl max-w-4xl min-h-screen flex flex-col">
      <StepIndicator step={step} />

      <div className="flex justify-end px-6 mb-2">
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm font-medium text-[#514667] hover:text-[#24183f] transition-colors"
          aria-label="Skip onboarding"
        >
          Skip for now
        </button>
      </div>

      {error && (
        <div className="mb-6 mx-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center animate-in slide-in-from-top-2">
          <AlertTriangle className="mr-2" size={20} />
          {error}
        </div>
      )}

      {step === 1 && (
        <StepOneAbout
          formData={formData}
          handleChange={handleChange}
          handleImageChange={handleImageChange}
          onNext={handleStep1Next}
        />
      )}
      {step === 2 && (
        <StepTwoInterests
          formData={formData}
          topics={topics}
          toggleInterest={handleInterestToggle}
          onBack={() => setStep(1)}
          onNext={handleStep2Next}
        />
      )}
      {step === 3 && (
        <StepThreeSocials
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          onBack={() => setStep(2)}
          onSubmit={handleStep3Next}
        />
      )}
      {step === 4 && (
        <StepFourReview
          formData={formData}
          topics={topics}
          onBack={() => setStep(step - 1)}
          onEdit={(s) => setStep(s)}
          onSubmit={handleStep4Submit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
