#!/bin/bash

echo "🚀 Setting up GitHub repository for kipraxishelfer"
echo "=================================================="
echo ""

# Check if repository name is provided
if [ -z "$1" ]; then
    echo "❌ Please provide your GitHub username as an argument"
    echo "Usage: ./setup-github.sh YOUR_GITHUB_USERNAME"
    echo ""
    echo "Example: ./setup-github.sh taieb"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="kipraxishelfer"
REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo "📋 Repository Details:"
echo "   Username: $GITHUB_USERNAME"
echo "   Repository: $REPO_NAME"
echo "   URL: $REPO_URL"
echo ""

echo "🔧 Setting up remote origin..."
git remote add origin $REPO_URL

echo "✅ Remote origin added!"
echo ""

echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "🎉 Success! Your repository is now on GitHub:"
echo "   $REPO_URL"
echo ""
echo "📝 Next steps:"
echo "   1. Go to $REPO_URL"
echo "   2. Verify all files are there"
echo "   3. Update repository description if needed"
echo "   4. Add topics/tags for better discoverability"
echo ""
echo "🔗 To push future changes:"
echo "   git add ."
echo "   git commit -m 'Your commit message'"
echo "   git push" 