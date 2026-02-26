#!/bin/bash

# Tailwind to Bootstrap Conversion Script
# This script converts Tailwind CSS classes to Bootstrap 5 classes across all InvestorPages

echo "========================================="
echo "Tailwind to Bootstrap Conversion Script"
echo "========================================="

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directory to process
TARGET_DIR="src/pages/InvestorPages"

# Create sed script
cat > /tmp/tw-to-bs-comprehensive.sed << 'SEDEOF'
# ===== FLEX & LAYOUT =====
s/className="flex items-center justify-between/className="d-flex align-items-center justify-content-between/g
s/className="flex items-center justify-end/className="d-flex align-items-center justify-content-end/g
s/className="flex items-center justify-start/className="d-flex align-items-center justify-content-start/g
s/className="flex items-center justify-center/className="d-flex align-items-center justify-content-center/g
s/className="flex items-start justify-between/className="d-flex align-items-start justify-content-between/g
s/className="flex items-end justify-between/className="d-flex align-items-end justify-content-between/g
s/className="flex flex-col/className="d-flex flex-column/g
s/className="flex flex-row/className="d-flex flex-row/g
s/className="flex flex-wrap/className="d-flex flex-wrap/g
s/className="inline-flex/className="d-inline-flex/g
s/\(className="[^"]*\)flex items-center space-x-([0-9]+)/\1d-flex align-items-center gap-\2/g
s/\(className="[^"]*\)flex space-x-([0-9]+)/\1d-flex gap-\2/g
s/\(className="[^"]*\)flex items-center/\1d-flex align-items-center/g
s/\(className="[^"]*\)flex justify-end/\1d-flex justify-content-end/g
s/\(className="[^"]*\)flex justify-center/\1d-flex justify-content-center/g
s/\(className="[^"]*\)flex justify-between/\1d-flex justify-content-between/g

# ===== GRID SYSTEM =====
s/className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-([0-9]+)/className="row g-\1/g
s/className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-([0-9]+)/className="row g-\1/g
s/className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-([0-9]+)/className="row g-\1/g
s/className="grid grid-cols-1 md:grid-cols-2 gap-([0-9]+)/className="row g-\1/g
s/className="grid grid-cols-1 md:grid-cols-3 gap-([0-9]+)/className="row g-\1/g
s/className="grid grid-cols-1 md:grid-cols-4 gap-([0-9]+)/className="row g-\1/g
s/className="grid grid-cols-1 lg:grid-cols-2 gap-([0-9]+)/className="row g-\1/g
s/className="grid grid-cols-2 gap-([0-9]+)/className="row g-\1/g
s/className="grid grid-cols-3 gap-([0-9]+)/className="row g-\1/g
s/className="grid grid-cols-4 gap-([0-9]+)/className="row g-\1/g

# Add col classes for grid children (manual review may be needed)
s/<div key/<div className="col-12 col-md-6 col-lg-4" key/g

# ===== SPACING =====
s/\(className="[^"]*\)p-8/\1p-5/g
s/\(className="[^"]*\)p-6/\1p-4/g
s/\(className="[^"]*\)p-4/\1p-3/g
s/\(className="[^"]*\)p-2/\1p-2/g
s/\(className="[^"]*\)px-6/\1px-4/g
s/\(className="[^"]*\)py-6/\1py-4/g
s/\(className="[^"]*\)px-4/\1px-3/g
s/\(className="[^"]*\)py-4/\1py-3/g
s/\(className="[^"]*\)px-3/\1px-2/g
s/\(className="[^"]*\)py-3/\1py-2/g
s/\(className="[^"]*\)px-2/\1px-2/g
s/\(className="[^"]*\)py-2/\1py-2/g
s/\(className="[^"]*\)m-8/\1m-5/g
s/\(className="[^"]*\)m-6/\1m-4/g
s/\(className="[^"]*\)m-4/\1m-3/g
s/\(className="[^"]*\)mb-8/\1mb-5/g
s/\(className="[^"]*\)mb-6/\1mb-4/g
s/\(className="[^"]*\)mb-4/\1mb-3/g
s/\(className="[^"]*\)mb-2/\1mb-2/g
s/\(className="[^"]*\)mt-8/\1mt-5/g
s/\(className="[^"]*\)mt-6/\1mt-4/g
s/\(className="[^"]*\)mt-4/\1mt-3/g
s/\(className="[^"]*\)mt-2/\1mt-2/g
s/\(className="[^"]*\)ml-2/\1ms-2/g
s/\(className="[^"]*\)mr-2/\1me-2/g
s/\(className="[^"]*\)ml-1/\1ms-1/g
s/\(className="[^"]*\)mr-1/\1me-1/g
s/\(className="[^"]*\)space-y-4/\1vstack gap-3/g
s/\(className="[^"]*\)space-y-2/\1vstack gap-2/g
s/\(className="[^"]*\)space-x-4/\1hstack gap-3/g
s/\(className="[^"]*\)space-x-3/\1hstack gap-2/g
s/\(className="[^"]*\)space-x-2/\1hstack gap-2/g
s/\(className="[^"]*\)gap-8/\1gap-5/g
s/\(className="[^"]*\)gap-6/\1gap-4/g
s/\(className="[^"]*\)gap-4/\1gap-3/g
s/\(className="[^"]*\)gap-3/\1gap-2/g
s/\(className="[^"]*\)gap-2/\1gap-2/g
s/\(className="[^"]*\)gap-1/\1gap-1/g

