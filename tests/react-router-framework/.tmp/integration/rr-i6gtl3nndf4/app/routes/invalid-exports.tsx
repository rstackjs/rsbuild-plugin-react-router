
// Invalid exports
export function headers() {}
export function loader() {}
export function action() {}

// Valid exports
export function clientLoader() {}
export function clientAction() {}
export default function Component() {}
            