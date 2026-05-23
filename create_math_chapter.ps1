$baseDir = "C:\msys64\home\thiag\historytracers"

function Read-JsonFile($path) {
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $text = [System.Text.Encoding]::UTF8.GetString($bytes)
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

$mathUuids = @(
    "c7c03f9d-4796-4922-93b2-da7c154885a1"
    "4c117906-1277-4c75-b47b-90a203f06938"
    "950c054a-6290-41b4-bbac-7b3fd87f809b"
    "5f39ac75-9dd9-4dbc-b57f-65857c9a65fa"
    "8fccfdf4-8c44-4513-983f-d9713489519d"
    "dc29a98c-70c2-49b3-b3a7-431b040dbfed"
    "931557c0-ca2b-4b50-b034-1ed53752c58e"
    "47db4900-f8b8-48ce-90d6-def1961e7f1a"
    "11a45836-9276-445c-8416-370cf816188c"
    "25108a0e-7670-4cac-bc1c-5db63138ab09"
    "520b1f8f-4ac5-453a-9856-98b54b3e2822"
    "a494d959-3b71-4d6d-8e25-62278de4fcf4"
    "1cfb7c60-fa0b-4201-b34d-c9f0d3cca2d7"
)

$langs = @("en-US", "es-ES", "pt-BR")

# Pre-built prerequisites body text using char codes
$prereqBodies = @{}
$prereqBodies["en-US"] = "We recommend reading the previous text first to enhance comprehension"

$esChars = @(0x52, 0x65, 0x63, 0x6F, 0x6D, 0x65, 0x6E, 0x64, 0x61, 0x6D, 0x6F, 0x73, 0x20, 0x6C, 0x65, 0x65, 0x72, 0x20, 0x70, 0x72, 0x69, 0x6D, 0x65, 0x72, 0x6F, 0x20, 0x65, 0x6C, 0x20, 0x74, 0x65, 0x78, 0x74, 0x6F, 0x20, 0x61, 0x6E, 0x74, 0x65, 0x72, 0x69, 0x6F, 0x72, 0x20, 0x70, 0x61, 0x72, 0x61, 0x20, 0x6D, 0x65, 0x6A, 0x6F, 0x72, 0x61, 0x72, 0x20, 0x6C, 0x61, 0x20, 0x63, 0x6F, 0x6D, 0x70, 0x72, 0x65, 0x6E, 0x73, 0x69, 0xF3, 0x6E)
$prereqBodies["es-ES"] = -join ($esChars | ForEach-Object { [char]$_ })

$ptChars = @(0x52, 0x65, 0x63, 0x6F, 0x6D, 0x65, 0x6E, 0x64, 0x61, 0x6D, 0x6F, 0x73, 0x20, 0x6C, 0x65, 0x72, 0x20, 0x6F, 0x20, 0x74, 0x65, 0x78, 0x74, 0x6F, 0x20, 0x61, 0x6E, 0x74, 0x65, 0x72, 0x69, 0x6F, 0x72, 0x20, 0x70, 0x72, 0x69, 0x6D, 0x65, 0x69, 0x72, 0x6F, 0x20, 0x70, 0x61, 0x72, 0x61, 0x20, 0x6D, 0x65, 0x6C, 0x68, 0x6F, 0x72, 0x61, 0x72, 0x20, 0x61, 0x20, 0x63, 0x6F, 0x6D, 0x70, 0x72, 0x65, 0x65, 0x6E, 0x73, 0xE3, 0x6F)
$prereqBodies["pt-BR"] = -join ($ptChars | ForEach-Object { [char]$_ })

# Pre-built prerequisites heading
$prereqHeadings = @{}
$prereqHeadings["en-US"] = "Prerequisites"
$prereqHeadings["es-ES"] = "Prerrequisitos"
$ptHeadChars = @(0x50, 0x72, 0xE9, 0x2D, 0x72, 0x65, 0x71, 0x75, 0x69, 0x73, 0x69, 0x74, 0x6F, 0x73)
$prereqHeadings["pt-BR"] = -join ($ptHeadChars | ForEach-Object { [char]$_ })

# Image description texts using char codes for non-ASCII
$imgDesc = @{}
$imgDesc["en-US"] = @{
    "a494d959" = "In this image, the geographic coordinates are used to locate a point on the sphere"
    "1cfb7c60" = "In this image, the Equator parallel and the Greenwich Meridian are highlighted, with the intersection at point O"
}
$imgDesc["es-ES"] = @{
    "a494d959" = -join (@(0x45, 0x6E, 0x20, 0x65, 0x73, 0x74, 0x61, 0x20, 0x66, 0x69, 0x67, 0x75, 0x72, 0x61, 0x2C, 0x20, 0x6C, 0x61, 0x73, 0x20, 0x63, 0x6F, 0x6F, 0x72, 0x64, 0x65, 0x6E, 0x61, 0x64, 0x61, 0x73, 0x20, 0x67, 0x65, 0x6F, 0x67, 0x72, 0xE1, 0x66, 0x69, 0x63, 0x61, 0x73, 0x20, 0x73, 0x65, 0x20, 0x75, 0x74, 0x69, 0x6C, 0x69, 0x7A, 0x61, 0x6E, 0x20, 0x70, 0x61, 0x72, 0x61, 0x20, 0x75, 0x62, 0x69, 0x63, 0x61, 0x72, 0x20, 0x75, 0x6E, 0x20, 0x70, 0x75, 0x6E, 0x74, 0x6F, 0x20, 0x65, 0x6E, 0x20, 0x6C, 0x61, 0x20, 0x65, 0x73, 0x66, 0x65, 0x72, 0x61) | ForEach-Object { [char]$_ })
    "1cfb7c60" = -join (@(0x45, 0x6E, 0x20, 0x65, 0x73, 0x74, 0x61, 0x20, 0x66, 0x69, 0x67, 0x75, 0x72, 0x61, 0x2C, 0x20, 0x65, 0x6C, 0x20, 0x70, 0x61, 0x72, 0x61, 0x6C, 0x65, 0x6C, 0x6F, 0x20, 0x64, 0x65, 0x6C, 0x20, 0x45, 0x63, 0x75, 0x61, 0x64, 0x6F, 0x72, 0x20, 0x79, 0x20, 0x65, 0x6C, 0x20, 0x4D, 0x65, 0x72, 0x69, 0x64, 0x69, 0x61, 0x6E, 0x6F, 0x20, 0x64, 0x65, 0x20, 0x47, 0x72, 0x65, 0x65, 0x6E, 0x77, 0x69, 0x63, 0x68, 0x20, 0x65, 0x73, 0x74, 0xE1, 0x6E, 0x20, 0x64, 0x65, 0x73, 0x74, 0x61, 0x63, 0x61, 0x64, 0x6F, 0x73, 0x2C, 0x20, 0x63, 0x6F, 0x6E, 0x20, 0x6C, 0x61, 0x20, 0x69, 0x6E, 0x74, 0x65, 0x72, 0x73, 0x65, 0x63, 0x63, 0x69, 0xF3, 0x6E, 0x20, 0x65, 0x6E, 0x20, 0x65, 0x6C, 0x20, 0x70, 0x75, 0x6E, 0x74, 0x6F, 0x20, 0x4F) | ForEach-Object { [char]$_ })
}
$imgDesc["pt-BR"] = @{
    "a494d959" = -join (@(0x4E, 0x65, 0x73, 0x74, 0x61, 0x20, 0x66, 0x69, 0x67, 0x75, 0x72, 0x61, 0x2C, 0x20, 0x61, 0x73, 0x20, 0x63, 0x6F, 0x6F, 0x72, 0x64, 0x65, 0x6E, 0x61, 0x64, 0x61, 0x73, 0x20, 0x67, 0x65, 0x6F, 0x67, 0x72, 0xE1, 0x66, 0x69, 0x63, 0x61, 0x73, 0x20, 0x73, 0xE3, 0x6F, 0x20, 0x75, 0x74, 0x69, 0x6C, 0x69, 0x7A, 0x61, 0x64, 0x61, 0x73, 0x20, 0x70, 0x61, 0x72, 0x61, 0x20, 0x6C, 0x6F, 0x63, 0x61, 0x6C, 0x69, 0x7A, 0x61, 0x72, 0x20, 0x75, 0x6D, 0x20, 0x70, 0x6F, 0x6E, 0x74, 0x6F, 0x20, 0x6E, 0x61, 0x20, 0x65, 0x73, 0x66, 0x65, 0x72, 0x61) | ForEach-Object { [char]$_ })
    "1cfb7c60" = -join (@(0x4E, 0x65, 0x73, 0x74, 0x61, 0x20, 0x66, 0x69, 0x67, 0x75, 0x72, 0x61, 0x2C, 0x20, 0x6F, 0x20, 0x70, 0x61, 0x72, 0x61, 0x6C, 0x65, 0x6C, 0x6F, 0x20, 0x64, 0x6F, 0x20, 0x45, 0x71, 0x75, 0x61, 0x64, 0x6F, 0x72, 0x20, 0x65, 0x20, 0x6F, 0x20, 0x4D, 0x65, 0x72, 0x69, 0x64, 0x69, 0x61, 0x6E, 0x6F, 0x20, 0x64, 0x65, 0x20, 0x47, 0x72, 0x65, 0x65, 0x6E, 0x77, 0x69, 0x63, 0x68, 0x20, 0x65, 0x73, 0x74, 0xE3, 0x6F, 0x20, 0x64, 0x65, 0x73, 0x74, 0x61, 0x63, 0x61, 0x64, 0x6F, 0x73, 0x2C, 0x20, 0x63, 0x6F, 0x6D, 0x20, 0x61, 0x20, 0x69, 0x6E, 0x74, 0x65, 0x72, 0x73, 0x65, 0xE7, 0xE3, 0x6F, 0x20, 0x6E, 0x6F, 0x20, 0x70, 0x6F, 0x6E, 0x74, 0x6F, 0x20, 0x4F) | ForEach-Object { [char]$_ })
}

# Figure labels per language
$figureLabels = @{}
$figureLabels["en-US"] = "Figure"
$esFig = @(0x46, 0x69, 0x67, 0x75, 0x72, 0x61)
$figureLabels["es-ES"] = -join ($esFig | ForEach-Object { [char]$_ })
$ptFig = @(0x46, 0x69, 0x67, 0x75, 0x72, 0x61)
$figureLabels["pt-BR"] = -join ($ptFig | ForEach-Object { [char]$_ })

Write-Host "Starting Mathematics chapter creation..."

# Load source atlas for source lookups
$sourceAtlas = Read-JsonFile "$baseDir\lang\sources\atlas.json"

# For each language, create class files
foreach ($lang in $langs) {
    Write-Host "`n=== Processing $lang ==="
    $atlas = Read-JsonFile "$baseDir\lang\$lang\atlas.json"
    
    # Find where Math items start
    $mathStart = 0
    for ($i = 0; $i -lt $atlas.atlas.Count; $i++) {
        if ($atlas.atlas[$i].uuid -eq $mathUuids[0]) { $mathStart = $i; break }
    }
    
    # Extract audio from a Physics class file to reuse
    $sampleFile = "$baseDir\lang\$lang\29cd915c-1d1b-4769-a3d2-50e157a4de4a.json"
    $sampleClass = Read-JsonFile $sampleFile
    
    $classCreated = 0
    for ($mi = 0; $mi -lt 13; $mi++) {
        $uuid = $mathUuids[$mi]
        $aItem = $atlas.atlas[$mathStart + $mi]
        $index = $aItem.index
        $audioUrl = $aItem.audio
        $isFirst = ($mi -eq 0)  # First item has no SECTION_prerequisites
        $hasImage = ($aItem.image -and $aItem.image.Length -gt 0)
        
        Write-Host "  Creating $($uuid.Substring(0,8)) ($index)")
        $imgId = "imgMath" + ($mi+1)
        
        # Build class object
        $classObj = [PSCustomObject]@{
            title = $index
            header = $index
            sources = @($uuid)
            scripts = @($uuid)
            audio = @(
                [PSCustomObject]@{ url = $audioUrl; external = $true; spotify = $false },
                [PSCustomObject]@{ url = "https://spotifycreators-web.app.link/e/KDadgCsMlVb"; external = $true; spotify = $true }
            )
            index = @("atlas")
            license = @("SPDX-License-Identifier: GPL-3.0-or-later", "CC BY-NC 4.0 DEED")
            last_update = @("1775271675")
            authors = @("")
            reviewers = @()
            type = "class"
            version = 2
            editing = $false
            content = @()
            exercise_v2 = @()
            game_v2 = @()
            date_time = $null
        }
        
        # SECTION_prerequisites for non-first items
        if (-not $isFirst) {
            $prevItem = $atlas.atlas[$mathStart + $mi - 1]
            $heading = $prereqHeadings[$lang]
            $body = $prereqBodies[$lang]
            $prereqText = "### $heading`n`n$body (<htcite0>)."
            
            $prereqSection = [PSCustomObject]@{
                id = "SECTION_prerequisites"
                text = @(
                    [PSCustomObject]@{
                        text = $prereqText
                        source = @(
                            [PSCustomObject]@{
                                type = 1
                                uuid = "b2f637db-6c44-4941-849c-6568ce3c10b4"
                                text = "History Tracers Atlas"
                                page = $prevItem.index
                                date_time = [PSCustomObject]@{ type = "gregory"; year = "2024"; month = ""; day = "" }
                            }
                        )
                        date_time = $null
                        isTable = $false
                        imgdesc = ""
                        format = "markdown"
                        PostMention = ""
                    }
                )
            }
            $classObj.content += $prereqSection
        }
        
        # SECTION_local_content - copy text from atlas.json
        $localContent = [PSCustomObject]@{
            id = "SECTION_local_content"
            text = @()
        }
        
        # If image-bearing, prepend image HTText
        if ($hasImage) {
            $prefix = $uuid.Substring(0, 8)
            $figDesc = ""
            if ($imgDesc[$lang] -and $imgDesc[$lang][$prefix]) {
                $figDesc = $imgDesc[$lang][$prefix]
            } else {
                $figDesc = "Figure description"
            }
            
            $figureLabel = $figureLabels[$lang]
            $imageHtml = "<p class=\"desc\"><img id=\"" + $imgId + "\" onclick=\"htImageZoom('" + $imgId + "', '0%')\" src=\"\" class=\"imgcenter\"/><b>" + $figureLabel + " 1</b>: " + $figDesc + "</p>"
            
            # Find the source uuid from the first text that has one (to credit image author)
            $imageSourceUuid = ""
            $imageSourceText = ""
            foreach ($t in $aItem.text) {
                if ($t.source -and $t.source.Count -gt 0) {
                    $imageSourceUuid = $t.source[0].uuid
                    $imageSourceText = $t.source[0].text
                    break
                }
            }
            
            $imgTextEntry = [PSCustomObject]@{
                text = $imageHtml
                source = @(
                    [PSCustomObject]@{
                        type = 1
                        uuid = if ($imageSourceUuid) { $imageSourceUuid } else { "b2f637db-6c44-4941-849c-6568ce3c10b4" }
                        text = if ($imageSourceText) { $imageSourceText } else { "History Tracers Atlas" }
                        page = ""
                        date_time = [PSCustomObject]@{ type = "gregory"; year = "2024"; month = ""; day = "" }
                    }
                )
                date_time = $null
                isTable = $false
                imgdesc = ""
                format = "html"
                PostMention = ""
            }
            $localContent.text += $imgTextEntry
        }
        
        # Copy all text entries from atlas.json
        foreach ($t in $aItem.text) {
            # Clean the source array
            $sourceArray = @()
            if ($t.source -and $t.source.Count -gt 0) {
                foreach ($s in $t.source) {
                    $sourceArray += [PSCustomObject]@{
                        type = $s.type
                        uuid = $s.uuid
                        text = $s.text
                        page = if ($s.page) { $s.page } else { "" }
                        date_time = [PSCustomObject]@{
                            type = if ($s.date_time -and $s.date_time.type) { $s.date_time.type } else { "gregory" }
                            year = if ($s.date_time -and $s.date_time.year) { $s.date_time.year } else { "" }
                            month = if ($s.date_time -and $s.date_time.month) { $s.date_time.month } else { "" }
                            day = if ($s.date_time -and $s.date_time.day) { $s.date_time.day } else { "" }
                        }
                    }
                }
            }
            
            $textEntry = [PSCustomObject]@{
                text = $t.text
                source = $sourceArray
                date_time = $null
                isTable = $false
                imgdesc = if ($t.imgdesc) { $t.imgdesc } else { "" }
                format = $t.format
                PostMention = if ($t.PostMention) { $t.PostMention } else { "" }
            }
            $localContent.text += $textEntry
        }
        
        $classObj.content += $localContent
        Write-JsonFile "$baseDir\lang\$lang\$uuid.json" $classObj
        $classCreated++
    }
    
    Write-Host "  Created $classCreated class files for $lang"
}

