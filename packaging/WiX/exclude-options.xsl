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

  <!-- Remove img_options.json from images harvest -->
  <xsl:template match="wix:Component[wix:File/@Source[
    substring(., string-length(.) - 15) = 'img_options.json' and
    (string-length(.) = 16 or translate(substring(., string-length(.) - 16, 1), '\', '/') = '/')
  ]]" />

  <!-- Remove README-prefixed files from images harvest (basename match) -->
  <xsl:template match="wix:Component">
    <xsl:variable name="base">
      <xsl:call-template name="basename">
        <xsl:with-param name="path" select="translate(wix:File/@Source, '\', '/')" />
      </xsl:call-template>
    </xsl:variable>
    <xsl:if test="not(starts-with($base, 'README'))">
      <xsl:copy>
        <xsl:apply-templates select="@*|node()" />
      </xsl:copy>
    </xsl:if>
  </xsl:template>

  <!-- Recursively strip leading path components, leaving the basename -->
  <xsl:template name="basename">
    <xsl:param name="path" />
    <xsl:choose>
      <xsl:when test="contains($path, '/')">
        <xsl:call-template name="basename">
          <xsl:with-param name="path" select="substring-after($path, '/')" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$path" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

</xsl:stylesheet>
