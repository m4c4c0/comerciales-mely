param([string]$Architectures = 'arm64-v8a,x86_64')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$studioJava = 'C:\Program Files\Android\Android Studio\jbr'
if (Test-Path -LiteralPath (Join-Path $studioJava 'bin\java.exe')) { $env:JAVA_HOME = $studioJava }
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
if (-not (Test-Path -LiteralPath (Join-Path $projectRoot 'android'))) {
  Push-Location $projectRoot
  try {
    & npx.cmd expo prebuild --platform android --no-install
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo generar el proyecto Android.' }
  } finally { Pop-Location }
}
Push-Location (Join-Path $projectRoot 'android')
try {
  & .\gradlew.bat assembleRelease "-PreactNativeArchitectures=$Architectures" '--max-workers=2'
  if ($LASTEXITCODE -ne 0) { throw 'Falló la compilación Android.' }
  $outputDir = Join-Path $projectRoot 'output\android'
  New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
  Copy-Item -LiteralPath '.\app\build\outputs\apk\release\app-release.apk' -Destination (Join-Path $outputDir 'Comerciales-Mely-etapa3.apk') -Force
} finally { Pop-Location }
