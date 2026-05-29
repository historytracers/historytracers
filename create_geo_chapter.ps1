$baseDir = "C:\msys64\home\thiag\historytracers"

function Read-JsonFile($path) {
    $bytes = [System.IO.File]::ReadAllBytes($path); $text = [System.Text.Encoding]::UTF8.GetString($bytes)
    return $text | ConvertFrom-Json
}

function Write-JsonFile($path, $obj) {
    $jsonStr = $obj | ConvertTo-Json -Depth 10
    $jsonStr = $jsonStr -replace '\\u003c', '<' -replace '\\u003e', '>' -replace '\\u0026', '&' -replace '\\u0027', "'"
    $utf8 = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($path, $jsonStr, $utf8)
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $newBytes = $bytes | Where-Object { $_ -ne 0x0D }
    [System.IO.File]::WriteAllBytes($path, $newBytes)
}

Write-Host "Reading Geography UUIDs..."
$enAtlas = Read-JsonFile ($baseDir + "\lang\en-US\atlas.json")
$geoUuids = @()
for ($i = 26; $i -lt $enAtlas.atlas.Count; $i++) { $geoUuids += $enAtlas.atlas[$i].uuid }
$geoCount = $geoUuids.Count
Write-Host ("Found " + $geoCount + " Geography items")

$langs = @("en-US", "es-ES", "pt-BR")

# Prerequisites texts (correct -join)
$prereqH = @{}
$prereqH["en-US"] = "Prerequisites"
$prereqH["es-ES"] = "Prerrequisitos"
$prereqH["pt-BR"] = -join ([char[]]@(0x50, 0x72, 0xE9, 0x2D, 0x72, 0x65, 0x71, 0x75, 0x69, 0x73, 0x69, 0x74, 0x6F, 0x73))

$prereqB = @{}
$prereqB["en-US"] = "We recommend reading the previous text first to enhance comprehension"
$prereqB["es-ES"] = -join ([char[]]@(0x52, 0x65, 0x63, 0x6F, 0x6D, 0x65, 0x6E, 0x64, 0x61, 0x6D, 0x6F, 0x73, 0x20, 0x6C, 0x65, 0x65, 0x72, 0x20, 0x70, 0x72, 0x69, 0x6D, 0x65, 0x72, 0x6F, 0x20, 0x65, 0x6C, 0x20, 0x74, 0x65, 0x78, 0x74, 0x6F, 0x20, 0x61, 0x6E, 0x74, 0x65, 0x72, 0x69, 0x6F, 0x72, 0x20, 0x70, 0x61, 0x72, 0x61, 0x20, 0x6D, 0x65, 0x6A, 0x6F, 0x72, 0x61, 0x72, 0x20, 0x6C, 0x61, 0x20, 0x63, 0x6F, 0x6D, 0x70, 0x72, 0x65, 0x6E, 0x73, 0x69, 0xF3, 0x6E))
$prereqB["pt-BR"] = -join ([char[]]@(0x52, 0x65, 0x63, 0x6F, 0x6D, 0x65, 0x6E, 0x64, 0x61, 0x6D, 0x6F, 0x73, 0x20, 0x6C, 0x65, 0x72, 0x20, 0x6F, 0x20, 0x74, 0x65, 0x78, 0x74, 0x6F, 0x20, 0x61, 0x6E, 0x74, 0x65, 0x72, 0x69, 0x6F, 0x72, 0x20, 0x70, 0x72, 0x69, 0x6D, 0x65, 0x69, 0x72, 0x6F, 0x20, 0x70, 0x61, 0x72, 0x61, 0x20, 0x6D, 0x65, 0x6C, 0x68, 0x6F, 0x72, 0x61, 0x72, 0x20, 0x61, 0x20, 0x63, 0x6F, 0x6D, 0x70, 0x72, 0x65, 0x65, 0x6E, 0x73, 0xE3, 0x6F))

$figureLabel = "Figure"
$figureLabelES = -join ([char[]]@(0x46, 0x69, 0x67, 0x75, 0x72, 0x61))
$figureLabelPT = -join ([char[]]@(0x46, 0x69, 0x67, 0x75, 0x72, 0x61))

