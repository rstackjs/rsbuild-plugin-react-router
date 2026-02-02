export function combineHeaders(
	...headers: Array<ResponseInit['headers'] | null | undefined>
) {
	const combined = new Headers()
	for (const header of headers) {
		if (!header) continue
		for (const [key, value] of new Headers(header).entries()) {
			combined.append(key, value)
		}
	}
	return combined
}

export function combineResponseInits(
	...responseInits: Array<ResponseInit | null | undefined>
) {
	let combined: ResponseInit = {}
	for (const responseInit of responseInits) {
		combined = {
			...responseInit,
			headers: combineHeaders(combined.headers, responseInit?.headers),
		}
	}
	return combined
}

export function getDomainUrl(request: Request) {
	return new URL(request.url).origin
}

export function getUserImgSrc(id?: string | null) {
	return id ? `/resources/user-images/${id}` : '/resources/user-images/placeholder'
}

export function getNoteImgSrc(id?: string | null) {
	return id ? `/resources/note-images/${id}` : '/resources/note-images/placeholder'
}

export function getReferrerRoute(request: Request, fallback = '/') {
	const referrer = request.headers.get('referer')
	if (!referrer) return fallback
	try {
		return new URL(referrer).pathname || fallback
	} catch {
		return fallback
	}
}

export function cn(...inputs: Array<string | undefined | null | false>) {
	return inputs.filter(Boolean).join(' ')
}

export function useIsPending() {
	return false
}

export function useDelayedIsPending() {
	return false
}

export function useDebounce<T>(value: T) {
	return value
}

export function useDoubleCheck() {
	return {
		doubleCheck: false,
		getButtonProps: <T extends Record<string, unknown>>(props: T = {} as T) =>
			props,
		reset: () => {},
	}
}