# ===== BACKGROUNDS & BORDERS =====
s/\(className="[^"]*\)bg-white rounded-lg border border-gray-200/\1card border/g
s/\(className="[^"]*\)bg-white rounded-lg border/\1card border/g
s/\(className="[^"]*\)bg-white border border-gray-200/\1card border/g
s/\(className="[^"]*\)bg-gray-50/\1bg-light/g
s/\(className="[^"]*\)bg-gray-100/\1bg-light/g
s/\(className="[^"]*\)bg-gray-200/\1bg-secondary bg-opacity-25/g
s/\(className="[^"]*\)bg-white/\1bg-white/g
s/\(className="[^"]*\)border border-gray-300/\1border/g
s/\(className="[^"]*\)border border-gray-200/\1border/g
s/\(className="[^"]*\)border-gray-200/\1border/g
s/\(className="[^"]*\)rounded-2xl/\1rounded-3/g
s/\(className="[^"]*\)rounded-xl/\1rounded-3/g
s/\(className="[^"]*\)rounded-lg/\1rounded/g
s/\(className="[^"]*\)rounded-md/\1rounded/g
s/\(className="[^"]*\)rounded-full/\1rounded-pill/g
s/\(className="[^"]*\)rounded/\1rounded/g
s/\(className="[^"]*\)shadow-xl/\1shadow-lg/g
s/\(className="[^"]*\)shadow-lg/\1shadow-lg/g
s/\(className="[^"]*\)shadow-md/\1shadow-sm/g
s/\(className="[^"]*\)shadow-sm/\1shadow-sm/g
s/\(className="[^"]*\)shadow/\1shadow-sm/g

# ===== TYPOGRAPHY =====
s/\(className="[^"]*\)text-4xl font-bold/\1h2 fw-bold/g
s/\(className="[^"]*\)text-3xl font-bold/\1h3 fw-bold/g
s/\(className="[^"]*\)text-2xl font-bold/\1h4 fw-bold/g
s/\(className="[^"]*\)text-xl font-semibold/\1h5 fw-semibold/g
s/\(className="[^"]*\)text-lg font-medium/\1h6 fw-medium/g
s/\(className="[^"]*\)text-lg/\1fs-5/g
s/\(className="[^"]*\)text-base/\1fs-6/g
s/\(className="[^"]*\)text-sm font-medium/\1small fw-medium/g
s/\(className="[^"]*\)text-sm/\1small/g
s/\(className="[^"]*\)text-xs/\1small text-muted/g
s/\(className="[^"]*\)font-bold/\1fw-bold/g
s/\(className="[^"]*\)font-semibold/\1fw-semibold/g
s/\(className="[^"]*\)font-medium/\1fw-medium/g
s/\(className="[^"]*\)font-normal/\1fw-normal/g
s/\(className="[^"]*\)text-center/\1text-center/g
s/\(className="[^"]*\)text-left/\1text-start/g
s/\(className="[^"]*\)text-right/\1text-end/g
s/\(className="[^"]*\)uppercase/\1text-uppercase/g
s/\(className="[^"]*\)lowercase/\1text-lowercase/g
s/\(className="[^"]*\)capitalize/\1text-capitalize/g
s/\(className="[^"]*\)truncate/\1text-truncate/g

