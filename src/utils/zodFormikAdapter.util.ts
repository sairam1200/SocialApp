import { z } from "zod";
import { FormikErrors, FormikValues } from "formik";

/**
 * Converts a Zod schema to a Formik validation function
 */
export function toFormikValidation<T extends FormikValues>(schema: z.ZodSchema<T>) {
	return async (values: T): Promise<FormikErrors<T>> => {
		try {
			await schema.parseAsync(values);
			return {};
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errors: FormikErrors<T> = {};
				error.issues.forEach((issue: z.ZodIssue) => {
					const path = issue.path.map(String).join(".");
					if (path) {
						(errors as Record<string, string>)[path] = issue.message;
					}
				});
				return errors;
			}
			return {};
		}
	};
}
