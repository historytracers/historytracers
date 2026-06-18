<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:wix="http://wixtoolset.org/schemas/v5/wxs"
  exclude-result-prefixes="wix">

  <xsl:output method="xml" indent="yes" />

  <!-- Identity transform -->
  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()" />
    </xsl:copy>
  </xsl:template>

  <!-- Remove img_options.json component from images harvest -->
  <xsl:template match="wix:Component[wix:File/@Source[contains(., 'img_options.json')]]" />

</xsl:stylesheet>