# ===== COLORS =====
s/\(className="[^"]*\)text-gray-900/\1text-dark/g
s/\(className="[^"]*\)text-gray-800/\1text-dark/g
s/\(className="[^"]*\)text-gray-700/\1text-secondary/g
s/\(className="[^"]*\)text-gray-600/\1text-muted/g
s/\(className="[^"]*\)text-gray-500/\1text-muted/g
s/\(className="[^"]*\)text-gray-400/\1text-muted/g
s/\(className="[^"]*\)text-blue-600/\1text-primary/g
s/\(className="[^"]*\)text-blue-700/\1text-primary/g
s/\(className="[^"]*\)text-green-600/\1text-success/g
s/\(className="[^"]*\)text-green-700/\1text-success/g
s/\(className="[^"]*\)text-red-600/\1text-danger/g
s/\(className="[^"]*\)text-red-700/\1text-danger/g
s/\(className="[^"]*\)text-yellow-600/\1text-warning/g
s/\(className="[^"]*\)text-yellow-700/\1text-warning/g
s/\(className="[^"]*\)text-purple-600/\1text-info/g
s/\(className="[^"]*\)bg-blue-600/\1bg-primary/g
s/\(className="[^"]*\)bg-blue-500/\1bg-primary/g
s/\(className="[^"]*\)bg-green-600/\1bg-success/g
s/\(className="[^"]*\)bg-green-500/\1bg-success/g
s/\(className="[^"]*\)bg-red-600/\1bg-danger/g
s/\(className="[^"]*\)bg-red-500/\1bg-danger/g
s/\(className="[^"]*\)bg-yellow-600/\1bg-warning/g
s/\(className="[^"]*\)bg-yellow-500/\1bg-warning/g
s/\(className="[^"]*\)bg-blue-100 text-blue-800/\1bg-primary bg-opacity-10 text-primary/g
s/\(className="[^"]*\)bg-blue-50 text-blue-600/\1bg-primary bg-opacity-10 text-primary/g
s/\(className="[^"]*\)bg-green-100 text-green-800/\1bg-success bg-opacity-10 text-success/g
s/\(className="[^"]*\)bg-green-50 text-green-600/\1bg-success bg-opacity-10 text-success/g
s/\(className="[^"]*\)bg-red-100 text-red-800/\1bg-danger bg-opacity-10 text-danger/g
s/\(className="[^"]*\)bg-red-50 text-red-600/\1bg-danger bg-opacity-10 text-danger/g
s/\(className="[^"]*\)bg-yellow-100 text-yellow-800/\1bg-warning bg-opacity-10 text-warning/g
s/\(className="[^"]*\)bg-yellow-50 text-yellow-600/\1bg-warning bg-opacity-10 text-warning/g
s/\(className="[^"]*\)bg-purple-100 text-purple-800/\1bg-info bg-opacity-10 text-info/g
s/\(className="[^"]*\)bg-purple-50 text-purple-600/\1bg-info bg-opacity-10 text-info/g

# ===== BUTTONS & BADGES =====
s/\(className="[^"]*\)inline-flex items-center px-2\.5 py-0\.5 rounded-full/\1badge rounded-pill/g
s/\(className="[^"]*\)inline-flex items-center px-2 py-0\.5 rounded text-xs/\1badge/g
s/\(className="[^"]*\)hover:bg-gray-50//g
s/\(className="[^"]*\)hover:bg-blue-700//g
s/\(className="[^"]*\)hover:bg-green-700//g
s/\(className="[^"]*\)hover:bg-red-700//g
s/\(className="[^"]*\)hover:text-blue-900//g
s/\(className="[^"]*\)hover:text-green-900//g
s/\(className="[^"]*\)hover:text-red-900//g
s/\(className="[^"]*\)disabled:opacity-50 disabled:cursor-not-allowed/\1/g

# ===== TABLES =====
s/className="min-w-full divide-y divide-gray-200/className="table table-hover mb-0/g
s/className="bg-white divide-y divide-gray-200/className="table-body/g
s/\(className="[^"]*\)whitespace-nowrap//g
s/\(className="[^"]*\)hover:bg-gray-50//g

