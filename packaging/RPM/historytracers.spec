Name: historytracers
Version: 1.0.0
Release: 1%{?dist}
Summary: A free and open-source teaching tool
License: GPL-3.0-or-later
URL: https://historytracers.org/
Source0: %{name}-%{version}.tar.gz

BuildRequires: systemd-rpm-macros
BuildRequires: golang
BuildRequires: autoconf
BuildRequires: automake
BuildRequires: git

%package images
Summary: Images for History Tracers
BuildArch: noarch
Requires: historytracers = %{version}-%{release}

%description images
Additional images for the History Tracers teaching tool.
Provides the image files used by the viewer interface,
excluding the options configuration file.

%package devel
Summary: Development files for History Tracers
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
%setup -q -n %{name}-%{version}

%build
autoreconf -f -i
%configure \
  --disable-editor \
  --with-conf-path=%{_sysconfdir}/%{name}/historytracers.conf \
  --with-src-path=%{_datadir}/%{name}/ \
  --with-content-path=%{_datadir}/%{name}/www/ \
  --with-log-path=%{_localstatedir}/log/%{name}/
%make_build

%install
rm -rf %{buildroot}

# Create directory structure
mkdir -p %{buildroot}%{_bindir}
mkdir -p %{buildroot}%{_datadir}/%{name}/www/images
mkdir -p %{buildroot}%{_sysconfdir}/%{name}
mkdir -p %{buildroot}%{_unitdir}
mkdir -p %{buildroot}%{_localstatedir}/log/%{name}

# Install the systemd service file
install -m 644 packaging/service/historytracers.service %{buildroot}%{_unitdir}/historytracers.service

# Install the binary
install -m 755 build/historytracers %{buildroot}%{_bindir}/historytracers

# Install configuration file as .new (preserve user modifications on upgrade)
install -m 644 packaging/conf/historytracers.conf %{buildroot}%{_sysconfdir}/%{name}/historytracers.conf

# ===== MAIN PACKAGE: web content =====

# Install everything from www/ except the images/ directory
for item in www/*; do
  base=$(basename "$item")
  [ "$base" = "images" ] && continue
  cp -r "$item" %{buildroot}%{_datadir}/%{name}/www/
done

# Install only img_options.json from the images/ directory
install -m 644 www/images/img_options.json %{buildroot}%{_datadir}/%{name}/www/images/

# ===== IMAGES SUBPACKAGE: image files =====

# Install all image files/dirs except img_options.json and READMEs
for item in www/images/*; do
  base=$(basename "$item")
  case "$base" in img_options.json|README*|*.md) continue;; esac
  cp -r "$item" %{buildroot}%{_datadir}/%{name}/www/images/
done

# ===== DEVEL SUBPACKAGE: source files =====

mkdir -p %{buildroot}%{_prefix}/src/%{name}
for item in * .[!.]*; do
  [ -e "$item" ] || continue
  base=$(basename "$item")
  case "$base" in www|.git|build|packaging|debian) continue;; esac
  cp -r "$item" %{buildroot}%{_prefix}/src/%{name}/
done

%pre
# Only run user creation for the main package (not subpackages)
if [ $1 -eq 1 ]; then
  getent group historytracers >/dev/null || groupadd -r historytracers
  getent passwd historytracers >/dev/null || useradd -r -g historytracers -s /sbin/nologin \
      -d %{_datadir}/%{name} -c "History Tracers" historytracers
fi

%post
%systemd_post historytracers.service

%preun
%systemd_preun historytracers.service

%postun
%systemd_postun historytracers.service

%files
%license LICENSE
%doc README.md
%{_bindir}/historytracers
%{_unitdir}/historytracers.service
%dir %{_sysconfdir}/%{name}
%config(noreplace) %{_sysconfdir}/%{name}/historytracers.conf
%dir %{_localstatedir}/log/%{name}
%dir %{_datadir}/%{name}
%dir %{_datadir}/%{name}/www
%{_datadir}/%{name}/www/*
%exclude %{_datadir}/%{name}/www/images
%{_datadir}/%{name}/www/images/img_options.json

%files images
%dir %{_datadir}/%{name}
%dir %{_datadir}/%{name}/www
%dir %{_datadir}/%{name}/www/images
%{_datadir}/%{name}/www/images/*
%exclude %{_datadir}/%{name}/www/images/img_options.json

%files devel
%dir %{_prefix}/src/%{name}
%{_prefix}/src/%{name}/*

%changelog
* Sun Nov 02 2025 Thiago Marques <historytracers@gmail.com> - 1.0.0-1
- Initial package build
- Split into main, images, and devel subpackages
