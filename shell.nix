{ pkgs ? import <nixpkgs> {} }:

let
  nodejs = pkgs.nodejs_18;
  npm = pkgs.nodePackages.npm;
  docker = pkgs.docker;
  docker-compose = pkgs.docker-compose;
  git = pkgs.git;
in

pkgs.mkShell {
  buildInputs = [
    nodejs
    npm
    docker
    docker-compose
    git
  ];

  shellHook = ''
    echo "🚀 Society Registration System Development Environment"
    echo "====================================================="
    echo "Available packages:"
    echo "  - Node.js $(node --version)"
    echo "  - npm $(npm --version)"
    echo "  - Docker $(docker --version)"
    echo "  - Docker Compose $(docker-compose --version)"
    echo "  - Git $(git --version)"
    echo ""
    echo "To start development:"
    echo "  npm run dev"
    echo ""
    echo "To setup infrastructure:"
    echo "  npm run docker:up"
    echo ""
    echo "To run tests:"
    echo "  npm run test"
    echo ""
  '';

  # Environment variables
  NIX_SHELL_PRESERVE_PROMPT = "1";
}
