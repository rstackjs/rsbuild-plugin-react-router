
import { Outlet } from "react-router"

export default function Root() {
  return (
    <html>
      <body>
        hello world
        <Outlet />
      </body>
    </html>
  );
}
          