$descLand = @{}
$descLand["en-US"] = -join ([char[]]@(0x49, 0x6E, 0x20, 0x74, 0x68, 0x69, 0x73, 0x20, 0x6D, 0x61, 0x70, 0x2C, 0x20, 0x74, 0x68, 0x65, 0x20, 0x6C, 0x61, 0x6E, 0x64, 0x20, 0x69, 0x73, 0x20, 0x68, 0x69, 0x67, 0x68, 0x6C, 0x69, 0x67, 0x68, 0x74, 0x65, 0x64))
$descLand["es-ES"] = -join ([char[]]@(0x45, 0x6E, 0x20, 0x65, 0x73, 0x74, 0x65, 0x20, 0x6D, 0x61, 0x70, 0x61, 0x2C, 0x20, 0x6C, 0x61, 0x20, 0x74, 0x69, 0x65, 0x72, 0x72, 0x61, 0x20, 0x65, 0x73, 0x74, 0xE1, 0x20, 0x64, 0x65, 0x73, 0x74, 0x61, 0x63, 0x61, 0x64, 0x61))
$descLand["pt-BR"] = -join ([char[]]@(0x4E, 0x65, 0x73, 0x74, 0x65, 0x20, 0x6D, 0x61, 0x70, 0x61, 0x2C, 0x20, 0x61, 0x20, 0x74, 0x65, 0x72, 0x72, 0x61, 0x20, 0xE9, 0x20, 0x64, 0x65, 0x73, 0x74, 0x61, 0x63, 0x61, 0x64, 0x61))

$descContinent = @{}
$descContinent["en-US"] = "In this map, the continent is highlighted"
$descContinent["es-ES"] = -join ([char[]]@(0x45, 0x6E, 0x20, 0x65, 0x73, 0x74, 0x65, 0x20, 0x6D, 0x61, 0x70, 0x61, 0x2C, 0x20, 0x65, 0x6C, 0x20, 0x63, 0x6F, 0x6E, 0x74, 0x69, 0x6E, 0x65, 0x6E, 0x74, 0x65, 0x20, 0x65, 0x73, 0x74, 0xE1, 0x20, 0x64, 0x65, 0x73, 0x74, 0x61, 0x63, 0x61, 0x64, 0x6F))
$descContinent["pt-BR"] = -join ([char[]]@(0x4E, 0x65, 0x73, 0x74, 0x65, 0x20, 0x6D, 0x61, 0x70, 0x61, 0x2C, 0x20, 0x6F, 0x20, 0x63, 0x6F, 0x6E, 0x74, 0x69, 0x6E, 0x65, 0x6E, 0x74, 0x65, 0x20, 0x65, 0x73, 0x74, 0xE1, 0x20, 0x64, 0x65, 0x73, 0x74, 0x61, 0x63, 0x61, 0x64, 0x6F))

