{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_20
    nodePackages.npm
    nodePackages.typescript
    nodePackages.@nestjs/cli
    nodePackages.firebase-admin
    postgresql_15
    redis
    minio
  ];

  shellHook = ''
    echo "🐳 Backend development environment loaded!"
    echo "📦 Available packages:"
    echo "   - Node.js $(node --version)"
    echo "   - npm $(npm --version)"
    echo "   - TypeScript $(tsc --version)"
    echo "   - NestJS CLI"
    echo "   - PostgreSQL 15"
    echo "   - Redis"
    echo "   - MinIO"
    echo ""
    echo "🚀 Start development with: npm run start:dev"
    echo "🗄️  Database commands: npm run db:generate, npm run db:migrate, npm run db:seed"
  '';
}
