import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import { data, redirect } from 'react-router'
import {
	ThemeFormSchema,
	ThemeSwitch,
	useOptionalTheme,
	useOptimisticThemeMode,
	useTheme,
} from '#app/components/theme-switch.tsx'
import { setTheme } from '#app/utils/theme.server.ts'
import { type Route } from './+types/theme-switch.ts'

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: ThemeFormSchema,
	})

	invariantResponse(submission.status === 'success', 'Invalid theme received')

	const { theme, redirectTo } = submission.value

	const responseInit = {
		headers: { 'set-cookie': setTheme(theme) },
	}
	if (redirectTo) {
		return redirect(redirectTo, responseInit)
	} else {
		return data({ result: submission.reply() }, responseInit)
	}
}

export { ThemeSwitch, useOptionalTheme, useOptimisticThemeMode, useTheme }
