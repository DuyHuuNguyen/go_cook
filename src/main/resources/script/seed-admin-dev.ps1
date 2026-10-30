$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..\..\..')).Path
$previousSeedFlag = $env:GOCOOK_SEED_DEV

try {
    $env:GOCOOK_SEED_DEV = 'true'
    & (Join-Path $projectRoot 'mvnw.cmd') '-Dfmt.skip=true' '-Dtest=DevAdminSeedTest' '-DargLine=-Djdk.net.unixdomain.tmpdir=target' test -B -ntp
    if ($LASTEXITCODE -ne 0) {
        throw "Development seed failed with exit code $LASTEXITCODE."
    }
} finally {
    if ($null -eq $previousSeedFlag) {
        Remove-Item Env:GOCOOK_SEED_DEV -ErrorAction SilentlyContinue
    } else {
        $env:GOCOOK_SEED_DEV = $previousSeedFlag
    }
}
