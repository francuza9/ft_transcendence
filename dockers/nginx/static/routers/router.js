import { Pong } from '../views/pong_view.js';
import { Home } from '../views/home.js';
import { Register } from '../views/register.js';

/* const router = [
	// { path: undefined, 		component: Error404 },
	{ path: "/",			component: Home },
	{ path: "/pong",		component: Pong },
	// { path: "/login",		component: Login },
	{ path: "/register",	component: Register },
]; */

const router = [
    { path: /^\/$/, component: Home },
    { path: /^\/pong\/(\d+)$/, component: Pong }, // Match paths like /pong/1, /pong/2, etc.
    { path: /^\/register$/, component: Register },
];

// Select the content container
const content = document.getElementById("body-content");

// Function to find the route based on the path
/* const findRoute = (path) => {
    return router.find(route => route.path === path) || router.find(route => route.path === undefined);
}; */

const findRoute = (path) => {
    for (const route of router) {
        const match = path.match(route.path);
        if (match) {
            return { component: route.component, params: match.slice(1) }; // Pass matched params
        }
    }
    return { component: () => document.createTextNode('404 Not Found') }; // Handle undefined routes
};

// Function to load the component
/* const loadComponent = (component) => {
    // Clear the current content
    content.innerHTML = '';
    // Render the new component
    content.appendChild(component());
}; */

const loadComponent = (component, params) => {
    // Clear the current content
    content.innerHTML = '';
    // Render the new component
    content.appendChild(component(params));
};

// Function to handle routing
/* const handleRouting = () => {
    const path = window.location.pathname;
    const route = findRoute(path);
    loadComponent(route.component);
}; */
const handleRouting = () => {
    const path = window.location.pathname;
    const { component, params } = findRoute(path);
    loadComponent(component, params);
};

// Event listener for URL changes
window.addEventListener('popstate', handleRouting);

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    handleRouting();
    // Handle clicks on links
    document.body.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.href.startsWith(window.location.origin)) {
            e.preventDefault();
            history.pushState(null, '', e.target.href);
            handleRouting();
        }
    });
});
