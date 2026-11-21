#Requires -Version 5.1
<#
.SYNOPSIS
  Jet Admin launcher - start the complete application, starting with Docker.

.DESCRIPTION
  Thin PowerShell wrapper around scripts/start.js. All arguments are forwarded.

.EXAMPLE
  .\start.ps1                          # core: web app + API + infrastructure
  .\start.ps1 --all                    # the complete application (everything)
  .\start.ps1 --all --mode dev         # everything with local hot reload
  .\start.ps1 --apps frontend,admin    # any application combination
  .\start.ps1 --list                   # show every preset and combination
  .\start.ps1 --stop                   # shut everything down
#>
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Definition
& node (Join-Path $Root 'scripts\start.js') @args
exit $LASTEXITCODE
