export function meta() {
  return [{ title: 'Rsbuild RSC example' }];
}

export default function ClientRoute() {
  return (
    <section className="page-shell client-route">
      <h1>Client-first route</h1>
      <p>
        This route uses the conventional default route component export so the
        example exercises navigation between server-first and client-first
        routes.
      </p>
    </section>
  );
}
