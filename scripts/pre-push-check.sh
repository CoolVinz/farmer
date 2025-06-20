#!/bin/bash

echo "🔍 Pre-push Code Quality Check"
echo "============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if we found any issues
ISSUES=0

# Check 1: Ensure no .env files are staged
echo "📁 Checking for staged environment files..."
STAGED_ENV=$(git diff --cached --name-only | grep -E '\.env')
if [ ! -z "$STAGED_ENV" ]; then
    echo -e "${RED}❌ CRITICAL: Environment files are staged for commit!${NC}"
    echo "   Staged files: $STAGED_ENV"
    echo "   Run: git reset HEAD .env*"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ No environment files staged${NC}"
fi

# Check 2: Ensure build works
echo "🔨 Testing build..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ CRITICAL: Build failed!${NC}"
    echo "   Run: npm run build (to see detailed errors)"
    ISSUES=$((ISSUES + 1))
fi

# Check 3: Lint check
echo "🧹 Running linter..."
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Linting passed${NC}"
else
    echo -e "${YELLOW}⚠️ WARNING: Linting issues found${NC}"
    echo "   Run: npm run lint (to see details)"
    echo "   Consider fixing before push"
fi

# Summary
echo ""
echo "📊 Summary"
echo "=========="

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 SAFE TO PUSH! All critical checks passed.${NC}"
    echo ""
    echo "✅ No sensitive environment files will be committed"
    echo "✅ Build works correctly"
    echo ""
    echo "🚀 Ready to push!"
    exit 0
else
    echo -e "${RED}🚨 DO NOT PUSH! Found $ISSUES critical issue(s).${NC}"
    echo ""
    echo "Fix these issues before pushing:"
    echo "1. Ensure no .env files are staged"
    echo "2. Fix any build failures"
    echo ""
    echo "Run this script again after fixes: npm run pre-push"
    exit 1
fi