$(document).ready(function () {
    const $body = $('body');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const primaryNav = $body.data('primary-nav');
    const subNav = $body.data('sub-nav');
    const header = document.querySelector('.site-header');
    const backToTop = $('#back-to-top');

    if ($('#loader-wrapper').length) {
        setTimeout(function () {
            $('#loader-wrapper').css({
                opacity: '0',
                visibility: 'hidden'
            });
        }, 450);
    }

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
    $(window).on('scroll', updateHeaderState);

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
