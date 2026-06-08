import React from "react";

type Props = {
	label: string;
	min: number;
	max: number;
	value: number;
	onChange: (val: number) => void;
};

export const AdjustmentSlider = ({ label, min, max, value, onChange }: Props) => {
	return (
		<div className="space-y-1">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium text-black-default">{label}</span>
				<input
					type="number"
					value={value}
					onChange={(e) => onChange(Number(e.target.value))}
					className="w-12 rounded border border-[#E6E6E6] py-0.5 text-center text-xs outline-none"
				/>
			</div>

			<div className="flex justify-between items-center gap-1 text-sm text-gray-neutral">
				<span>{min > 0 ? `-${min}` : min}</span>
				<input
					type="range"
					min={min}
					max={max}
					value={value}
					onChange={(e) => onChange(Number(e.target.value))}
					className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-[#A1A1A1] accent-primary"
				/>
				<span>{max}</span>
			</div>
		</div>
	);
};
