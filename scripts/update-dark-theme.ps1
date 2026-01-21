# Dark Theme Batch Update Script
# This PowerShell script will update all Manager components to use dark theme

$componentsDir = "d:\schedule-project-main\src\components"
$files = @(
    'DoctorManager.jsx',
    'LeaveManager.jsx', 
    'PostManager.jsx',
    'SettingsManager.jsx',
    'PromoManager.jsx',
    'SstvManager.jsx',
    'PopUpAdsManager.jsx',
    'AdSenseManager.jsx',
    'PushNotificationManager.jsx',
    'McuManager.jsx',
    'SiteMenuManager.jsx',
    'ChangelogManager.jsx',
    'ECatalogItemsManager.jsx',
    'ManualUpdateManager.jsx'
)

# Color replacements for Nephilim dark theme
$replacements = @{
    # Backgrounds
    'bg-white' = 'bg-[#1a1d21]'
    'bg-gray-50' = 'bg-[#0B0B0C]'
    'bg-gray-100' = 'bg-[#0B0B0C]'
    'bg-blue-50' = 'bg-blue-900/20'
    'bg-green-50' = 'bg-green-900/20'
    'bg-red-50' = 'bg-red-900/20'
    'bg-yellow-50' = 'bg-yellow-900/20'
    
    # Borders
    'border-gray-200' = 'border-[#8C7A3E]/20'
    'border-gray-300' = 'border-[#8C7A3E]/30'
    'border-gray-100' = 'border-[#8C7A3E]/10'
    
    # Text colors
    'text-gray-700' = 'text-[#E6E6E3]'
    'text-gray-800' = 'text-[#E6E6E3]'
    'text-gray-900' = 'text-[#E6E6E3]'
    'text-gray-600' = 'text-[#a0a4ab]'
    'text-gray-500' = 'text-[#a0a4ab]'
    'text-gray-400' = 'text-[#a0a4ab]/60'
    
    # Buttons
    'bg-blue-600' = 'bg-[#8C7A3E]'
    'hover:bg-blue-700' = 'hover:bg-[#a89150]'
    'bg-blue-500' = 'bg-[#8C7A3E]'
    'hover:bg-blue-600' = 'hover:bg-[#a89150]'
    
    # Shadows
    'shadow-sm' = 'shadow-2xl'
    'shadow' = 'shadow-2xl'
    
    # Hover states
    'hover:bg-gray-50' = 'hover:bg-[#0B0B0C]'
    'hover:bg-gray-100' = 'hover:bg-[#1a1d21]'
}

foreach($file in $files) {
    $filePath = Join-Path $componentsDir $file
    
    if(Test-Path $filePath) {
        Write-Host "Processing: $file" -ForegroundColor Cyan
        
        $content = Get-Content $filePath -Raw
        $originalContent = $content
        
        foreach($pattern in $replacements.Keys) {
            $replacement = $replacements[$pattern]
            $content = $content -replace $pattern, $replacement
        }
        
        if($content -ne $originalContent) {
            Set-Content $filePath $content -NoNewline
            Write-Host "  Updated: $file" -ForegroundColor Green
        } else {
            Write-Host "  No changes needed: $file" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  Not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nBatch update complete!" -ForegroundColor Green
