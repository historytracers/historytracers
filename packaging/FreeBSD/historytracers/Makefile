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
LIB_DEPENDS=	libwebkit2gtk-4.1.so:www/webkit2gtk41

USE_RC_SUBR=	historytracers

USERS=		historytracers
GROUPS=		historytracers

PLIST_SUB+=	PORTVERSION=${PORTVERSION}

post-install:
	${MKDIR} ${STAGEDIR}${PREFIX}/etc/historytracers
	${INSTALL_DATA} ${WRKSRC}/packaging/conf/historytracers.conf ${STAGEDIR}${PREFIX}/etc/historytracers/historytracers.conf.sample
	${MKDIR} ${STAGEDIR}/var/db/historytracers ${STAGEDIR}/var/log/historytracers

.include <bsd.port.mk>
