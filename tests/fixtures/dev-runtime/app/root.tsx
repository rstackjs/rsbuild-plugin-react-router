import { Outlet } from 'react-router';

export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  );
}
