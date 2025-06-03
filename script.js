document.addEventListener('DOMContentLoaded', () => {
    // --- Supabase Auth ---
    const SUPABASE_URL = 'https://crwgwyrctanosjdwnigz.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyd2d3eXJjdGFub3NqZHduaWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTg3NTUsImV4cCI6MjA2NDM3NDc1NX0.DUCbTzX5XdC28jE71GoY51lEl76bMgo4QFbJV4R0aXU';

    let supabaseClient; // Renamed to avoid confusion with the global Supabase object
    try {
        // The Supabase CDN script makes 'supabase' available globally.
        // We access its 'createClient' method.
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            throw new Error('Supabase client library not found. Make sure the CDN link is correct in index.html.');
        }
    } catch (error) {
        console.error("Error initializing Supabase client:", error);
        // Display a user-friendly error message on the page if Supabase fails to initialize
        const authContainer = document.getElementById('auth-container');
        if (authContainer) {
            authContainer.innerHTML = '<p class="text-red-500">Error connecting to authentication service.</p>';
        }
        // Optionally, disable features that depend on Supabase
        return; // Stop further script execution if Supabase is critical
    }

    const authContainer = document.getElementById('auth-container');
    const userGreetingElement = document.getElementById('user-greeting');

    async function signInWithGoogle() {
        try {
            const { error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) {
                console.error('Error signing in with Google:', error.message);
                // Display error to user in authContainer or via a notification
                if (authContainer) authContainer.innerHTML = `<p class="text-red-500 text-sm">Login failed: ${error.message}</p>`;
            }
        } catch (error) {
            console.error('Unexpected error during Google sign-in:', error);
            if (authContainer) authContainer.innerHTML = `<p class="text-red-500 text-sm">An unexpected error occurred.</p>`;
        }
    }

    async function signOutUser() {
        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) {
                console.error('Error signing out:', error.message);
                // Optionally, display error to user
            }
            // UI will be updated by onAuthStateChange
        } catch (error) {
            console.error('Unexpected error during sign-out:', error);
        }
    }

    function updateAuthUI(user) {
        if (!authContainer || !userGreetingElement) {
            console.warn('Auth UI elements not found.');
            return;
        }

        if (user) {
            // User is logged in
            const displayName = user.user_metadata?.full_name || user.email;
            const avatarUrl = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=random&color=fff`;

            authContainer.innerHTML = `
                <div class="text-right">
                    <p class="text-sm font-medium text-gray-700 truncate" title="${displayName}">${displayName}</p>
                    ${user.email ? `<p class="text-xs text-gray-500 font-light truncate" title="${user.email}">${user.email}</p>` : ''}
                </div>
                <img class="h-9 w-9 rounded-full object-cover shadow-sm" src="${avatarUrl}" alt="User Avatar">
                <button id="logout-button" type="button" class="px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                    Logout
                </button>
            `;
            userGreetingElement.textContent = `Hello ${user.user_metadata?.full_name || user.email.split('@')[0]}`;

            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) {
                logoutButton.addEventListener('click', signOutUser);
            }
        } else {
            // User is logged out
            authContainer.innerHTML = `
                <button id="login-google-button" type="button" class="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors flex items-center space-x-2">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l0.002-0.002l6.19,5.238C39.908,34.42,44,28.718,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
                    <span>Login with Google</span>
                </button>
            `;
            userGreetingElement.textContent = 'Hello Guest';

            const loginButton = document.getElementById('login-google-button');
            if (loginButton) {
                loginButton.addEventListener('click', signInWithGoogle);
            }
        }
    }

    // Listen for authentication state changes
    if (supabaseClient) {
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            // console.log('Auth event:', event, session);
            updateAuthUI(session?.user ?? null);
        });
    }


    // Check initial session
    async function checkInitialSession() {
        if (!supabaseClient) return; // Don't run if client failed to initialize
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            updateAuthUI(session?.user ?? null);
        } catch (error) {
            console.error("Error getting initial session:", error);
            updateAuthUI(null); // Default to logged-out state on error
        }
    }
    checkInitialSession();

    // --- End Supabase Auth ---


    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const viewSections = document.querySelectorAll('.view-section');
    const symptomForm = document.getElementById('symptom-form');
    const symptomInput = document.getElementById('symptom-input');
    const initialView = document.getElementById('initial-view');
    const outputArea = document.getElementById('output-area');
    const resultsContainer = document.getElementById('results-container');
    const noResultsMessage = document.getElementById('no-results-message');

    // Sidebar Elements
    const leftSidebar = document.getElementById('left-sidebar');
    const burgerMenuButton = document.getElementById('burger-menu-button');
    const closeSidebarButton = document.getElementById('close-sidebar-button');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    // Upgrade to PRO card elements
    const upgradeProCardContainer = document.getElementById('upgrade-pro-card-container');
    const closeUpgradeProButton = document.getElementById('close-upgrade-pro-button');

    function openSidebar() {
        if (leftSidebar && burgerMenuButton && sidebarOverlay) {
            leftSidebar.classList.add('sidebar-open'); // For CSS to apply transform: translateX(0)
            leftSidebar.classList.remove('-translate-x-full'); // Ensure it's visible
            leftSidebar.classList.add('translate-x-0');
            sidebarOverlay.classList.remove('hidden');
            burgerMenuButton.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden'; // Prevent scrolling of main content
        }
    }

    function closeSidebar() {
        if (leftSidebar && burgerMenuButton && sidebarOverlay) {
            leftSidebar.classList.remove('sidebar-open');
            leftSidebar.classList.add('-translate-x-full');
            leftSidebar.classList.remove('translate-x-0');
            sidebarOverlay.classList.add('hidden');
            burgerMenuButton.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    if (burgerMenuButton) {
        burgerMenuButton.addEventListener('click', openSidebar);
    }

    if (closeSidebarButton) {
        closeSidebarButton.addEventListener('click', closeSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Close "Upgrade to PRO" card
    if (closeUpgradeProButton && upgradeProCardContainer) {
        closeUpgradeProButton.addEventListener('click', () => {
            upgradeProCardContainer.classList.add('hidden');
        });
    }

    // 1. Sidebar Navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('active-link'));
            // Add active class to the clicked link
            link.classList.add('active-link');

            const targetViewId = link.dataset.view + '-view';

            // Hide all view sections
            viewSections.forEach(section => {
                section.classList.add('hidden');
            });

            // Show the target view section
            const targetView = document.getElementById(targetViewId);
            if (targetView) {
                targetView.classList.remove('hidden');
            } else {
                console.warn(`View section with ID ${targetViewId} not found.`);
                // Show default view if target not found
                document.getElementById('symptom-checker-view')?.classList.remove('hidden');
                document.getElementById('initial-view')?.classList.remove('hidden');
                document.getElementById('output-area')?.classList.add('hidden');

            }

            // If navigating back to symptom checker, reset to initial view if no results are shown
            if (targetViewId === 'symptom-checker-view' && outputArea.classList.contains('hidden')) {
                initialView.classList.remove('hidden');
            }

            // Always close sidebar on link click, as it's now always an overlay
            if (leftSidebar && leftSidebar.classList.contains('sidebar-open')) {
                closeSidebar();
            }
        });
    });

    // Set default active link and view
    const defaultActiveLink = document.querySelector('.sidebar-link[data-view="symptom-checker"]');
    if (defaultActiveLink) {
        defaultActiveLink.classList.add('active-link');
        document.getElementById('symptom-checker-view')?.classList.remove('hidden');
        initialView?.classList.remove('hidden'); // Ensure initial view is shown by default
    }


    // 2. Symptom Submission (Mock)
    if (symptomForm) {
        symptomForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const symptoms = symptomInput.value.trim();

            if (symptoms === '') {
                // Optionally, show an error or do nothing if input is empty
                symptomInput.focus();
                return;
            }

            // Clear the input field
            symptomInput.value = '';

            // Hide initial view
            if (initialView) {
                initialView.classList.add('hidden');
            }

            // Show output area and clear previous results
            if (outputArea) {
                outputArea.classList.remove('hidden');
            }
            if (resultsContainer) {
                resultsContainer.innerHTML = ''; // Clear previous results
            }
            if (noResultsMessage) {
                noResultsMessage.classList.add('hidden');
            }


            // Simulate API call & display mock results
            displayMockResults(symptoms);
        });
    }

    function displayMockResults(symptoms) {
        // Simple mock logic based on keywords
        const conditions = [];
        const lowerSymptoms = symptoms.toLowerCase();

        if (lowerSymptoms.includes('fever') || lowerSymptoms.includes('cough') || lowerSymptoms.includes('sore throat')) {
            conditions.push({
                name: "Common Cold",
                confidence: "85%",
                explanation: `Based on your symptoms of ${symptoms}. Common indicators include fever, cough, and sore throat.`,
                disclaimer: "This is not a medical diagnosis. Consult a healthcare professional."
            });
        }
        if (lowerSymptoms.includes('headache') && (lowerSymptoms.includes('fatigue') || lowerSymptoms.includes('tired'))) {
            conditions.push({
                name: "Tension Headache / Fatigue",
                confidence: "75%",
                explanation: `Symptoms like ${symptoms} can be associated with tension headaches and general fatigue.`,
                disclaimer: "This is not a medical diagnosis. Consult a healthcare professional."
            });
        }
        if (lowerSymptoms.includes('stomach') || lowerSymptoms.includes('nausea') || lowerSymptoms.includes('pain')) {
            conditions.push({
                name: "Possible Digestive Upset",
                confidence: "70%",
                explanation: `Your description of ${symptoms} may indicate a digestive issue.`,
                disclaimer: "This is not a medical diagnosis. Consult a healthcare professional."
            });
        }
         if (lowerSymptoms.includes('rash') || lowerSymptoms.includes('itchy')) {
            conditions.push({
                name: "Potential Allergic Reaction or Skin Condition",
                confidence: "65%",
                explanation: `Symptoms like ${symptoms} could suggest an allergic reaction or a dermatological issue.`,
                disclaimer: "This is not a medical diagnosis. Consult a healthcare professional."
            });
        }


        if (conditions.length > 0) {
            conditions.forEach(condition => {
                const card = createResultCard(condition);
                resultsContainer.appendChild(card);
            });
            noResultsMessage.classList.add('hidden');
        } else {
            noResultsMessage.classList.remove('hidden');
        }
    }

    function createResultCard(condition) {
        const card = document.createElement('div');
        card.className = 'result-card'; // Using class from style.css

        card.innerHTML = `
            <div class="flex justify-between items-start">
                <h3>${condition.name}</h3>
                <span class="confidence-tag">Confidence: ${condition.confidence}</span>
            </div>
            <p class="explanation-text">${condition.explanation}</p>
            <p class="disclaimer-text">${condition.disclaimer}</p>
        `;
        return card;
    }

    // Ensure the symptom checker view is active by default
    const symptomCheckerLink = document.querySelector('.sidebar-link[data-view="symptom-checker"]');
    if (symptomCheckerLink) {
        symptomCheckerLink.click(); // Simulate a click to set the initial state correctly
    }
});