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
Teaching is often a daily challenge for both students and teachers,
each for different reasons.
Our goal is to support both sides of the learning process by providing diverse tools.

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

# Install configuration files (if any)
install -d %{buildroot}%{_sysconfdir}/historytracers
[ -f historytracers.conf ] && install -m 600 historytracers.conf %{buildroot}%{_sysconfdir}/historytracers/

# Create runtime directory
install -d %{buildroot}%{_localstatedir}/lib/historytracers

%pre
# Pre-install script - create user if needed
getent group historytracers >/dev/null || groupadd -r historytracers
getent passwd historytracers >/dev/null || useradd -r -g historytracers -s /sbin/nologin \
    -c "A teaching too" historytracers

%post
# Post-install script - enable and start service
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

%changelog
