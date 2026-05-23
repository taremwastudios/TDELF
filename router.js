// Route mapping from clean URLs to HTML files
const routes = {
    '/': 'index.html',
    '/home': 'index.html',
    '/support': 'support.html',
    '/about': 'about.html',
    '/e-tdelf': 'e-tdelf.html',
    '/meet': 'meet.html',
    '/learn': 'learn.html',
    '/products': 'products.html',
    '/admin': 'admin.html',
    '/settings': 'settings.html'
};

// Initialize router
function initRouter() {
    // Handle initial page load
    handleRoute();
    
    // Handle browser back/forward
    window.addEventListener('popstate', handleRoute);
    
    // Handle link clicks
    document.addEventListener('click', handleLinkClick);
}

// Handle route changes
function handleRoute() {
    const path = window.location.pathname;
    const normalizedPath = path === '/' ? '/home' : path;
    
    // Find the corresponding HTML file
    const htmlFile = routes[normalizedPath];
    
    if (htmlFile) {
        loadPage(htmlFile, normalizedPath);
    } else {
        // If route not found, redirect to home
        window.history.pushState(null, '', '/home');
        loadPage('index.html', '/home');
    }
}

// Load page content
function loadPage(file, path) {
    fetch(file)
        .then(response => {
            if (!response.ok) throw new Error('Page not found');
            return response.text();
        })
        .then(html => {
            // Parse the fetched HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract title and main content
            const title = doc.querySelector('title');
            const main = doc.querySelector('main');
            const header = doc.querySelector('header');
            
            // Update page title
            if (title) {
                document.title = title.textContent;
            }
            
            // Update main content
            if (main) {
                const currentMain = document.querySelector('main');
                if (currentMain) {
                    currentMain.innerHTML = main.innerHTML;
                }
            }
            
            // Update header with fresh navigation (to ensure links work)
            if (header) {
                const currentHeader = document.querySelector('header');
                if (currentHeader) {
                    currentHeader.innerHTML = header.innerHTML;
                    // Re-attach event listeners to new links and hamburger toggle
                    attachLinkListeners();
                }
            }

            // Close mobile nav on page change
            const openNav = document.getElementById('mobileNav');
            const toggleBtn = document.getElementById('navToggle');
            if (openNav && openNav.classList.contains('open')) {
                openNav.classList.remove('open');
                if (toggleBtn) toggleBtn.classList.remove('active');
            }

            // Run post-page-load hooks (e.g. settings/theme init)
            if (typeof window.__onPageLoaded === 'function') {
                window.__onPageLoaded();
            }

            // Scroll to top
            window.scrollTo(0, 0);
        })
        .catch(error => {
            console.error('Error loading page:', error);
            document.querySelector('main').innerHTML = '<p>Error loading page</p>';
        });
}

// Handle link clicks
function handleLinkClick(e) {
    const link = e.target.closest('a');
    
    if (!link) return;
    
    const href = link.getAttribute('href');
    
    // Skip external links, anchors, and file links (like PDFs, images, etc.)
    if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#') || 
        /\.(pdf|jpg|jpeg|png|gif|doc|docx|xls|xlsx|txt|zip)$/i.test(href)) {
        return;
    }
    
    // Convert .html file links to clean URLs
    let path = href;
    Object.entries(routes).forEach(([cleanPath, file]) => {
        if (href === file) {
            path = cleanPath;
        }
    });
    
    // Prevent default and handle navigation
    e.preventDefault();
    
    // Update URL and load page
    if (window.location.pathname !== path) {
        window.history.pushState(null, '', path);
        handleRoute();
    }
}

// Toggle mobile nav dropdown
function toggleNav() {
    const nav = document.getElementById('mobileNav');
    const btn = document.getElementById('navToggle');
    if (!nav || !btn) return;
    nav.classList.toggle('open');
    btn.classList.toggle('active');
}

// Attach click listeners to nav links and the hamburger toggle
function attachLinkListeners() {
    document.querySelectorAll('.mobile-nav a, nav a').forEach(link => {
        link.addEventListener('click', handleLinkClick);
    });

    const toggle = document.getElementById('navToggle');
    if (toggle) {
        toggle.addEventListener('click', toggleNav);
    }
}

// Start router when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRouter);
} else {
    initRouter();
}
