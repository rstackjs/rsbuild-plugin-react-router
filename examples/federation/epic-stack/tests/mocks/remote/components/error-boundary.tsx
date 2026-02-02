import type { ReactNode } from 'react'

type StatusHandler = (args: { params?: Record<string, string> }) => ReactNode

export function GeneralErrorBoundary({
	children,
	statusHandlers,
}: {
	children?: ReactNode
	statusHandlers?: Record<number, StatusHandler>
}) {
	if (statusHandlers?.[404]) {
		return statusHandlers[404]({ params: {} })
	}
	return children ?? null
}
