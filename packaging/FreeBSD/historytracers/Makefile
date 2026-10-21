PORTNAME=	historytracers
PORTVERSION=	1.0.0
CATEGORIES=	education www
MASTER_SITES=	https://github.com/historytracers/historytracers/releases/download/v${PORTVERSION}/
DISTNAME=	${PORTNAME}-${PORTVERSION}

MAINTAINER=	historytracers@gmail.com
COMMENT=	Free and open-source teaching tool
WWW=		https://github.com/historytracers/historytracers

LICENSE=	GPLv3
LICENSE_FILE=	${WRKSRC}/LICENSE

USES=		autoreconf gmake go:modules gnome pkgconfig
GNU_CONFIGURE=	yes
CONFIGURE_ARGS=	--with-conf-path=${PREFIX}/etc/historytracers/dev.conf \
		--with-src-path=${WRKSRC}/ \
		--with-content-path=${WRKSRC}/www/ \
		--with-log-path=/var/log/historytracers/
USE_GNOME=	gtk30 cairo pango gdkpixbuf
LIB_DEPENDS=	libwebkit2gtk-4.1.so:www/webkit2-gtk@41

OPTIONS_DEFINE=	VIEWER WWW
OPTIONS_DEFAULT=	VIEWER WWW
OPTIONS_SUB=	yes
VIEWER_DESC=	Viewer binary and rc.d service script
WWW_DESC=	Web content for any HTTP server (Apache, IIS)

USERS=		historytracers
GROUPS=		historytracers

SUB_FILES=	pkg-install pkg-message historytracers

PLIST_SUB+=	PORTVERSION=${PORTVERSION}

# The distfile ships no pre-built www/ tree: generate the web content on
# the target with the publisher the same way ht_compile() in
# historytracers2pkg.sh does (needs common/ from the submodule and
# creates ./audios itself).
post-build:
.if ${PORT_OPTIONS:MWWW}
	cd ${WRKSRC} && ${MKDIR} /var/log/historytracers 2>/dev/null; \
	${WRKSRC}/build/historytracers-publisher -minify -audiofiles -gedcom -verbose -conf ./packaging/build_historytracers.conf >> historytracers.log 2>&1
.endif

post-install-VIEWER-on:
	${INSTALL_PROGRAM} ${WRKSRC}/build/historytracers ${STAGEDIR}${PREFIX}/bin/historytracers
	${SED} -e 's,%%PREFIX%%,${PREFIX},g' ${FILESDIR}/historytracers.in > ${WRKDIR}/historytracers
	${INSTALL_SCRIPT} ${WRKDIR}/historytracers ${STAGEDIR}${PREFIX}/etc/rc.d/historytracers

post-install-WWW-on:
	${MKDIR} ${STAGEDIR}${PREFIX}/etc/historytracers
	${INSTALL_DATA} ${WRKSRC}/packaging/conf/historytracers.conf ${STAGEDIR}${PREFIX}/etc/historytracers/historytracers.conf.sample
	${MKDIR} ${STAGEDIR}/var/www/htdocs/historytracers
	(cd ${WRKSRC}/www && ${COPYTREE_SHARE} . ${STAGEDIR}/var/www/htdocs/historytracers)
	${MKDIR} ${STAGEDIR}/var/db/historytracers ${STAGEDIR}/var/log/historytracers
# Register the generated web tree in the packing list
	(cd ${STAGEDIR}/var/www/htdocs/historytracers && ${FIND} . -type f | ${SORT} | ${SED} -e 's,^\./,%%WWW%%var/www/htdocs/historytracers/,' >> ${TMPPLIST})
	(cd ${STAGEDIR}/var/www/htdocs/historytracers && ${FIND} . -type d | ${SORT} -r | ${SED} -e 's,^\./,%%WWW%%@dir var/www/htdocs/historytracers/,' -e 's,%%WWW%%@dir var/www/htdocs/historytracers/\.$$,%%WWW%%@dir var/www/htdocs/historytracers,' >> ${TMPPLIST})

.include <bsd.port.mk>
