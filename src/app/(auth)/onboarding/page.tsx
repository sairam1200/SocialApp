'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/utils/cn.util';
import { AlertTriangle } from 'lucide-react';
import {
    StepOneAbout,
    StepTwoInterests,
    StepThreeSocials,
    StepFourReview,
    ProfileFormData,
    Interest
} from './ProfileSteps';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/services/apiClient.service';
import { setCookie } from '@/utils/cookie.util';
import { COOKIE_NAMES } from '@/constants/globals';

const StepIndicator = ({ step }: { step: number }) => (
    <div className="w-full max-w-4xl mx-auto p-6 flex-none">
        <div className="text-[#6e08b8] font-bold mb-4 text-md">Step {step}/4</div>
        <div className="grid grid-cols-4 gap-2 mb-2">
            {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className={cn("h-2 rounded-full border-2 transition-colors duration-300", step >= stepNumber ? "bg-[#aa2fff] border-[#aa2fff]" : "bg-transparent border-indigo-200")} />
            ))}
        </div>
        <div className="grid grid-cols-4 gap-2">
            {["About you", "Interests", "Connected profiles", "Review profile"].map((label, index) => (
                <span key={index} className={cn("text-[10px] md:text-xs text-center font-medium", step >= index + 1 ? "text-gray-800" : "text-gray-400")}>
                    {label}
                </span>
            ))}
        </div>
    </div>
);

