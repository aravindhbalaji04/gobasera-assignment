{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_20
    nodePackages.npm
    nodePackages.typescript
  ];

  shellHook = ''
    echo "🎨 Frontend development environment loaded!"
    echo "📦 Available packages:"
    echo "   - Node.js $(node --version)"
    echo "   - npm $(npm --version)"
    echo "   - TypeScript $(tsc --version)"
    echo ""
    echo "🚀 Start development with: npm run dev"
    echo "🧪 Run tests with: npm run test"
    echo "🔍 Type checking with: npm run type-check"
  '';
}
