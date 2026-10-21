$ErrorActionPreference = 'Stop'
Push-Location (Split-Path -Parent $PSScriptRoot)
try {
  & npx.cmd eas-cli@latest build --platform ios --profile preview
  if ($LASTEXITCODE -ne 0) { throw 'La compilación iOS no terminó. Revisa el acceso a Expo y las credenciales Apple.' }
} finally { Pop-Location }
