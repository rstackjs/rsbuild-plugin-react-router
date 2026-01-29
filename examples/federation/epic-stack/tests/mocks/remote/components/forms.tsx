import * as React from 'react'

export type ListOfErrors = Array<string | null | undefined> | null | undefined

export function ErrorList({
	id,
	errors,
}: {
	id?: string
	errors?: ListOfErrors
}) {
	const errorsToRender = errors?.filter(Boolean)
	if (!errorsToRender?.length) return null
	return (
		<ul id={id}>
			{errorsToRender.map((error) => (
				<li key={error ?? 'error'}>{error}</li>
			))}
		</ul>
	)
}

export function Field({
	labelProps,
	inputProps,
	errors,
	className,
}: {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	inputProps: React.InputHTMLAttributes<HTMLInputElement>
	errors?: ListOfErrors
	className?: string
}) {
	const id = inputProps.id ?? inputProps.name
	const errorId = errors?.length ? `${id}-error` : undefined
	return (
		<div className={className}>
			<label htmlFor={id} {...labelProps} />
			<input
				id={id}
				aria-invalid={errorId ? true : undefined}
				aria-describedby={errorId}
				{...inputProps}
			/>
			{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
		</div>
	)
}

export function TextareaField({
	labelProps,
	textareaProps,
	errors,
	className,
}: {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	textareaProps: React.TextareaHTMLAttributes<HTMLTextAreaElement>
	errors?: ListOfErrors
	className?: string
}) {
	const id = textareaProps.id ?? textareaProps.name
	const errorId = errors?.length ? `${id}-error` : undefined
	return (
		<div className={className}>
			<label htmlFor={id} {...labelProps} />
			<textarea
				id={id}
				aria-invalid={errorId ? true : undefined}
				aria-describedby={errorId}
				{...textareaProps}
			/>
			{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
		</div>
	)
}

export function OTPField({
	labelProps,
	inputProps,
	errors,
	className,
}: {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	inputProps: React.InputHTMLAttributes<HTMLInputElement>
	errors?: ListOfErrors
	className?: string
}) {
	return (
		<Field
			labelProps={labelProps}
			inputProps={inputProps}
			errors={errors}
			className={className}
		/>
	)
}

export function CheckboxField({
	labelProps,
	buttonProps,
	errors,
	className,
}: {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	buttonProps: React.InputHTMLAttributes<HTMLInputElement> & { name: string }
	errors?: ListOfErrors
	className?: string
}) {
	const id = buttonProps.id ?? buttonProps.name
	const errorId = errors?.length ? `${id}-error` : undefined
	return (
		<div className={className}>
			<input
				{...buttonProps}
				id={id}
				type="checkbox"
				aria-invalid={errorId ? true : undefined}
				aria-describedby={errorId}
			/>
			<label htmlFor={id} {...labelProps} />
			{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
		</div>
	)
}
