<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:outline="http://wkhtmltopdf.org/outline"
                xmlns="http://www.w3.org/1999/xhtml">
  <xsl:output doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN"
              doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
              indent="yes" />

  <xsl:template match="outline:outline">
    <html>
      <head>
        <title>Índice</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style>
          body {
            font-family: "Segoe UI", Calibri, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #1a1a2e;
          }

          h1 {
            font-size: 20px;
            font-weight: 700;
            color: #1b2c4f;
            margin: 0 0 24px;
            padding-bottom: 10px;
            border-bottom: 3px solid #4a9eff;
          }

          ul {
            list-style: none;
            margin: 0;
            padding: 0;
          }

          li { margin: 0; }

          /* Chapter row: title, dotted leader, page number */
          div.ch {
            display: flex;
            align-items: flex-end;
            padding: 9px 0;
            border-bottom: 1px solid #eef0f5;
          }

          div.ch a {
            font-size: 13px;
            font-weight: 600;
            color: #1b2c4f;
            text-decoration: none;
            white-space: nowrap;
            flex-shrink: 0;
            padding-bottom: 2px;
          }

          /* Dotted leader that fills the space between title and page */
          .leader {
            flex: 1;
            height: 1px;
            border-bottom: 1.5px dotted #bbb;
            margin: 0 8px 3px;
            min-width: 20px;
          }

          span.pg {
            font-size: 13px;
            font-weight: 600;
            color: #4a6080;
            white-space: nowrap;
            flex-shrink: 0;
            padding-bottom: 2px;
          }
        </style>
      </head>
      <body>
        <h1>Índice</h1>
        <ul>
          <xsl:apply-templates select="outline:item/outline:item"/>
        </ul>
      </body>
    </html>
  </xsl:template>

  <!-- Render only top-level items (chapters). No recursion. -->
  <xsl:template match="outline:item">
    <li>
      <xsl:if test="@title!=''">
        <div class="ch">
          <a>
            <xsl:if test="@link">
              <xsl:attribute name="href"><xsl:value-of select="@link"/></xsl:attribute>
            </xsl:if>
            <xsl:if test="@backLink">
              <xsl:attribute name="name"><xsl:value-of select="@backLink"/></xsl:attribute>
            </xsl:if>
            <xsl:value-of select="@title"/>
          </a>
          <span class="leader">
            <xsl:comment>leader</xsl:comment>
          </span>
          <span class="pg"><xsl:value-of select="@page"/></span>
        </div>
      </xsl:if>
    </li>
  </xsl:template>

</xsl:stylesheet>
