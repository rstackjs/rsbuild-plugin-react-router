import * as React from 'react'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	asChild?: boolean
}

export function Button({ asChild, children, ...props }: ButtonProps) {
	if (asChild && React.isValidElement(children)) {
		return React.cloneElement(children, props as React.HTMLAttributes<HTMLElement>)
	}
	return (
		<button {...props} type={props.type ?? 'button'}>
			{children}
		</button>
	)
}