Write-Host "`n=== Creating class files ==="
$total = 0
foreach ($lang in $langs) {
    $atlas = Read-JsonFile ($baseDir + "\lang\$lang\atlas.json")
    $geoStart = -1
    for ($j = 0; $j -lt $atlas.atlas.Count; $j++) { if ($atlas.atlas[$j].uuid -eq $geoUuids[0]) { $geoStart = $j; break } }
    
    for ($mi = 0; $mi -lt $geoCount; $mi++) {
        $uuid = $geoUuids[$mi]
        $aItem = $atlas.atlas[$geoStart + $mi]
        $idx = $aItem.index
        $audioStr = $aItem.audio
        $isFirst = ($mi -eq 0)
        $hasImage = ($aItem.image -and $aItem.image.Length -gt 0)
        $imgIdText = "imgGeo" + ($mi + 1)
        
        $content = @()
        
        # SECTION_prerequisites for non-first items
        if (-not $isFirst) {
            $prevItem = $atlas.atlas[$geoStart + $mi - 1]
            $pText = "### " + $prereqH[$lang] + "`n`n" + $prereqB[$lang] + " (<htcite0>)."
            
            $content += [PSCustomObject]@{
                id = "SECTION_prerequisites"
                text = @(
                    [PSCustomObject]@{
                        text = $pText
                        source = @(
                            [PSCustomObject]@{ type = 1; uuid = "b2f637db-6c44-4941-849c-6568ce3c10b4"; text = "History Tracers Atlas"; page = $prevItem.index; date_time = [PSCustomObject]@{ type = "gregory"; year = "2024"; month = ""; day = "" } }
                        )
                        date_time = $null; isTable = $false; imgdesc = ""; format = "markdown"; PostMention = ""
                    }
                )
            }
        }
        
        # Build SECTION_local_content
        $localTexts = @()
        
        # If image-bearing, prepend image HTText
        if ($hasImage) {
            $fig = if ($lang -eq "es-ES") { $figureLabelES } elseif ($lang -eq "pt-BR") { $figureLabelPT } else { $figureLabel }
            $desc = $descContinent[$lang]
            
            $imageHtml = '<p class="desc"><img id="' + $imgIdText + '" onclick="htImageZoom(' + "'" + $imgIdText + "', '0%'" + ')" src="" class="imgcenter"/><b>' + $fig + ' 1</b>: ' + $desc + '</p>'
            
            $imgSrcUuid = "b2f637db-6c44-4941-849c-6568ce3c10b4"
            $imgSrcText = "History Tracers Atlas"
            foreach ($t in $aItem.text) { if ($t.source -and $t.source.Count -gt 0) { $imgSrcUuid = $t.source[0].uuid; $imgSrcText = $t.source[0].text; break } }
            
            $localTexts += [PSCustomObject]@{
                text = $imageHtml
                source = @(
                    [PSCustomObject]@{ type = 1; uuid = $imgSrcUuid; text = $imgSrcText; page = ""; date_time = [PSCustomObject]@{ type = "gregory"; year = "2024"; month = ""; day = "" } }
                )
                date_time = $null; isTable = $false; imgdesc = ""; format = "html"; PostMention = ""
            }
        }
        
        # Copy all text entries from atlas.json
        foreach ($t in $aItem.text) {
            $sArr = @()
            if ($t.source -and $t.source.Count -gt 0) {
                foreach ($s in $t.source) {
                    $sDt = if ($s.date_time) { $s.date_time } else { $null }
                    $sType = if ($sDt -and $sDt.type) { $sDt.type } else { "gregory" }
                    $sYear = if ($sDt -and $sDt.year) { $sDt.year } else { "" }
                    $sMonth = if ($sDt -and $sDt.month) { $sDt.month } else { "" }
                    $sDay = if ($sDt -and $sDt.day) { $sDt.day } else { "" }
                    
                    $sArr += [PSCustomObject]@{ type = $s.type; uuid = $s.uuid; text = $s.text; page = if ($s.page) { $s.page } else { "" }; date_time = [PSCustomObject]@{ type = $sType; year = $sYear; month = $sMonth; day = $sDay } }
                }
            }
            
            $localTexts += [PSCustomObject]@{
                text = $t.text
                source = $sArr
                date_time = $null
                isTable = $false
                imgdesc = if ($t.imgdesc) { $t.imgdesc } else { "" }
                format = $t.format
                PostMention = if ($t.PostMention) { $t.PostMention } else { "" }
            }
        }
        
        $content += [PSCustomObject]@{ id = "SECTION_local_content"; text = $localTexts }
        
        $classObj = [PSCustomObject]@{
            title = $idx; header = $idx
            sources = @($uuid); scripts = @($uuid)
            audio = @([PSCustomObject]@{ url = $audioStr; external = $true; spotify = $false }, [PSCustomObject]@{ url = "https://spotifycreators-web.app.link/e/KDadgCsMlVb"; external = $true; spotify = $true })
            index = @("atlas")
            license = @("SPDX-License-Identifier: GPL-3.0-or-later", "CC BY-NC 4.0 DEED")
            last_update = @("1775271675"); authors = @(""); reviewers = @()
            type = "class"; version = 2; editing = $false
            content = $content; exercise_v2 = @(); game_v2 = @(); date_time = $null
        }
        
        Write-JsonFile ($baseDir + "\lang\$lang\$uuid.json") $classObj
        $total++
    }
    Write-Host ("  " + $lang + ": " + $geoCount + " class files created")
}
Write-Host ("Total: " + $total)
