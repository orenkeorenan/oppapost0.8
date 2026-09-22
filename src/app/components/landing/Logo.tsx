export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="logo">
      <div className="logo__wordmark">
        <span className={light ? "logo__oppa logo__oppa--light" : "logo__oppa"}>OPPA</span>
        <span className="logo__post">POST</span>
      </div>
      <div
        className={light ? "logo__tagline logo__tagline--light" : "logo__tagline"}
      >
        KOREA TO YOUR WORLD
      </div>
    </div>
  );
}
