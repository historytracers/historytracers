Name: historytraers
Version: 1.0.0
Release: 1%{?dist}
Summary: A free and open-source teaching tool.
License: GPL3
URL: https://github.com/historytracers/historytracers
Source0: %{name}-%{version}.tar.gz

BuildArch: x86_64
BuildRequires: systemd

%description
Teaching is often a daily challenge for both students and
teachers, each for different reasons. Our goal is to support
both sides of the learning process by providing diverse tools.

%prep
%setup -q

%build
autoreconf -f -i
%configure
make all

%install
# Install the binary
install -d %{buildroot}%{_bindir}
install -m 755 historytracers %{buildroot}%{_bindir}/historytracers

# Install the systemd service file
install -d %{buildroot}%{_unitdir}
install -m 644 historytracers.service %{buildroot}%{_unitdir}/historytracers.service

# Install configuration file
install -d %{buildroot}%{_sysconfdir}/historytracers
[ -f historytracers.conf ] && install -m 600 historytracers.conf %{buildroot}%{_sysconfdir}/historytracers/

# Create web directories
install -d %{buildroot}%{_datadir}/historytracers/www/bodies
install -d %{buildroot}%{_datadir}/historytracers/www/css
install -d %{buildroot}%{_datadir}/historytracers/www/csv
install -d %{buildroot}%{_datadir}/historytracers/www/gedcom
install -d %{buildroot}%{_datadir}/historytracers/www/js
install -d %{buildroot}%{_datadir}/historytracers/www/lang
install -d %{buildroot}%{_datadir}/historytracers/www/webfonts

# Install web content if it exists in source
[ -d www/bodies ] && cp -r www/bodies/* %{buildroot}%{_datadir}/historytracers/www/bodies/ 2>/dev/null || :
[ -d www/css ] && cp -r www/css/* %{buildroot}%{_datadir}/historytracers/www/css/ 2>/dev/null || :
[ -d www/csv ] && cp -r www/csv/* %{buildroot}%{_datadir}/historytracers/www/csv/ 2>/dev/null || :
[ -d www/gedcom ] && cp -r www/gedcom/* %{buildroot}%{_datadir}/historytracers/www/gedcom/ 2>/dev/null || :
[ -d www/index.html ] && cp www/index.html %{buildroot}%{_datadir}/historytracers/www/index.html 2>/dev/null || :
[ -d www/js ] && cp -r www/js/* %{buildroot}%{_datadir}/historytracers/www/js/ 2>/dev/null || :
[ -d www/lang ] && cp -r www/lang/en-US %{buildroot}%{_datadir}/historytracers/www/lang/ 2>/dev/null || :
[ -d www/sources ] && cp -r www/lang/en-US %{buildroot}%{_datadir}/historytracers/www/lang/ 2>/dev/null || :
[ -d www/webfonts ] && cp -r www/webfonts/* %{buildroot}%{_datadir}/historytracers/www/webfonts/ 2>/dev/null || :

# Create runtime directory
install -d %{buildroot}%{_localstatedir}/lib/historytracers

%pre
# Pre-install script - create user if needed
getent group historytracers >/dev/null || groupadd -r historytracers
getent passwd historytracers >/dev/null || useradd -r -g historytracers -s /sbin/nologin \
    -c "A teaching too" historytracers

%post
# Post-install script - enable and start service
chown -R historytracers:historytracers %{_datadir}/historytracers/www
chmod 755 -R %{_datadir}/historytracers/www
%systemd_post historytracers.service

%preun
# Pre-uninstall script
%systemd_preun historytracers.service

%postun
# Post-uninstall script
%systemd_postun_with_restart historytracers.service

%files
%license LICENSE
%doc README.md
%{_bindir}/historytracers
%{_unitdir}/historytracers.service
%config(noreplace) %{_sysconfdir}/historytracers/historytracers.conf
%dir %{_sysconfdir}/historytracers
%dir %{_localstatedir}/lib/historytracers
%dir %{_datadir}/historytracers
%dir %{_datadir}/historytracers/www
%dir %{_datadir}/historytracers/www/bodies
%dir %{_datadir}/historytracers/www/css
%dir %{_datadir}/historytracers/www/csv
%dir %{_datadir}/historytracers/www/gedcom
%dir %{_datadir}/historytracers/www/images
%dir %{_datadir}/historytracers/www/js
%dir %{_datadir}/historytracers/www/webfonts
%{_datadir}/historytracers/www/index.html
%{_datadir}/historytracers/www/bodies/*
%{_datadir}/historytracers/www/css/*
%{_datadir}/historytracers/www/csv/*
%{_datadir}/historytracers/www/gedcom/*
%{_datadir}/historytracers/www/images/*
%{_datadir}/historytracers/www/js/*
%{_datadir}/historytracers/www/webffonts/*

%changelog
