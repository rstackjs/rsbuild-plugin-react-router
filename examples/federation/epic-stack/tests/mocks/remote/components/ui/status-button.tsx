import * as React from 'react'

export type StatusButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	status?: 'idle' | 'pending' | 'success' | 'error'
	asChild?: boolean
}

export function StatusButton({
	asChild,
	children,
	...props
}: StatusButtonProps) {
	if (asChild && React.isValidElement(children)) {
		return React.cloneElement(children, props as React.HTMLAttributes<HTMLElement>)
	}
	return (
		<button {...props} type={props.type ?? 'button'}>
			{children}
		</button>
	)
}
