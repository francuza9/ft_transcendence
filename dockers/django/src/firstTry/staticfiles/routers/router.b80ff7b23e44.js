document.addEventListener('DOMContentLoaded', function() {
    function attachLinkHandlers() {
        document.querySelectorAll('nav a, header a').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent default page load
                const url = link.href;
                console.log('Link clicked:', url);
                fetchPage(url);
                history.pushState(null, '', url); // Update the browser history
            });
        });
    }

    function fetchPage(url) {
        console.log('Fetching page:', url);
        fetch(url, { headers: { 'x-requested-with': 'XMLHttpRequest' } })
            .then(response => {
                console.log('Response received:', response);
                return response.text();
            })
            .then(html => {
                console.log('HTML received:', html);
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newContent = doc.querySelector('main');
                
                if (newContent) {
                    const content = newContent.innerHTML;
                    console.log('New content found:', content);
                    document.querySelector('main').innerHTML = content;
                    attachLinkHandlers(); // Reattach click event to new links
                    loadScripts(); // Load any new scripts
                } else {
                    console.error('No <main> element found in the fetched HTML.');
                }
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
            console.log('Script loaded:', script.src);
        });
    }

    window.addEventListener('popstate', function() {
        console.log('Popstate event:', location.href);
        fetchPage(location.href);
    });

    attachLinkHandlers(); // Initial attachment of handlers
    console.log('Link handlers attached');
});