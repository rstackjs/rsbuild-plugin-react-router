
export function loader({ request }) {
  return fetch(new URL(request.url).origin + '/fetch-target');
}
          