# Create JS files for each Math UUID
Write-Host "`n=== Creating JS files ==="
$imageItems = @{
    "a494d959" = "images/Mapswire/continent_af-where-is-africa_coordinates.png"
    "1cfb7c60" = "images/Mapswire/continent_af-where-is-africa_coordinates.png"
}
$jsCreated = 0
for ($mi = 0; $mi -lt 13; $mi++) {
    $uuid = $mathUuids[$mi]
    $prefix = $uuid.Substring(0, 8)
    $imgId = "imgMath" + ($mi+1)
    
    $jsContent = "// SPDX-License-Identifier: GPL-3.0-or-later`n`n"
    $jsContent += "var localAnswerVector = undefined;`n`n"
    $jsContent += "function htLoadExercise() {`n"
    $jsContent += "    if (localAnswerVector == undefined) {`n"
    $jsContent += "        localAnswerVector = htLoadAnswersFromExercise();`n"
    $jsContent += "    } else {`n"
    $jsContent += "        htResetAnswers(localAnswerVector);`n"
    $jsContent += "    }`n"
    $jsContent += "    return false;`n"
    $jsContent += "}`n`n"
    $jsContent += "function htCheckAnswers() {`n"
    $jsContent += "    if (localAnswerVector != undefined) {`n"
    $jsContent += "        for (let i = 0; i < localAnswerVector.length; i++) {`n"
    $jsContent += "            htCheckExerciseAnswer(""exercise""+i, localAnswerVector[i], ""#answer""+i, ""#explanation""+i);`n"
    $jsContent += "        }`n"
    $jsContent += "    }`n"
    $jsContent += "}`n`n"
    $jsContent += "function htLoadContent() {`n"
    $jsContent += "    htWriteNavigation();`n"
    
    # Add htSetImageSrc for image-bearing items
    if ($imageItems.ContainsKey($prefix)) {
        $imgPath = $imageItems[$prefix]
        $jsContent += "    htSetImageSrc('" + $imgId + "', '" + $imgPath + "');`n"
    }
    
    $jsContent += "    return false;`n"
    $jsContent += "}`n"
    
    [System.IO.File]::WriteAllText("$baseDir\js\$uuid.js", $jsContent, [System.Text.UTF8Encoding]::new($false))
    $jsCreated++
}
Write-Host "Created $jsCreated JS files"

