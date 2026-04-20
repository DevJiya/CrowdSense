# CrowdSense Quality Pipeline Setup Script
Write-Host "🚀 Initializing CrowdSense Tactical Quality Pipeline..." -ForegroundColor Cyan

# 1. Install Dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install --save-dev eslint prettier husky lint-staged @eslint/js globals eslint-plugin-n eslint-plugin-security eslint-plugin-import eslint-config-prettier eslint-plugin-prettier --legacy-peer-deps

# 2. Initialize Husky
Write-Host "🐶 Initializing Husky..." -ForegroundColor Yellow
npx husky init
if (Test-Path .husky/pre-commit) {
    Set-Content .husky/pre-commit "npx lint-staged"
} else {
    New-Item -Path .husky/pre-commit -ItemType File -Value "npx lint-staged"
}

# 3. Final Validation
Write-Host "🔍 Running initial lint check..." -ForegroundColor Yellow
npm run lint

Write-Host "✨ Quality Pipeline Active! Commit blocked if lint fails." -ForegroundColor Green
