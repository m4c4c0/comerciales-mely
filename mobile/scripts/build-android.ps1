param([string]$Architectures = 'arm64-v8a,x86_64')
$ErrorActionPreference = 'Stop'
$env:CMAKE_BUILD_PARALLEL_LEVEL = '2'
$projectRoot = Split-Path -Parent $PSScriptRoot
$ninjaDir = Join-Path $projectRoot 'tools\native'
$ninjaExe = Join-Path $ninjaDir 'ninja.exe'
if (-not (Test-Path -LiteralPath $ninjaExe)) {
  New-Item -ItemType Directory -Path $ninjaDir -Force | Out-Null
  $ninjaZip = Join-Path $ninjaDir 'ninja-win.zip'
  Invoke-WebRequest -Uri 'https://github.com/ninja-build/ninja/releases/download/v1.13.2/ninja-win.zip' -OutFile $ninjaZip
  if ((Get-FileHash -LiteralPath $ninjaZip -Algorithm SHA256).Hash.ToLowerInvariant() -ne '07fc8261b42b20e71d1720b39068c2e14ffcee6396b76fb7a795fb460b78dc65') {
    throw 'La huella de Ninja no coincide con la distribución oficial.'
  }
  Expand-Archive -LiteralPath $ninjaZip -DestinationPath $ninjaDir -Force
}

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
