document.addEventListener('DOMContentLoaded', function() {
    function attachLinkHandlers() {
        document.querySelectorAll('nav a, header a').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent default page load
                const url = link.href;
                fetchPage(url);
                history.pushState(null, '', url); // Update the browser history
            });
        });
    }

    function fetchPage(url) {
        fetch(url, { headers: { 'x-requested-with': 'XMLHttpRequest' } })
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const content = doc.querySelector('main').innerHTML;
                document.querySelector('main').innerHTML = content;
                attachLinkHandlers(); // Reattach click event to new links
                loadScripts(); // Load any new scripts
            })
            .catch(error => console.error('Error fetching page:', error));
    }

    function loadScripts() {
        const scripts = document.querySelectorAll('main script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.type = script.type;
            newScript.src = script.src;
            document.body.appendChild(newScript);
        });
    }

    window.addEventListener('popstate', function() {
        fetchPage(location.href);
    });

    attachLinkHandlers(); // Initial attachment of handlers
});