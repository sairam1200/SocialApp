import React from "react";
import { CreatePostFormValues } from "@/types/media.types";
import { FormikProps } from "formik";
import { cn } from "@/utils/cn.util";
import { Button } from "../ui/button";
import PostIcon from "@/components/svg/post.svg";
import CalendarIcon from "@/components/svg/calendar.svg";
import { Select } from "../ui/select";
import { Input } from "../ui/input";
import { Clock, Info } from "lucide-react";
import { DatePicker } from "../ui/date-picker";
import { platformMap } from "@/constants/platforms";

type SettingsStepProps = {
	formik: FormikProps<CreatePostFormValues>;
};

const postOptions = [
	{
		// key: "now",
		label: "Post Now",
		icon: PostIcon,
		value: false,
	},
	{
		// key: "schedule",
		label: "Schedule Post",
		icon: CalendarIcon,
		value: true,
	},
] as const;

const timeSuggestions = ["09:00 AM", "12:00 PM", "06:00 PM"];

function SettingsStep({ formik }: SettingsStepProps) {
	const timeRef = React.useRef<HTMLInputElement>(null);

	const schedule = formik.values.postScheduleDate;

	const timeValue = schedule
		? `${String(schedule.getHours()).padStart(2, "0")}:${String(schedule.getMinutes()).padStart(2, "0")}`
		: "";

	const handleDateChange = (date: Date | null) => {
		if (!date) {
			formik.setFieldValue("postScheduleDate", null);
			return;
		}

		const hours = schedule?.getHours() ?? 0;
		const minutes = schedule?.getMinutes() ?? 0;

		date.setHours(hours);
		date.setMinutes(minutes);

		formik.setFieldValue("postScheduleDate", date);
	};

	const handleTimeChange = (time: string) => {
		if (!schedule) return;

		const [hours, minutes] = time.split(":").map(Number);
		const updated = new Date(schedule);
		updated.setHours(hours);
		updated.setMinutes(minutes);

		formik.setFieldValue("postScheduleDate", updated);
	};

	const handleSuggestionClick = (timeStr: string) => {
		if (!schedule) return;

		// Convert "09:00 AM" to 24-hour format
		const [time, modifier] = timeStr.split(" ");
		// eslint-disable-next-line prefer-const
		let [hours, minutes] = time.split(":").map(Number);

		if (modifier === "PM" && hours < 12) hours += 12;
		if (modifier === "AM" && hours === 12) hours = 0;

		const updated = new Date(schedule);
		updated.setHours(hours);
		updated.setMinutes(minutes);

		formik.setFieldValue("postScheduleDate", updated);
	};

	const isTimeSelected = (suggestion: string) => {
		if (!schedule) return false;

		const hours = schedule.getHours();
		const minutes = schedule.getMinutes();
		const ampm = hours >= 12 ? "PM" : "AM";
		const displayHours = hours % 12 || 12;

		const currentFormatted = `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${ampm}`;
		return currentFormatted === suggestion;
	};

	const isCustomPrivacy = formik.values.privacy === "custom";

	return (
		<div className="space-y-3">
			<div className="space-y-2">
				<label className="font-bold text-sm block">When do you want to post?</label>

				<div className="flex gap-3">
					{postOptions.map((option) => {
						const isActive = formik.values.postSchedule === option.value;
						const Icon = option.icon;

						return (
							<Button
								key={option.label}
								variant="secondary"
								className={cn(
									"text-[#0D0D0D] border border-primary-light flex-1/2 rounded-md font-normal shadow-none flex justify-between",
									isActive ? "bg-[#F0EBFF]" : "bg-transparent"
								)}
								onClick={() => {
									formik.setFieldValue("postSchedule", option.value);
									if (option.value === false) {
										formik.setFieldValue("postScheduleDate", null);
									} else if (option.value === true && !formik.values.postScheduleDate) {
										const defaultDate = new Date();
										defaultDate.setHours(defaultDate.getHours() + 1); // Default to 1 hour from now
										formik.setFieldValue("postScheduleDate", defaultDate);
									}
								}}
							>
								<span className="flex items-center gap-3 text-sm">
									<Icon />
									{option.label}
								</span>

								<span
									className={cn(
										"size-3 rounded-full",
										isActive ? "border-3 border-black-default" : "border border-primary-light"
									)}
								/>
							</Button>
						);
					})}
				</div>

				{formik.values.postSchedule && (
					<div className="bg-[#FAFAFA] border border-border p-2 rounded-md">
						<div className="flex gap-3">
							<span className="flex-1/2">
								<label className="font-bold text-sm block">Date</label>
								<DatePicker value={schedule} onChange={handleDateChange} />
							</span>
							<span className="flex-1/2">
								<label className="font-bold text-sm block">Time</label>

								<Input
									ref={timeRef}
									type="time"
									placeholder="hh:mm"
									leftIcon={<Clock className="size-5 text-[#0D0D0D]" />}
									value={timeValue}
									onClick={() => timeRef.current?.showPicker?.()}
									onChange={(e) => handleTimeChange(e.target.value)}
								/>
							</span>
						</div>
						<div className="bg-[#F0EBFF] border border-primary-light p-2 rounded-md mt-3">
							<span className="flex items-center gap-2">
								<Info className="size-5 fill-primary text-white" />
								<p className="text-primary text-xs">
									The best time to post is between 8AM and 10AM in the middle of the week if you want to have highest
									engagement.
								</p>
							</span>
							<span className="flex gap-3 mt-2">
								{timeSuggestions.map((time, i) => {
									const isSelected = isTimeSelected(time);

									return (
										<Button
											key={i}
											type="button"
											onClick={() => handleSuggestionClick(time)}
											className={cn(
												"bg-transparent text-[#333333] rounded-md flex-1/3 shadow-none text-xs font-normal transition-all",
												isSelected ? "border-primary border" : "border-gray-neutral border-[0.8px]"
											)}
											label={time}
										/>
									);
								})}
							</span>
						</div>

						{formik.errors.postScheduleDate && (
							<p className="text-xs text-destructive mt-2 ml-1">{formik.errors.postScheduleDate as string}</p>
						)}
					</div>
				)}
			</div>

			<div className="space-y-2">
				<label className="font-bold text-sm block">Privacy Settings</label>
				<Select
					placeholder="Select privacy"
					name="privacy"
					value={formik.values.privacy}
					onValueChange={(value) => formik.setFieldValue("privacy", value)}
					error={formik.touched.privacy && formik.errors.privacy ? formik.errors.privacy : ""}
					options={[
						{ value: "public", label: "Public" },
						{ value: "private", label: "Private" },
						{ value: "custom", label: "Customize by platform" },
					]}
				/>
				{isCustomPrivacy && (
					<div className="mt-2 border border-[#E6E6E6] bg-[#FAFAFA] rounded-lg divide-y divide-border overflow-hidden">
						{formik.values.platforms.map((platformId) => {
							const platform = platformMap[platformId];
							if (!platform) return null;

							return (
								<div key={platformId} className="flex items-center justify-between p-3">
									<div className="flex items-center gap-3">
										<platform.icon className="size-5" />
										<span className="text-sm font-medium">{platform.name}</span>
									</div>

									<div className="w-[200px] bg-white">
										<Select
											placeholder="Select visibility"
											value={formik.values.platformPrivacy?.[platformId] || "everyone"}
											onValueChange={(value) => formik.setFieldValue(`platformPrivacy.${platformId}`, value)}
											options={[
												{ value: "everyone", label: "Everyone" },
												{ value: "friends", label: "Friends" },
												{ value: "only_me", label: "Only Me" },
												{ value: "verified", label: "Verified Accounts only" },
											]}
										/>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}

export default SettingsStep;
