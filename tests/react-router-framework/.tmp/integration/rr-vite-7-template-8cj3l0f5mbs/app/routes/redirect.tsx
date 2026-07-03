
import { data } from 'react-router';
export function loader() {
  return data(
    { food: "pizza" },
    {
      status: 301,
      headers: {
        Location: "/?redirected"
      }
    }
  );
}
export default function Redirect() {
  return null;
}
        