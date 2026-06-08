"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type DatePickerProps = {
	value: Date | null;
	onChange: (date: Date | null) => void;
};

function isValidDate(date: Date | undefined) {
	if (!date) return false;
	return !isNaN(date.getTime());
}

export function DatePicker({ value, onChange }: DatePickerProps) {
	const [open, setOpen] = React.useState(false);
	const [date, setDate] = React.useState<Date | undefined>(value ?? undefined);
	const [inputValue, setInputValue] = React.useState(value ? format(value, "dd/MM/yyyy") : "");

	React.useEffect(() => {
		if (!value) {
			setDate(undefined);
			setInputValue("");
			return;
		}

		setDate(value);
		setInputValue(format(value, "dd/MM/yyyy"));
	}, [value]);

	const handleInputChange = (raw: string) => {
		setInputValue(raw);

		const parsed = parse(raw, "dd/MM/yyyy", new Date());
		if (isValidDate(parsed)) {
			setDate(parsed);
			onChange(parsed);
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger className="w-full">
				<Input
					id="date"
					value={inputValue}
					placeholder="dd/mm/yyyy"
					leftIcon={<CalendarIcon className="size-5 text-[#0D0D0D]" />}
					onChange={(e) => {
						handleInputChange(e.target.value);
					}}
					onKeyDown={(e) => {
						if (e.key === "ArrowDown") {
							e.preventDefault();
							setOpen(true);
						}
					}}
				/>
			</PopoverTrigger>

			<PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
				<Calendar
					mode="single"
          // buttonVariant="text"
          
					selected={date}
					captionLayout="dropdown"
					onSelect={(selected) => {
						if (!selected) return;

						setDate(selected);
						setInputValue(format(selected, "dd/MM/yyyy"));
						onChange(selected);
						setOpen(false);
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}
