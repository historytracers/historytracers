Name: historytracers
Version: 1.0.0
Release: 1%{?dist}
Summary: A free and open-source teaching tool.
License: GPLv3
URL: https://github.com/historytracers/historytracers

BuildRequires: systemd
BuildRequires: systemd-rpm-macros

Requires: %{name}-www = %{version}-%{release}

%package www
Summary: Web content for History Tracers
Group: Applications/Education
BuildArch: noarch

%description www
Static web content served by the History Tracers viewer.
Install this subpackage alone (with %{name}-images) to serve
the content with your own web server (Apache, IIS) from
/var/www/htdocs/historytracers.

%package images
Summary: Images for History Tracers
Group: Applications/Education
Requires: %{name}-www = %{version}-%{release}
BuildArch: noarch

%description images
Additional images for the History Tracers teaching tool.
Provides the image files used by the viewer interface,
excluding the options configuration file.

%package devel
Summary: Development files for History Tracers
Group: Development/Libraries
BuildArch: noarch

%description devel
Source code and development files for History Tracers.
Contains the complete repository source tree, excluding
the pre-built www/ directory and its content.

%description
Teaching is often a daily challenge for both students and
teachers, each for different reasons. Our goal is to support
both sides of the learning process by providing diverse tools.

%prep
# No setup needed

%build
# Nothing to do - compilation done by ht2pkg.sh

%install
rm -rf %{buildroot}

# Create directory structure
mkdir -p %{buildroot}%{_bindir}
mkdir -p %{buildroot}%{_sysconfdir}/historytracers
mkdir -p %{buildroot}%{_unitdir}/
mkdir -p %{buildroot}%{_localstatedir}/lib/historytracers
mkdir -p %{buildroot}/var/www/htdocs/historytracers/images
mkdir -p %{buildroot}/usr/src/historytracers

# Install the systemd service file
install -m 644 %{_sourcedir}/packaging/service/historytracers.service %{buildroot}%{_unitdir}/historytracers.service

# Install the binary from build/ directory
install -m 755 %{_sourcedir}/build/historytracers %{buildroot}%{_bindir}/historytracers

# Install configuration file if it exists
[ -f %{_sourcedir}/packaging/conf/historytracers.conf ] && \
  install -m 600 %{_sourcedir}/packaging/conf/historytracers.conf %{buildroot}%{_sysconfdir}/historytracers/historytracers.conf

# ===== WWW SUBPACKAGE: web content (standalone, for any web server) =====
# No trailing www/ level: the tree lands directly in
# /var/www/htdocs/historytracers/.

# Install everything from www/ except the images/ directory
find %{_sourcedir}/www -mindepth 1 -maxdepth 1 ! -name "images" -exec cp -r {} %{buildroot}/var/www/htdocs/historytracers/ \;

# Install only img_options.json from the images/ directory
install -m 644 %{_sourcedir}/www/images/img_options.json %{buildroot}/var/www/htdocs/historytracers/images/

# ===== IMAGES SUBPACKAGE: image files =====

# Install the full images/ tree except img_options.json, preserving hierarchy
(cd %{_sourcedir}/www/images && tar cf - --exclude=img_options.json .) | \
  (cd %{buildroot}/var/www/htdocs/historytracers/images && tar xf -)

# ===== DEVEL SUBPACKAGE: source files =====

# Copy top-level source entries except build outputs, www/, packaging temp
# dirs and local run artifacts (redirect captures like err/out and logs not
# only bloat the payload: they embed the BUILDROOT path and trip
# /usr/lib/rpm/check-buildroot, aborting the build)
cd %{_sourcedir}
for entry in * .[!.]*; do \
  [ -e "$entry" ] || continue; \
  case "$entry" in www|.git|build|artifacts|rpmbuild|err|out|historytracers.log|config.log|config.status|autom4te.cache) continue;; esac; \
  cp -r "$entry" %{buildroot}/usr/src/historytracers/; \
done

%pre
getent group historytracers >/dev/null || groupadd -r historytracers
getent passwd historytracers >/dev/null || useradd -r -g historytracers -s /sbin/nologin \
    -d /usr/share/historytracers -c "A teaching tool" historytracers

%post
chown -R historytracers:historytracers %{_sysconfdir}/historytracers 2>/dev/null || true
mkdir -p %{_localstatedir}/lib/historytracers %{_localstatedir}/log/historytracers 2>/dev/null || true
chown historytracers:historytracers %{_localstatedir}/lib/historytracers 2>/dev/null || true
[ -d %{_localstatedir}/log/historytracers ] && chown historytracers:historytracers %{_localstatedir}/log/historytracers 2>/dev/null || true
%systemd_post historytracers.service

%post www
chown -R historytracers:historytracers /var/www/htdocs/historytracers 2>/dev/null || true

%preun
%systemd_preun historytracers.service

%postun
%systemd_postun_with_restart historytracers.service

%files
%license LICENSE
%doc README.md
%{_bindir}/historytracers
%{_unitdir}/historytracers.service
%config(noreplace) %{_sysconfdir}/historytracers/historytracers.conf
%dir %{_sysconfdir}/historytracers
%dir %{_localstatedir}/lib/historytracers

%files www
%dir /var/www/htdocs/historytracers
/var/www/htdocs/historytracers/*
%exclude /var/www/htdocs/historytracers/images/*
/var/www/htdocs/historytracers/images/img_options.json

%files images
%dir /var/www/htdocs/historytracers/images
/var/www/htdocs/historytracers/images/*
%exclude /var/www/htdocs/historytracers/images/img_options.json

%files devel
%dir /usr/src/historytracers
/usr/src/historytracers/*

%changelog
* Sun Nov 02 2025 Thiago Marques <historytracers@gmail.com> - 1.0.0-1
- Initial package build
- Split into main, www, images, and devel subpackages
