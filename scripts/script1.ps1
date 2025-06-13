param(
    [string]$Name = "World",
    [string]$Message = "Hello"
)

Write-Host "=== PowerShell Script 1 Execution ===" -ForegroundColor Green
Write-Host "$Message, $Name!" -ForegroundColor Yellow
Write-Host "Current Time: $(Get-Date)" -ForegroundColor Cyan
Write-Host "Computer Name: $env:COMPUTERNAME" -ForegroundColor Magenta
Write-Host "Current User: $env:USERNAME" -ForegroundColor Blue
Write-Host "Script executed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
