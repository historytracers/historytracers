Name: historytracers
Version: 1.0.0
Release: 1%{?dist}
Summary: A free and open-source teaching tool.
License: GPLv3
URL: https://github.com/historytracers/historytracers

BuildArch: x86_64
BuildRequires: systemd

%package images
Summary: Images for History Tracers
Group: Applications/Education
Requires: historytracers = %{version}-%{release}
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
mkdir -p %{buildroot}%{_datadir}/historytracers/
mkdir -p %{buildroot}%{_sysconfdir}/historytracers
mkdir -p %{buildroot}%{_unitdir}/
mkdir -p %{buildroot}%{_localstatedir}/lib/historytracers
mkdir -p %{buildroot}%{_datadir}/historytracers/www/images
mkdir -p %{buildroot}/usr/src/historytracers-%{version}

# Install the systemd service file
install -m 644 %{_sourcedir}/packaging/service/historytracers.service %{buildroot}%{_unitdir}/historytracers.service

# Install the binary from build/ directory
install -m 755 %{_sourcedir}/build/historytracers %{buildroot}%{_bindir}/historytracers

# Install configuration file if it exists
[ -f %{_sourcedir}/packaging/conf/historytracers.conf ] && \
  install -m 600 %{_sourcedir}/packaging/conf/historytracers.conf %{buildroot}%{_sysconfdir}/historytracers/historytracers.conf

# ===== MAIN PACKAGE: web content =====

# Install everything from www/ except the images/ directory
find %{_sourcedir}/www -mindepth 1 -maxdepth 1 ! -name "images" -exec cp -r {} %{buildroot}%{_datadir}/historytracers/www/ \;

# Install only img_options.json from the images/ directory
install -m 644 %{_sourcedir}/www/images/img_options.json %{buildroot}%{_datadir}/historytracers/www/images/

# ===== IMAGES SUBPACKAGE: image files =====

# Install all image files except img_options.json
find %{_sourcedir}/www/images -type f ! -name "img_options.json" -exec cp -t %{buildroot}%{_datadir}/historytracers/www/images/ {} +

# ===== DEVEL SUBPACKAGE: source files =====

# Copy everything from the source tree except the www/ directory
cd %{_sourcedir}
find . -maxdepth 1 ! -name "." ! -name "www" -exec cp -r {} %{buildroot}/usr/src/historytracers-%{version}/ \;

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
%exclude %{_datadir}/historytracers/www/images/*
%{_datadir}/historytracers/www/images/img_options.json

%files images
%dir %{_datadir}/historytracers
%dir %{_datadir}/historytracers/www
%dir %{_datadir}/historytracers/www/images
%{_datadir}/historytracers/www/images/*
%exclude %{_datadir}/historytracers/www/images/img_options.json

%files devel
%dir /usr/src/historytracers-%{version}
/usr/src/historytracers-%{version}/*

%changelog
* Sun Nov 02 2025 Thiago Marques <historytracers@gmail.com> - 1.0.0-1
- Initial package build
- Split into main, images, and devel subpackages
