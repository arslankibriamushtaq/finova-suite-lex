#!/bin/bash

# Convert all blue colors to black/gray in InvestorPages

echo "🎨 Converting blue colors to black/gray theme..."
echo ""

count=0
find src/pages/InvestorPages -name "*.tsx" -type f -not -name "*.backup*" | while read file; do
  # Background colors
  sed -i '' 's/bg-blue-600/bg-black/g' "$file"
  sed -i '' 's/bg-blue-700/bg-gray-800/g' "$file"
  sed -i '' 's/bg-blue-500/bg-gray-700/g' "$file"
  sed -i '' 's/bg-blue-400/bg-gray-600/g' "$file"
  sed -i '' 's/bg-blue-50/bg-gray-50/g' "$file"
  sed -i '' 's/bg-blue-100/bg-gray-100/g' "$file"
  
  # Text colors
  sed -i '' 's/text-blue-600/text-black/g' "$file"
  sed -i '' 's/text-blue-700/text-gray-800/g' "$file"
  sed -i '' 's/text-blue-500/text-gray-700/g' "$file"
  sed -i '' 's/text-blue-400/text-gray-600/g' "$file"
  sed -i '' 's/text-blue-800/text-gray-900/g' "$file"
  
  # Border colors
  sed -i '' 's/border-blue-600/border-black/g' "$file"
  sed -i '' 's/border-blue-500/border-gray-700/g' "$file"
  sed -i '' 's/border-blue-400/border-gray-600/g' "$file"
  sed -i '' 's/border-blue-300/border-gray-400/g' "$file"
  sed -i '' 's/border-blue-200/border-gray-300/g' "$file"
  
  # Ring (focus) colors
  sed -i '' 's/ring-blue-500/ring-gray-500/g' "$file"
  sed -i '' 's/ring-blue-600/ring-gray-600/g' "$file"
  
  # Hover states
  sed -i '' 's/hover:bg-blue-700/hover:bg-gray-800/g' "$file"
  sed -i '' 's/hover:bg-blue-600/hover:bg-gray-700/g' "$file"
  sed -i '' 's/hover:bg-blue-50/hover:bg-gray-50/g' "$file"
  sed -i '' 's/hover:text-blue-700/hover:text-gray-800/g' "$file"
  sed -i '' 's/hover:text-blue-600/hover:text-gray-700/g' "$file"
  sed -i '' 's/hover:border-blue-600/hover:border-gray-700/g' "$file"
  
  echo "  ✓ $file"
  count=$((count + 1))
done

echo ""
echo "✅ Updated $count files"
echo ""
echo "📊 Color mappings:"
echo "  • bg-blue-600 → bg-black"
echo "  • bg-blue-700 → bg-gray-800"
echo "  • text-blue-600 → text-black"
echo "  • border-blue-* → border-gray-*"
echo "  • ring-blue-* → ring-gray-*"
echo ""
echo "🔄 Restart dev server to see changes: npm run dev"

