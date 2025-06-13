param(
    [int]$Number1 = 10,
    [int]$Number2 = 20,
    [string]$Operation = "add"
)

Write-Host "=== PowerShell Script 2 - Math Calculator ===" -ForegroundColor Blue

switch ($Operation.ToLower()) {
    "add" {
        $result = $Number1 + $Number2
        Write-Host "Adding $Number1 + $Number2 = $result" -ForegroundColor Green
    }
    "multiply" {
        $result = $Number1 * $Number2
        Write-Host "Multiplying $Number1 × $Number2 = $result" -ForegroundColor Yellow
    }
    "power" {
        $result = [Math]::Pow($Number1, $Number2)
        Write-Host "Power $Number1 ^ $Number2 = $result" -ForegroundColor Magenta
    }
    default {
        Write-Host "Unknown operation: $Operation" -ForegroundColor Red
        Write-Host "Available operations: add, multiply, power" -ForegroundColor White
        $result = "Error"
    }
}

Write-Host "System Information:" -ForegroundColor Cyan
Write-Host "  PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor White
Write-Host "  OS: $([System.Environment]::OSVersion.VersionString)" -ForegroundColor White
Write-Host "  Processor Count: $([System.Environment]::ProcessorCount)" -ForegroundColor White

Write-Host "Script execution completed!" -ForegroundColor Blue
Write-Host "===========================================" -ForegroundColor Blue
