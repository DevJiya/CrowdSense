$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Server started! Open your browser and go to: http://localhost:$port/" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Yellow

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }
        
        # Prevent directory traversal
        $path = $path.TrimStart('/')
        $localPath = Join-Path (Get-Location) $path
        
        if (Test-Path $localPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localPath)
            $contentType = switch ($ext) {
                ".html" { "text/html" }
                ".css"  { "text/css" }
                ".js"   { "application/javascript" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                default { "application/octet-stream" }
            }
            $response.ContentType = $contentType
            
            $content = [System.IO.File]::ReadAllBytes($localPath)
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
        }
        
        $response.Close()
    }
}
finally {
    $listener.Stop()
}
