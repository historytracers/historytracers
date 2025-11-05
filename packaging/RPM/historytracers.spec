Name: historytracers
Version: 1.0.0
Release: 1%{?dist}
Summary: A free and open-source teaching tool.
License: GPLv3
URL: https://github.com/historytracers/historytracers

BuildArch: x86_64
BuildRequires: systemd

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
mkdir -p %{buildroot}%{_datadir}/historytracers/
mkdir -p %{buildroot}%{_datadir}/doc/historytracers/
mkdir -p %{buildroot}%{_datadir}/licenses/historytracers/
mkdir -p %{buildroot}%{_sysconfdir}/historytracers
mkdir -p %{buildroot}%{_unitdir}/

# Install the systemd service file - use absolute path from build directory
install -d %{buildroot}%{_unitdir}
install -m 644 %{_sourcedir}/packaging/service/historytracers.service %{buildroot}%{_unitdir}/historytracers.service

# Install the binary from build/ directory
install -m 755 %{_sourcedir}/build/historytracers %{buildroot}%{_bindir}/historytracers

# Install configuration file if it exists
mkdir -p %{buildroot}%{_sysconfdir}/historytracers
[ -f %{_sourcedir}/packaging/conf/historytracers.conf ] && install -m 600 %{_sourcedir}/packaging/conf/historytracers.conf %{buildroot}%{_sysconfdir}/historytracers/historytracers.conf

# Install package files
install -m 644 %{_sourcedir}/README.md %{buildroot}/usr/share/doc/historytracers
install -m 644 %{_sourcedir}/LICENSE %{buildroot}/usr/share/licenses/historytracers

# Install web content from www/ directory
cp -r %{_sourcedir}/www/ %{buildroot}%{_datadir}/historytracers/

# Create runtime directory
mkdir -p %{buildroot}%{_localstatedir}/lib/historytracers

%pre
getent group historytracers >/dev/null || groupadd -r historytracers
getent passwd historytracers >/dev/null || useradd -r -g historytracers -s /sbin/nologin \
    -c "A teaching tool" historytracers

%post
if [ -d %{_datadir}/historytracers/www ]; then
    chown -R historytracers:historytracers %{_datadir}/historytracers/www
    chmod 755 -R %{_datadir}/historytracers/www
fi
%systemd_post historytracers.service

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
%dir %{_datadir}/historytracers
%dir %{_datadir}/historytracers/www
%{_datadir}/historytracers/www/*

%changelog
* Sun Nov 02 2025 Thiago Marques <historytracers@gmail.com> - 1.0.0-1
- Initial package build
