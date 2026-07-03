import type { Route } from "./+types/env";
import { cloudflareContext } from "../cloudflare";
export function loader({ context }: Route.LoaderArgs) {
  return { message: context.get(cloudflareContext).env.VALUE_FROM_CLOUDFLARE };
}
export default function EnvRoute({ loaderData }: Route.RouteComponentProps) {
  return <div data-loader-message>{loaderData.message}</div>;
}