# Create source files for each Math UUID
Write-Host "`n=== Creating source files ==="

# Build a lookup of all source entries from lang/sources/atlas.json
$sourceLookup = @{}
if ($sourceAtlas.reference_sources) {
    foreach ($s in $sourceAtlas.reference_sources) {
        $sourceLookup[$s.id] = $s
    }
}
if ($sourceAtlas.primary_sources) {
    foreach ($s in $sourceAtlas.primary_sources) {
        $sourceLookup[$s.id] = $s
    }
}
if ($sourceAtlas.religious_sources) {
    foreach ($s in $sourceAtlas.religious_sources) {
        $sourceLookup[$s.id] = $s
    }
}

$srcCreated = 0
for ($mi = 0; $mi -lt 13; $mi++) {
    $uuid = $mathUuids[$mi]
    $isFirst = ($mi -eq 0)
    
    # Collect unique source UUIDs used in this item across all 3 languages
    $usedUuids = @{}
    foreach ($lang in $langs) {
        $atlas = Read-JsonFile "$baseDir\lang\$lang\atlas.json"
        $mathStart = 0
        for ($i = 0; $i -lt $atlas.atlas.Count; $i++) {
            if ($atlas.atlas[$i].uuid -eq $uuid) { $mathStart = $i; break }
        }
        $aItem = $atlas.atlas[$mathStart]
        foreach ($t in $aItem.text) {
            if ($t.source) {
                foreach ($s in $t.source) {
                    $usedUuids[$s.uuid] = $true
                }
            }
        }
        
        # Also add the "image" source rule uuid from the image HTText (use atlas page ref)
    }
    
    # Build reference_sources array from source lookup
    $refSources = @()
    foreach ($suuid in $usedUuids.Keys) {
        if ($sourceLookup.ContainsKey($suuid)) {
            $src = $sourceLookup[$suuid]
            $refSources += [PSCustomObject]@{
                id = $suuid
                citation = $src.citation
                date_time = if ($src.date_time) { $src.date_time } else { "" }
                published = if ($src.published) { $src.published } else { "" }
                url = if ($src.url) { $src.url } else { "" }
            }
        }
    }
    
    # Add previous-page entry for non-first items
    if (-not $isFirst) {
        $prevUuid = $mathUuids[$mi - 1]
        $refSources += [PSCustomObject]@{
            id = "b2f637db-6c44-4941-849c-6568ce3c10b4"
            citation = "History Tracers Atlas"
            date_time = "2024-05-11"
            published = ""
            url = "index.html?page=atlas&atlas_page=$prevUuid"
        }
    }
    
    $sourceObj = [PSCustomObject]@{
        version = 1
        type = "sources"
        license = @("SPDX-License-Identifier: GPL-3.0-or-later")
        last_update = @("1775271675")
        primary_sources = $null
        reference_sources = $refSources
        religious_sources = $null
        social_media_sources = $null
    }
    
    Write-JsonFile "$baseDir\lang\sources\$uuid.json" $sourceObj
    $srcCreated++
}
Write-Host "Created $srcCreated source files"

