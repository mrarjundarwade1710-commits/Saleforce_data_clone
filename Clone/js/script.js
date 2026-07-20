$(document).ready(function () {
    // This script handles shared website interactions for all pages.
    // It manages the mobile menu, active navigation highlighting, scroll effects,
    // dropdown behavior, animation reveals, form feedback, and dashboard chart updates.
    const $body = $('body');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const primaryNav = $body.data('primary-nav');
    const subNav = $body.data('sub-nav');
    const header = document.querySelector('.site-header');
    const backToTop = $('#back-to-top');
    const isHomePage = $body.hasClass('page-home');
    const root = document.documentElement;
    const premiumDropdowns = document.querySelectorAll('.premium-dropdown');
    let mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    let mobileNavDrawer = document.getElementById('mobileNavDrawer');
    let mobileNavBackdrop = document.querySelector('.mobile-nav-backdrop');

    // Create a mobile-friendly navigation drawer when the screen is small.
    // This keeps the same page links available on phones without changing the desktop layout.
    const createResponsiveMobileNav = () => {
        if (mobileMenuToggle && mobileNavDrawer && mobileNavBackdrop) {
            return;
        }

        if (document.querySelector('.mobile-nav-toggle-bar') || document.querySelector('.page-home .premium-mobile-bar')) {
            return;
        }

        const mobileBar = document.createElement('div');
        mobileBar.className = 'mobile-nav-toggle-bar';

        const brandLink = document.querySelector('.product-nav-brand, .site-brand, .navbar-brand');
        const brandText = document.body.dataset.mobileBrand || (document.querySelector('.product-nav-brand') ? 'Data 360' : 'Salesforce');
        const brandHref = brandLink && brandLink.getAttribute('href') ? brandLink.getAttribute('href') : 'index.html';

        mobileBar.innerHTML = `
            <a class="mobile-nav-brand" href="${brandHref}">${brandText}</a>
            <button class="mobile-menu-toggle" type="button" aria-controls="mobileNavDrawer" aria-expanded="false" aria-label="Toggle navigation menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        `;

        document.body.insertBefore(mobileBar, document.body.firstChild);

        const backdrop = document.createElement('div');
        backdrop.className = 'mobile-nav-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');
        document.body.appendChild(backdrop);

        const drawer = document.createElement('aside');
        drawer.className = 'mobile-nav-drawer';
        drawer.id = 'mobileNavDrawer';
        drawer.setAttribute('aria-hidden', 'true');

        const navItems = [];
        const seenLinks = new Set();
        document.querySelectorAll('.global-nav a[href], .product-nav a[href], .product-nav-link[href], .global-nav .dropdown-item[href]').forEach(link => {
            const href = link.getAttribute('href');
            const label = link.textContent.trim();
            if (!href || href === '#' || href.startsWith('javascript:') || seenLinks.has(href) || !label) {
                return;
            }
            seenLinks.add(href);
            navItems.push({ href, label });
        });

        const ctaLink = document.querySelector('.header-cta, .product-nav-cta, .btn-sf-green');
        const ctaHref = ctaLink && ctaLink.getAttribute('href') ? ctaLink.getAttribute('href') : 'contact.html';
        const ctaLabel = ctaLink ? ctaLink.textContent.trim() : 'Contact us';

        drawer.innerHTML = `
            <div class="mobile-drawer-shell">
                <div class="mobile-drawer-top">
                    <span class="mobile-drawer-eyebrow">Navigate</span>
                    <h2>${brandText}</h2>
                    <p>Browse the site quickly with the same sections and actions from the desktop experience.</p>
                </div>
                <div class="mobile-nav-section">
                    <span class="mobile-nav-section-title">Main menu</span>
                    ${navItems.map(item => `<a class="mobile-nav-link" href="${item.href}">${item.label}</a>`).join('')}
                </div>
                <div class="mobile-nav-actions">
                    <a class="mobile-nav-link mobile-utility-link" href="${ctaHref}">${ctaLabel}</a>
                    <a class="mobile-nav-link mobile-login-link" href="login.html">Login</a>
                </div>
            </div>
        `;

        document.body.appendChild(drawer);

        mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        mobileNavDrawer = document.getElementById('mobileNavDrawer');
        mobileNavBackdrop = document.querySelector('.mobile-nav-backdrop');
    };

    createResponsiveMobileNav();

    // Adjust the home page header spacing based on the visible navigation bars.
    // This prevents the hero content from appearing underneath the top announcement or menu areas.
    const syncHomeHeaderOffset = () => {
        if (!isHomePage) {
            return;
        }

        const announcementBar = document.querySelector('.page-home .home-alert-bar');
        const desktopGlobalNav = document.querySelector('.page-home .global-nav');
        const productNav = document.querySelector('.page-home .product-nav');
        const mobileBar = document.querySelector('.page-home .premium-mobile-bar');
        const announcementHeight = announcementBar ? announcementBar.offsetHeight : 0;

        root.style.setProperty('--announcement-height', announcementHeight + 'px');
        root.style.setProperty('--page-home-global-top', announcementHeight + 'px');
        root.style.setProperty('--page-home-mobile-top', announcementHeight + 'px');

        if (window.innerWidth < 992) {
            const mobileHeight = mobileBar ? mobileBar.offsetHeight : 0;
            root.style.setProperty('--mobile-bar-height', mobileHeight + 'px');
            root.style.setProperty('--page-home-header-offset', announcementHeight + mobileHeight + 'px');
            return;
        }

        const globalHeight = desktopGlobalNav ? desktopGlobalNav.offsetHeight : 0;
        const productHeight = productNav ? productNav.offsetHeight : 0;
        root.style.setProperty('--desktop-global-height', globalHeight + 'px');
        root.style.setProperty('--desktop-product-height', productHeight + 'px');
        root.style.setProperty('--page-home-product-top', announcementHeight + globalHeight + 'px');
        root.style.setProperty('--page-home-header-offset', announcementHeight + globalHeight + productHeight + 'px');
    };

    // Open or close the slide-in mobile drawer and update accessibility attributes.
    const setMobileNavState = (isOpen) => {
        if (!mobileNavDrawer || !mobileMenuToggle) {
            return;
        }

        document.body.classList.toggle('mobile-nav-open', isOpen);
        mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
        mobileNavDrawer.setAttribute('aria-hidden', String(!isOpen));
        if (mobileNavBackdrop) {
            mobileNavBackdrop.setAttribute('aria-hidden', String(!isOpen));
        }
    };

    // Hide the page loader after a short delay so the content appears smoothly.
    if ($('#loader-wrapper').length) {
        setTimeout(function () {
            $('#loader-wrapper').css({
                opacity: '0',
                visibility: 'hidden'
            });
        }, 450);
    }

    // Highlight the current page in the navigation when the page uses data-driven nav markup.
    const applyDataNavState = () => {
        if (primaryNav) {
            $('[data-nav-group]').removeClass('active');
            $('[data-nav-group="' + primaryNav + '"]').addClass('active');
        }

        if (subNav) {
            $('[data-subnav]').removeClass('active');
            $('[data-subnav="' + subNav + '"]').addClass('active');
        }
    };

    // Support older navigation markup by manually marking the active link for the current page.
    const applyLegacyNavState = () => {
        $('.product-nav .sf-nav-link, .global-nav .sf-nav-link, .global-nav .dropdown-item').removeClass('active');

        const highlightLegacyGroup = (selector, groupLabel, page) => {
            const $root = $(selector);
            $root.find('.dropdown-toggle, .top-nav-link').filter(function () {
                return $(this).text().trim() === groupLabel;
            }).addClass('active');

            $root.find('.dropdown-item[href="' + page + '"], .sf-nav-link[href="' + page + '"]').addClass('active');
        };

        if (['index.html', 'products.html', 'services.html', 'ai-insights.html'].indexOf(currentPath) > -1) {
            highlightLegacyGroup('.global-nav', 'Products', currentPath);
        } else if (currentPath.indexOf('industries.html') === 0) {
            highlightLegacyGroup('.global-nav', 'Industries', currentPath);
        } else if (['use-cases.html', 'dashboard.html'].indexOf(currentPath) > -1) {
            highlightLegacyGroup('.global-nav', 'Customers', currentPath);
        } else if (['learning.html'].indexOf(currentPath) > -1) {
            highlightLegacyGroup('.global-nav', 'Learning', currentPath);
        } else if (['support.html', 'contact.html'].indexOf(currentPath) > -1) {
            highlightLegacyGroup('.global-nav', 'Support', currentPath);
        } else if (['about.html'].indexOf(currentPath) > -1) {
            $('.global-nav .sf-nav-link[href="about.html"]').addClass('active');
        }

        $('.product-nav .sf-nav-link[href="' + currentPath + '"]').addClass('active');
    };

    if (primaryNav || subNav) {
        applyDataNavState();
    } else {
        applyLegacyNavState();
    }

    const updateHeaderState = () => {
        if (header) {
            header.classList.toggle('is-scrolled', window.scrollY > 8);
        }

        if (backToTop.length) {
            if (window.scrollY > 320) {
                backToTop.css('display', 'flex');
            } else {
                backToTop.css('display', 'none');
            }
        }
    };

    updateHeaderState();
    syncHomeHeaderOffset();
    $(window).on('scroll', updateHeaderState);
    $(window).on('resize', syncHomeHeaderOffset);
    $(window).on('load', syncHomeHeaderOffset);

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(syncHomeHeaderOffset).catch(function () {
            return null;
        });
    }

    if (backToTop.length) {
        backToTop.on('click', function () {
            $('html, body').animate({ scrollTop: 0 }, 500);
            return false;
        });
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, revealObserver) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.18 });

        $('.fade-in-section').each(function () {
            observer.observe(this);
        });
    } else {
        $('.fade-in-section').addClass('is-visible');
    }

    if ($body.hasClass('page-home')) {
        $('.page-home .fade-in-section').addClass('is-visible');
    }

    // Animate the counter values when the user scrolls to the section.
    const startCounters = () => {
        $('.counter-value').each(function () {
            const $counter = $(this);
            const countTo = Number($counter.attr('data-count'));

            $({ countNum: 0 }).animate({
                countNum: countTo
            }, {
                duration: 1500,
                easing: 'swing',
                step: function () {
                    $counter.text(Math.floor(this.countNum));
                },
                complete: function () {
                    $counter.text(this.countNum);
                }
            });
        });
    };

    if ($('.counter-value').length) {
        if ('IntersectionObserver' in window) {
            const counterTarget = document.querySelector('.counter-value');
            const counterSection = counterTarget ? counterTarget.closest('section') : null;

            if (counterSection) {
                const counterObserver = new IntersectionObserver((entries, revealObserver) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            startCounters();
                            revealObserver.disconnect();
                        }
                    });
                }, { threshold: 0.4 });

                counterObserver.observe(counterSection);
            }
        } else {
            startCounters();
        }
    }

    const mobileBreakpoint = window.matchMedia('(max-width: 991.98px)');

    // Close any open premium dropdown menus when the user clicks elsewhere.
    const closeAllDropdowns = () => {
        premiumDropdowns.forEach(dropdown => {
            dropdown.classList.remove('is-open');
            const toggle = dropdown.querySelector('.premium-nav-toggle');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    };

    premiumDropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.premium-nav-toggle');

        if (!toggle) {
            return;
        }

        const openDropdown = () => {
            closeAllDropdowns();
            dropdown.classList.add('is-open');
            toggle.setAttribute('aria-expanded', 'true');
        };

        const closeDropdown = () => {
            dropdown.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        };

        toggle.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (dropdown.classList.contains('is-open')) {
                closeDropdown();
            } else {
                openDropdown();
            }
        });

        dropdown.addEventListener('mouseenter', openDropdown);
        dropdown.addEventListener('mouseleave', closeDropdown);
        dropdown.addEventListener('focusin', openDropdown);
        dropdown.addEventListener('focusout', event => {
            if (!dropdown.contains(event.relatedTarget)) {
                closeDropdown();
            }
        });
    });

    // Manage the mobile drawer open/close actions and close it on Escape or screen resize.
    if (mobileMenuToggle && mobileNavDrawer) {
        mobileMenuToggle.addEventListener('click', function () {
            setMobileNavState(!document.body.classList.contains('mobile-nav-open'));
        });

        if (mobileNavBackdrop) {
            mobileNavBackdrop.addEventListener('click', function () {
                setMobileNavState(false);
            });
        }

        mobileNavDrawer.querySelectorAll('a[href]').forEach(link => {
            link.addEventListener('click', function () {
                setMobileNavState(false);
            });
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                setMobileNavState(false);
                closeAllDropdowns();
            }
        });

        const handleBreakpointChange = event => {
            if (!event.matches) {
                setMobileNavState(false);
            }
            syncHomeHeaderOffset();
        };

        if (typeof mobileBreakpoint.addEventListener === 'function') {
            mobileBreakpoint.addEventListener('change', handleBreakpointChange);
        } else if (typeof mobileBreakpoint.addListener === 'function') {
            mobileBreakpoint.addListener(handleBreakpointChange);
        }
    }

    document.addEventListener('click', function (event) {
        if (!event.target.closest('.premium-dropdown')) {
            closeAllDropdowns();
        }
    });

    $('.top-nav-link[data-bs-toggle="dropdown"]').on('click', function (event) {
        if (mobileBreakpoint.matches) {
            event.preventDefault();
        }
    });

    $('.navbar-collapse a[href]').on('click', function () {
        if (!mobileBreakpoint.matches) {
            return;
        }

        const href = $(this).attr('href');
        const isDropdownToggle = $(this).attr('data-bs-toggle') === 'dropdown';

        if (isDropdownToggle || !href || href === '#') {
            return;
        }

        $('.navbar-collapse').collapse('hide');
    });

    // Filter portfolio or content cards when a category button is clicked.
    $('.filter-btn').on('click', function () {
        const category = $(this).attr('data-filter');
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');

        if (category === 'all') {
            $('.filter-item').fadeIn(400);
        } else {
            $('.filter-item').hide();
            $('.' + category).fadeIn(400);
        }
    });

    // Handle the contact form submission with a simple success message and loading state.
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (!contactForm.checkValidity()) {
                contactForm.classList.add('was-validated');
                return;
            }

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Sending Request...';
            submitBtn.disabled = true;

            setTimeout(() => {
                $('#formSuccessMessage').removeClass('d-none');
                contactForm.reset();
                contactForm.classList.remove('was-validated');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                setTimeout(() => {
                    $('#formSuccessMessage').addClass('d-none');
                }, 5000);
            }, 1200);
        });
    }

    // Render the dashboard chart if Chart.js is available on the page.
    const canvas = document.getElementById('revenueChart');
    if (canvas && typeof Chart !== 'undefined') {
        const ctx = canvas.getContext('2d');
        const revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25'],
                datasets: [{
                    label: 'Real-time Transactions ($)',
                    data: [12400, 19500, 15100, 25200, 22100, 29800],
                    borderColor: '#0176d3',
                    backgroundColor: 'rgba(1, 118, 211, 0.05)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#e5e5e5' },
                        ticks: { color: '#5c5c5c' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#5c5c5c' }
                    }
                }
            }
        });

        setInterval(() => {
            const value = Math.floor(Math.random() * (35000 - 10000) + 10000);
            revenueChart.data.datasets[0].data.shift();
            revenueChart.data.datasets[0].data.push(value);
            revenueChart.update();

            const scoreValue = Math.floor(Math.random() * (99 - 92) + 92);
            $('#dataScoreMeter').text(scoreValue + '%');
        }, 3000);
    }
});

