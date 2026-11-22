param(
  [string]$Architectures = 'arm64-v8a,x86_64',
  [ValidateSet('Release', 'Debug')][string]$Variant = 'Release'
)
$ErrorActionPreference = 'Stop'
$env:CMAKE_BUILD_PARALLEL_LEVEL = '2'
$projectRoot = Split-Path -Parent $PSScriptRoot
$ninjaDir = Join-Path $projectRoot 'tools\native\ninja-1.13.2'
$ninjaExe = Join-Path $ninjaDir 'ninja.exe'
$ninjaVersion = if (Test-Path -LiteralPath $ninjaExe) { & $ninjaExe --version }
if ($ninjaVersion -ne '1.13.2') {
  New-Item -ItemType Directory -Path $ninjaDir -Force | Out-Null
  $ninjaZip = Join-Path $ninjaDir 'ninja-win.zip'
  Invoke-WebRequest -Uri 'https://github.com/ninja-build/ninja/releases/download/v1.13.2/ninja-win.zip' -OutFile $ninjaZip
  if ((Get-FileHash -LiteralPath $ninjaZip -Algorithm SHA256).Hash.ToLowerInvariant() -ne '07fc8261b42b20e71d1720b39068c2e14ffcee6396b76fb7a795fb460b78dc65') {
    throw 'La huella de Ninja no coincide con la distribución oficial.'
  }
  Expand-Archive -LiteralPath $ninjaZip -DestinationPath $ninjaDir -Force
  if ((& $ninjaExe --version) -ne '1.13.2') { throw 'No se pudo preparar Ninja 1.13.2.' }
}

$env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$studioJava = 'C:\Program Files\Android\Android Studio\jbr'
if (-not $env:JAVA_HOME -and (Test-Path -LiteralPath (Join-Path $studioJava 'bin\java.exe'))) { $env:JAVA_HOME = $studioJava }
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
Push-Location $projectRoot
try {
  # Reapply the config plugin when android/ already exists.
  & npx.cmd expo prebuild --platform android --no-install
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo generar el proyecto Android.' }
} finally { Pop-Location }
Push-Location (Join-Path $projectRoot 'android')
try {
  # Expo can regenerate android/. Keep Gradle history outside that directory.
  $projectCache = Join-Path $projectRoot '.gradle-project-cache'
  & .\gradlew.bat ":app:assemble$Variant" "-PreactNativeArchitectures=$Architectures" '--project-cache-dir' $projectCache '--build-cache' '--max-workers=1' '-Pkotlin.compiler.execution.strategy=in-process' '-Dorg.gradle.jvmargs=-Xmx1536m -XX:MaxMetaspaceSize=1024m'
  if ($LASTEXITCODE -ne 0) { throw 'Falló la compilación Android.' }
  $outputDir = Join-Path $projectRoot 'output\android'
  New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
  $variantDir = $Variant.ToLowerInvariant()
  Copy-Item -LiteralPath ".\app\build\outputs\apk\$variantDir\app-$variantDir.apk" -Destination (Join-Path $outputDir "Comerciales-Mely-final-$variantDir.apk") -Force
} finally { Pop-Location }