# Update new_atlas.json for all 3 languages
Write-Host "`n=== Updating new_atlas.json ==="

foreach ($lang in $langs) {
    $newAtlas = Read-JsonFile "$baseDir\lang\$lang\new_atlas.json"
    $atlas = Read-JsonFile "$baseDir\lang\$lang\atlas.json"
    
    # Find math items start
    $mathStart = 0
    for ($i = 0; $i -lt $atlas.atlas.Count; $i++) {
        if ($atlas.atlas[$i].uuid -eq $mathUuids[0]) { $mathStart = $i; break }
    }
    
    # Build name/desc lookup from atlas.json's Math items
    $nameLookup = @{}
    $descLookup = @{}
    for ($mi = 0; $mi -lt 13; $mi++) {
        $aItem = $atlas.atlas[$mathStart + $mi]
        $nameLookup[$aItem.uuid] = $aItem.index
        if ($aItem.text -and $aItem.text.Count -gt 0 -and $aItem.text[0].text) {
            $firstText = $aItem.text[0].text
            if ($firstText.Length -gt 0 -and $firstText.StartsWith("<h3>")) {
                $closeIdx = $firstText.IndexOf("</h3>")
                $afterH3 = $firstText.Substring($closeIdx + 5).TrimStart()
                $newlineIdx = $afterH3.IndexOf("`n")
                if ($newlineIdx -ge 0) {
                    $descLookup[$aItem.uuid] = "<p>" + $afterH3.Substring(0, $newlineIdx).Trim() + "</p>"
                } else {
                    $descLookup[$aItem.uuid] = "<p>" + $afterH3.Trim() + "</p>"
                }
            } else {
                $descLookup[$aItem.uuid] = $aItem.index
            }
        } else {
            $descLookup[$aItem.uuid] = $aItem.index
        }
    }
    
    # Check if math_header and groups_math already exist
    $hasMathSection = $false
    foreach ($c in $newAtlas.content) {
        if ($c.id -eq "math_header") { $hasMathSection = $true; break }
    }
    
    if (-not $hasMathSection) {
        # Add math_header after physics groups
        $insertAfterPhysics = 0
        for ($i = 0; $i -lt $newAtlas.content.Count; $i++) {
            if ($newAtlas.content[$i].id -eq "groups_physics") { $insertAfterPhysics = $i; break }
        }
        
        $mathHeader = [PSCustomObject]@{
            id = "math_header"
            target = "class-math"
            page = ""
            value_type = ""
            html_value = "Mathematics"
            value = $null
            date_time = $null
        }
        
        # Build groups_math value array
        $groupsMath = @()
        for ($mi = 0; $mi -lt 13; $mi++) {
            $uuidVal = $mathUuids[$mi]
            $aItem = $atlas.atlas[$mathStart + $mi]
            $groupsMath += [PSCustomObject]@{
                family_id = ""
                person_id = ""
                id = $uuidVal
                name = if ($nameLookup.ContainsKey($uuidVal)) { $nameLookup[$uuidVal] } else { $aItem.index }
                desc = if ($descLookup.ContainsKey($uuidVal)) { $descLookup[$uuidVal] } else { $aItem.index }
                date_time = $null
                author = if ($aItem.author) { $aItem.author } else { "" }
            }
        }
        
        $mathGroup = [PSCustomObject]@{
            id = "groups_math"
            target = "class-math"
            page = "class_content"
            value_type = "group-list"
            html_value = ""
            value = $groupsMath
            date_time = $null
        }
        
        # Insert after physics group
        $contentList = [Collections.Generic.List[object]]($newAtlas.content)
        $contentList.Insert($insertAfterPhysics + 1, $mathHeader)
        $contentList.Insert($insertAfterPhysics + 2, $mathGroup)
        $newAtlas.content = [object[]]$contentList
        
        Write-JsonFile "$baseDir\lang\$lang\new_atlas.json" $newAtlas
        Write-Host "  $lang: Added Mathematics section"
    } else {
        Write-Host "  $lang: Mathematics section already exists, skipping"
    }
}

Write-Host "`n=== DONE ==="
