const Footer = () => (
  <footer className="border-t border-border/30 py-8 mt-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <span className="font-display text-xl">
        <span className="text-foreground">Codez</span>
        <span className="text-primary">Show</span>
      </span>
      <p className="text-muted-foreground text-sm">© 2026 CodezShow. All rights reserved.</p>
      <div className="flex gap-5 text-sm text-muted-foreground">
        {["Privacy", "Terms", "Contact"].map((l) => (
          <a key={l} href="#" className="hover:text-foreground transition-colors">{l}</a>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;