# ===== SIZING & OVERFLOW =====
s/\(className="[^"]*\)w-full/\1w-100/g
s/\(className="[^"]*\)h-full/\1h-100/g
s/\(className="[^"]*\)max-w-md/\1mw-100/g
s/\(className="[^"]*\)max-w-lg/\1mw-100/g
s/\(className="[^"]*\)max-w-xl/\1mw-100/g
s/\(className="[^"]*\)max-w-2xl/\1mw-100/g
s/\(className="[^"]*\)max-w-4xl/\1mw-100/g
s/\(className="[^"]*\)overflow-x-auto/\1overflow-auto/g
s/\(className="[^"]*\)overflow-y-auto/\1overflow-auto/g
s/\(className="[^"]*\)overflow-hidden/\1overflow-hidden/g

# ===== POSITIONING =====
s/\(className="[^"]*\)absolute/\1position-absolute/g
s/\(className="[^"]*\)relative/\1position-relative/g
s/\(className="[^"]*\)fixed/\1position-fixed/g
s/\(className="[^"]*\)sticky/\1position-sticky/g
s/\(className="[^"]*\)inset-0/\1top-0 start-0 end-0 bottom-0/g
s/\(className="[^"]*\)top-0/\1top-0/g
s/\(className="[^"]*\)bottom-0/\1bottom-0/g
s/\(className="[^"]*\)left-0/\1start-0/g
s/\(className="[^"]*\)right-0/\1end-0/g

# ===== DISPLAY & VISIBILITY =====
s/\(className="[^"]*\)hidden/\1d-none/g
s/\(className="[^"]*\)block/\1d-block/g
s/\(className="[^"]*\)inline-block/\1d-inline-block/g
s/\(className="[^"]*\)inline/\1d-inline/g

# ===== Z-INDEX =====
s/\(className="[^"]*\)z-50/\1/g
s/\(className="[^"]*\)z-40/\1/g
s/\(className="[^"]*\)z-30/\1/g
s/\(className="[^"]*\)z-20/\1/g
s/\(className="[^"]*\)z-10/\1/g

# ===== CURSOR & POINTER EVENTS =====
s/\(className="[^"]*\)cursor-pointer/\1cursor-pointer/g
s/\(className="[^"]*\)cursor-not-allowed//g
s/\(className="[^"]*\)pointer-events-none/\1pe-none/g

# ===== TRANSITIONS =====
s/\(className="[^"]*\)transition-all//g
s/\(className="[^"]*\)transition-colors//g
s/\(className="[^"]*\)duration-([0-9]+)//g
s/\(className="[^"]*\)ease-in-out//g

# ===== OPACITY =====
s/\(className="[^"]*\)opacity-50/\1opacity-50/g
s/\(className="[^"]*\)opacity-75/\1opacity-75/g
s/\(className="[^"]*\)opacity-100/\1opacity-100/g

# ===== TRANSFORM =====
s/\(className="[^"]*\)transform//g
s/\(className="[^"]*\)-translate-y-1//g
s/\(className="[^"]*\)translate-middle-y/\1top-50 translate-middle-y/g
s/\(className="[^"]*\)translate-middle/\1top-50 start-50 translate-middle/g
SEDEOF

# Find and convert all .tsx files in InvestorPages
find "$TARGET_DIR" -name "*.tsx" -type f | while read -r file; do
    echo -e "${YELLOW}Processing:${NC} $file"
    
    # Create backup
    cp "$file" "${file}.bak"
    
    # Apply conversions
    sed -f /tmp/tw-to-bs-comprehensive.sed "${file}.bak" > "$file"
    
    # Check if file changed
    if ! cmp -s "$file" "${file}.bak"; then
        echo -e "${GREEN}✓ Converted${NC}"
    else
        echo "  No changes needed"
    fi
done

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Conversion Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Backup files created with .bak extension"
echo "Review the changes and delete .bak files when satisfied"
echo ""
echo "Note: Some manual adjustments may still be needed for:"
echo "  - Complex nested className expressions"
echo "  - Dynamic className generation"
echo "  - Template literals with classNames"
echo "  - Modal/Dialog components"
echo "  - Form controls (may need form-control, form-select, etc.)"

