# $FreeBSD$
# Created by: History Tracers Team <historytracers@gmail.com>

PORTNAME=	historytracers
DISTVERSION=	1.0.0
CATEGORIES=	education
MASTER_SITES=	https://github.com/historytracers/historytracers/releases/download/v${DISTVERSION}/
DISTNAME=	${PORTNAME}-${DISTVERSION}

MAINTAINER=	historytracers@gmail.com
COMMENT=	Teaching tool with a built-in web server and native desktop viewer
WWW=		https://historytracers.org/

LICENSE=	GPLv3
LICENSE_FILE=	${WRKSRC}/LICENSE

# The viewer renders through an embedded WebKit2GTK web view (GUI software).
LIB_DEPENDS=	libwebkit2gtk-4.0.so:www/webkit2-gtk3

USES=		autoreconf gnome go pkgconfig
USE_GNOME=	gtk30
USE_RC_SUBR=	historytracers
SUB_FILES=	pkg-message

GNU_CONFIGURE=	yes
CONFIGURE_ARGS=	--disable-editor \
		--with-conf-path=${PREFIX}/etc/historytracers/historytracers.conf \
		--with-src-path=${DATADIR}/ \
		--with-content-path=${DATADIR}/www/ \
		--with-log-path=/var/log/historytracers/

# The build drives the local Go modules (src/viewer, src/publisher). Dependencies
# come from the module cache; run 'make fetch'/'go mod download' with network
# access, or vendor the modules, for fully offline builds.
GOFLAGS=	-mod=mod

post-install:
	${MKDIR} ${STAGEDIR}${DATADIR}/www
	(cd ${WRKSRC}/www && ${COPYTREE_SHARE} . ${STAGEDIR}${DATADIR}/www)
	${MKDIR} ${STAGEDIR}${PREFIX}/etc/historytracers
	${INSTALL_DATA} ${WRKSRC}/packaging/conf/historytracers.conf \
		${STAGEDIR}${PREFIX}/etc/historytracers/historytracers.conf.sample
	${MKDIR} ${STAGEDIR}${DOCSDIR}
.for doc in README.md README.es.md README.pt-BR.md CODE_OF_CONDUCT.md
	${INSTALL_DATA} ${WRKSRC}/${doc} ${STAGEDIR}${DOCSDIR}/
.endfor

.include <bsd.port.mk>