export default function ProfileCreationSystem() {
    const [step, setStep] = useState<number>(1);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const router = useRouter();
    const [topics, setTopics] =
        useState<Interest[]>([]);
    const currentUser =
        typeof window !== "undefined"
            ? JSON.parse(
                localStorage.getItem(
                    "currentUser"
                ) ?? "{}"
            )
            : {};
    const DEFAULT_FORM_DATA: ProfileFormData = {
        username:
            currentUser?.username ?? "",
        email:
            currentUser?.email ?? "",
        bio: "",
        interests: [],
        connectedAccounts: {},
        profileImage: currentUser?.profileImageUrl ?? null,
        profileImagePreview: currentUser?.profileImageUrl ?? null,
    };
    const [formData, setFormData] =
        useState<ProfileFormData>(DEFAULT_FORM_DATA);
    useEffect(() => {
    const init = async () => {
        try {
            const user = await apiClient.Token.currentAsync();

            if (user.onboardingStep === "Completed") {
                router.replace("/discover");
                return;
            }

            await loadTopics();
        } catch (err) {
            console.error(err);
        }
    };

    init();
}, []);

    const loadTopics = async () => {
        try {
            const result =
                await apiClient.Onboarding.getTopicsAsync();


            setTopics(result.data ?? []);
        } catch (error) {
            console.error(
                "LOAD TOPICS ERROR:",
                error
            );
        }
    };
    useEffect(() => {
        try {
            const savedData =
                localStorage.getItem("profile_wizard_data");

            const savedStep =
                localStorage.getItem("profile_wizard_step");

            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);

                    setFormData({
                        ...DEFAULT_FORM_DATA,
                        ...parsed,
                    });
                } catch (error) {
                    console.error(
                        "Invalid onboarding cache:",
                        error
                    );

                    localStorage.removeItem(
                        "profile_wizard_data"
                    );
                }
            }

            if (savedStep) {
                const parsedStep =
                    Number(savedStep);

                if (
                    !Number.isNaN(parsedStep) &&
                    parsedStep >= 1 &&
                    parsedStep <= 4
                ) {
                    setStep(parsedStep);
                }
            }
        } catch (error) {
            console.error("Failed to read onboarding cache:", error);
        }

        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (!isLoaded) return;

        const timer = setTimeout(() => {
            const { profileImagePreview, ...dataToSave } = formData;
            try {
                localStorage.setItem(
                    "profile_wizard_data",
                    JSON.stringify(dataToSave)
                );
                localStorage.setItem(
                    "profile_wizard_step",
                    step.toString()
                );
            } catch (error) {
                console.error("Failed to save onboarding progress:", error);
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
                toast.error(
                    "Please select at least one interest."
                );
                return;
            }

            await apiClient.Onboarding.saveStep2Async({
                topicIds: formData.interests,
            });

            toast.success(
                "Interests saved successfully!"
            );

            setStep(3);
        } catch (error) {
            console.error(
                "STEP 2 ERROR:",
                error
            );

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to save interests."
            );
        }
    };
    const handleStep3Next = async () => {
	try {
		setIsSubmitting(true);

		console.log(
			"CONNECTED ACCOUNTS:",
			formData.connectedAccounts
		);

		const response =
			await apiClient.Onboarding.saveStep3Async({
				connectedAccounts:
					formData.connectedAccounts,
			});

		console.log(
			"STEP 3 RESPONSE:",
			response
		);

		if (
			!response?.success &&
			!response?.succeeded
		) {
			throw new Error(
				response?.message ??
					"Failed to save connected accounts"
			);
		}

		toast.success(
			"Connected profiles saved"
		);

		setStep(4);
	} catch (error) {
		console.error(
			"STEP 3 ERROR:",
			error
		);

		toast.error(
			error instanceof Error
				? error.message
				: "Failed to save connected accounts"
		);
	} finally {
		setIsSubmitting(false);
	}
};
const handleStep4Submit = async () => {
  try {
    setIsSubmitting(true);

    const response =
      await apiClient.Onboarding.completeStep4Async({
        confirmed: true,
      });

    console.log(
      "STEP 4 RESPONSE:",
      response
    );

    if (
      response &&
      "isCompleted" in response &&
      !response.isCompleted
    ) {
      throw new Error(
        "Failed to complete onboarding"
      );
    }

    localStorage.removeItem(
      "profile_wizard_data"
    );

    localStorage.removeItem(
      "profile_wizard_step"
    );

    // Store new JWT with updated onboardingStep claim
    if (response.accessToken) {
      localStorage.setItem("accessToken", response.accessToken);
      setCookie(COOKIE_NAMES.ACCESS_TOKEN, response.accessToken, {
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    // Refresh stored currentUser with fresh data from backend
    try {
      const currentUser = await apiClient.Token.currentAsync();
      if (currentUser?.id) {
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      }
    } catch {
      // non-critical — the new JWT carries the updated onboardingStep
    }
    
    toast.success(
      "Onboarding completed successfully!"
    );
    router.replace("/discover");
    setTimeout(() => { router.refresh(); }, 500);
  } catch (error) {
    console.error(
      "STEP 4 ERROR:",
      error
    );

    toast.error(
      error instanceof Error
        ? error.message
        : "Failed to complete onboarding"
    );
  } finally {
    setIsSubmitting(false);
  }
};
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleInterestToggle = (topicId: string) => {
    setFormData(prev => ({
        ...prev,
        interests: prev.interests.includes(topicId)
            ? prev.interests.filter(id => id !== topicId)
            : [...prev.interests, topicId]
    }));
};
    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
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
    
    if (!isLoaded) return null;

    return (
        <div className="mx-auto my-[-25px] rounded-2xl max-w-4xl min-h-screen flex flex-col">
            <StepIndicator step={step} />

            {error && (
                <div className="mb-6 mx-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center animate-in slide-in-from-top-2">
                    <AlertTriangle className="mr-2" size={20} />
                    {error}
                </div>
            )}

            {step === 1 && <StepOneAbout formData={formData} handleChange={handleChange} handleImageChange={handleImageChange} onNext={handleStep1Next} />}
            {step === 2 && <StepTwoInterests formData={formData} topics={topics} toggleInterest={handleInterestToggle} onBack={() => setStep(1)} onNext={handleStep2Next} />}
            {step === 3 && <StepThreeSocials formData={formData} setFormData={setFormData} isSubmitting={isSubmitting} onBack={() => setStep(2)} onSubmit={handleStep3Next} />}
            {step === 4 && <StepFourReview formData={formData}  topics={topics} onBack={() => setStep(step - 1)} onEdit={(s) => setStep(s)} onSubmit={handleStep4Submit} isSubmitting={isSubmitting} />}
        </div>
    );
}