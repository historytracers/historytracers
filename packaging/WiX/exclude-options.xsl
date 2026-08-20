<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:wix="http://wixtoolset.org/schemas/v4/wxs"
  exclude-result-prefixes="wix">

  <xsl:output method="xml" indent="yes" />

  <!-- Identity transform -->
  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()" />
    </xsl:copy>
  </xsl:template>

  <!-- Remove img_options.json and README files from images harvest (basename match) -->
  <xsl:template match="wix:Component[wix:File/@Source[
    substring(., string-length(.) - 15) = 'img_options.json' and
    (string-length(.) = 16 or translate(substring(., string-length(.) - 16, 1), '\', '/') = '/')
  ]]" />
  <xsl:template match="wix:Component[wix:File/@Source[
    contains(translate(concat(., '/'), '\', '/'), '/README') or
    substring(translate(., '\', '/'), 1, 6) = 'README'
  ]]" />

</xsl:stylesheet>
