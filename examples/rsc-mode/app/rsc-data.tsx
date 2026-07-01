export async function getRscShowcase() {
  return {
    message: 'Message rendered by an RSC loader',
    element: (
      <strong data-testid="server-element">
        React element returned from the server loader
      </strong>
    ),
  };
}
