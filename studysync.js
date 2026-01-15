// ===== Mobile Menu Toggle =====
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
        });

        // Close menu when a link is clicked
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
            });
        });
    }

    // Set active nav link based on current page
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPage.includes(href.replace('.html', '')) || 
            (href === './studysync.html' && currentPage.endsWith('/'))) {
            link.classList.add('active');
        }
    });

    // Initialize auth and notification system
    initAuthSystem();
    initNotificationPanel();
    renderWeeklyProgress();
});

// ===== Authentication System =====
class AuthManager {
    constructor() {
        this.currentUser = this.loadUser();
        this.notifications = [
            { id: 1, title: '🎯 Study Goal Achieved', message: 'You completed your weekly study goal!', time: '2 hours ago' },
            { id: 2, title: '📈 Progress Update', message: 'Your performance improved by 15%', time: '5 hours ago' },
            { id: 3, title: '👥 Group Invitation', message: 'John invited you to Physics Study Group', time: '1 day ago' },
        ];
    }

    loadUser() {
        const user = localStorage.getItem('studysync_user');
        return user ? JSON.parse(user) : null;
    }

    saveUser(user) {
        localStorage.setItem('studysync_user', JSON.stringify(user));
        this.currentUser = user;
        this.updateUIForLoggedInUser();
    }

    register(name, email, password) {
        // Simple validation
        if (!name || !email || !password) {
            return { success: false, error: 'All fields are required' };
        }

        if (password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters' };
        }

        // Check if email already exists (in real app, this would be backend validation)
        const existingUser = this.getUserByEmail(email);
        if (existingUser) {
            return { success: false, error: 'Email already registered' };
        }

        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: btoa(password), // Simple base64 encoding (NOT for production)
            registeredAt: new Date().toISOString(),
            progress: {
                completedTasks: 0,
                totalTasks: 0,
                studyStreak: 0,
                avgScore: 0
            }
        };

        this.saveUser(newUser);
        return { success: true, message: 'Account created successfully!' };
    }

    login(email, password) {
        if (!email || !password) {
            return { success: false, error: 'Email and password are required' };
        }

        const user = this.getUserByEmail(email);
        
        if (!user) {
            return { success: false, error: 'Email not found' };
        }

        // Simple comparison (NOT for production)
        if (user.password !== btoa(password)) {
            return { success: false, error: 'Incorrect password' };
        }

        this.saveUser(user);
        return { success: true, message: 'Login successful!' };
    }

    getUserByEmail(email) {
        // Check localStorage for any saved users
        const user = localStorage.getItem('studysync_user');
        if (user) {
            const userData = JSON.parse(user);
            if (userData.email === email) {
                return userData;
            }
        }
        return null;
    }

    logout() {
        localStorage.removeItem('studysync_user');
        this.currentUser = null;
        this.updateUIForLoggedInUser();
    }

    updateUIForLoggedInUser() {
        const profileBtn = document.getElementById('profile-btn');
        if (!profileBtn) return;

        // Always show just the icon without letter
        profileBtn.innerHTML = '<span class="text-lg">👤</span>';
    }
}

const authManager = new AuthManager();

function initAuthSystem() {
    const profileBtn = document.getElementById('profile-btn');
    const notificationBtn = document.getElementById('notification-btn');
    const authModal = document.getElementById('auth-modal');
    const toggleFormBtn = document.getElementById('toggle-form-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            if (authManager.currentUser) {
                // Go to profile page
                window.location.href = './src/pages/profile.html';
            } else {
                // Show auth modal
                showAuthModal('login');
            }
        });
    }

    if (toggleFormBtn) {
        toggleFormBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleAuthForms();
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            const result = authManager.login(email, password);
            if (result.success) {
                alert(result.message);
                closeAuthModal();
                loginForm.reset();
                // Optionally redirect to profile
                setTimeout(() => {
                    window.location.href = './src/pages/profile.html';
                }, 500);
            } else {
                alert(result.error);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirm = document.getElementById('register-confirm').value;

            if (password !== confirm) {
                alert('Passwords do not match');
                return;
            }

            const result = authManager.register(name, email, password);
            if (result.success) {
                alert(result.message);
                closeAuthModal();
                setTimeout(() => {
                    window.location.href = './src/pages/profile.html';
                }, 500);
            } else {
                alert(result.error);
            }
        });
    }

    // Update UI based on current login status
    authManager.updateUIForLoggedInUser();
}

function showAuthModal(mode = 'login') {
    const authModal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (mode === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        document.getElementById('auth-title').textContent = 'Welcome to StudySync';
        document.getElementById('toggle-text').textContent = "Don't have an account?";
        document.getElementById('toggle-form-btn').textContent = 'Sign up';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        document.getElementById('auth-title').textContent = 'Create Your Account';
        document.getElementById('toggle-text').textContent = 'Already have an account?';
        document.getElementById('toggle-form-btn').textContent = 'Sign in';
    }

    authModal.classList.remove('hidden');
    authModal.style.display = 'flex';
}

function closeAuthModal() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.classList.add('hidden');
        authModal.style.display = 'none';
    }
}

function toggleAuthForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm.style.display === 'none') {
        showAuthModal('login');
    } else {
        showAuthModal('register');
    }
}

// Close auth modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('auth-modal');
    if (modal && event.target === modal) {
        closeAuthModal();
    }
});

// ===== Notification Panel System =====
function initNotificationPanel() {
    const notificationBtn = document.getElementById('notification-btn');
    const notificationPanel = document.getElementById('notification-panel');

    if (notificationBtn && notificationPanel) {
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationPanel.classList.toggle('translate-x-full');
        });

        renderNotifications();

        // Close panel when clicking outside
        document.addEventListener('click', function(event) {
            if (!notificationPanel.contains(event.target) && event.target !== notificationBtn) {
                notificationPanel.classList.add('translate-x-full');
            }
        });
    }
}

function renderNotifications() {
    const notificationList = document.getElementById('notification-list');
    if (!notificationList) return;

    notificationList.innerHTML = authManager.notifications.map(notif => `
        <div class="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer">
            <div class="flex items-start gap-3">
                <div class="flex-1">
                    <p class="font-semibold text-gray-900 text-sm">${notif.title}</p>
                    <p class="text-sm text-gray-600 mt-1">${notif.message}</p>
                    <p class="text-xs text-gray-400 mt-2">${notif.time}</p>
                </div>
                <button class="text-gray-400 hover:text-gray-600" onclick="removeNotification(${notif.id})">
                    ✕
                </button>
            </div>
        </div>
    `).join('');
}

function removeNotification(id) {
    authManager.notifications = authManager.notifications.filter(n => n.id !== id);
    renderNotifications();
    updateNotificationBadge();
}

function clearAllNotifications() {
    authManager.notifications = [];
    renderNotifications();
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (badge) {
        const count = authManager.notifications.length;
        if (count === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'flex';
            badge.textContent = count > 9 ? '9+' : count;
        }
    }
}

// ===== Weekly Progress Rendering =====
function renderWeeklyProgress() {
    const container = document.getElementById('weekly-progress-container');
    if (!container) return;

    const progressData = JSON.parse(localStorage.getItem('progress_data')) || [];
    const today = new Date();
    let html = '';

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        
        const dayData = progressData.filter(d => d.date === dateStr);
        const totalHours = dayData.reduce((sum, d) => sum + parseFloat(d.hours || 0), 0);
        const percentage = Math.min(Math.round((totalHours / 3) * 100), 100); // Assuming 3 hours is 100%

        html += `
            <div class="flex-1 min-w-[100px]">
                <div class="bg-gradient-to-b from-amber-50 to-white rounded-xl p-5 text-center border border-amber-100 hover:shadow-md transition-shadow">
                    <div class="text-3xl font-bold text-amber-700 mb-2">${percentage}%</div>
                    <div class="text-sm text-gray-600 font-medium mb-4">${days[date.getDay()]}</div>
                    <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-amber-600 to-orange-600" style="width: ${percentage}%;"></div>
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

// ===== Schedule Page Functions =====
class ScheduleManager {
    constructor() {
        this.scheduleItems = [
            { id: "1", subject: "Mathematics", time: "09:00", duration: "2 hours", completed: false },
            { id: "2", subject: "Physics", time: "11:30", duration: "1.5 hours", completed: true },
            { id: "3", subject: "Chemistry", time: "14:00", duration: "1 hour", completed: false },
            { id: "4", subject: "Biology", time: "16:00", duration: "1.5 hours", completed: false },
        ];
    }

    addItem(subject, time, duration) {
        const newItem = {
            id: Date.now().toString(),
            subject: subject,
            time: time,
            duration: duration,
            completed: false
        };
        this.scheduleItems.push(newItem);
        this.renderSchedule();
        return newItem;
    }

    deleteItem(id) {
        this.scheduleItems = this.scheduleItems.filter(item => item.id !== id);
        this.renderSchedule();
    }

    toggleComplete(id) {
        const item = this.scheduleItems.find(i => i.id === id);
        if (item) {
            item.completed = !item.completed;
            this.renderSchedule();
        }
    }

    renderSchedule() {
        const scheduleContainer = document.getElementById('schedule-list');
        if (!scheduleContainer) return;

        scheduleContainer.innerHTML = this.scheduleItems.map(item => `
            <div class="flex items-center justify-between rounded-xl border ${item.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'} p-4 transition-all">
                <div class="flex items-center gap-4 flex-1">
                    <input 
                        type="checkbox" 
                        ${item.completed ? 'checked' : ''}
                        onchange="scheduleManager.toggleComplete('${item.id}')"
                        class="w-5 h-5 ${item.completed ? 'text-green-600' : 'text-amber-700'} cursor-pointer rounded"
                    >
                    <div>
                        <h4 class="font-semibold ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}">${item.subject}</h4>
                        <p class="text-sm text-gray-600 flex items-center gap-3">
                            <span class="flex items-center gap-1">🕐 ${item.time}</span>
                            <span>•</span>
                            <span>${item.duration}</span>
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <span class="text-sm font-medium ${item.completed ? 'text-green-600' : 'text-gray-600'}">
                        ${item.completed ? '✓ Completed' : 'Not started'}
                    </span>
                    <button class="text-gray-400 hover:text-red-600 transition-colors" onclick="scheduleManager.deleteItem('${item.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }
}

const scheduleManager = new ScheduleManager();

function initSchedulePage() {
    const addBtn = document.getElementById('add-schedule-btn');
    if (!addBtn) return;

    addBtn.addEventListener('click', function() {
        const subject = document.getElementById('subject').value;
        const time = document.getElementById('time').value;
        const duration = document.getElementById('duration').value;

        if (subject && time && duration) {
            scheduleManager.addItem(subject, time, duration);
            document.getElementById('subject').value = '';
            document.getElementById('time').value = '';
            document.getElementById('duration').value = '';
        }
    });

    scheduleManager.renderSchedule();
}

// ===== Resources Page Functions =====
class ResourceManager {
    constructor() {
        this.resources = [
            {
                id: "1",
                title: "Introduction to Calculus",
                type: "video",
                subject: "Mathematics",
                difficulty: "Beginner",
                rating: 4.8,
                url: "#",
            },
            {
                id: "2",
                title: "Quantum Physics Explained",
                type: "article",
                subject: "Physics",
                difficulty: "Advanced",
                rating: 4.6,
                url: "#",
            },
            {
                id: "3",
                title: "Organic Chemistry Notes",
                type: "document",
                subject: "Chemistry",
                difficulty: "Intermediate",
                rating: 4.5,
                url: "#",
            },
            {
                id: "4",
                title: "Biology Lab Manual",
                type: "document",
                subject: "Biology",
                difficulty: "Beginner",
                rating: 4.7,
                url: "#",
            },
            {
                id: "5",
                title: "Linear Algebra Tutorial",
                type: "video",
                subject: "Mathematics",
                difficulty: "Intermediate",
                rating: 4.9,
                url: "#",
            },
            {
                id: "6",
                title: "Thermodynamics Reference",
                type: "link",
                subject: "Physics",
                difficulty: "Intermediate",
                rating: 4.4,
                url: "#",
            },
        ];
        this.selectedType = null;
        this.searchQuery = '';
    }

    getTypeIcon(type) {
        const icons = {
            'video': '🎥',
            'article': '📄',
            'document': '📚',
            'link': '🔗'
        };
        return icons[type] || '📄';
    }

    getDifficultyBadgeClass(difficulty) {
        const classes = {
            'Beginner': 'badge-beginner',
            'Intermediate': 'badge-intermediate',
            'Advanced': 'badge-advanced'
        };
        return classes[difficulty] || '';
    }

    filterResources() {
        return this.resources.filter(resource => {
            const matchesSearch = 
                resource.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                resource.subject.toLowerCase().includes(this.searchQuery.toLowerCase());
            const matchesType = !this.selectedType || resource.type === this.selectedType;
            return matchesSearch && matchesType;
        });
    }

    renderResources() {
        const container = document.getElementById('resources-container');
        if (!container) return;

        const filtered = this.filterResources();
        container.innerHTML = filtered.map(resource => {
            const typeColors = {
                'video': 'bg-blue-100 text-blue-700',
                'article': 'bg-purple-100 text-purple-700',
                'document': 'bg-orange-100 text-orange-700',
                'link': 'bg-gray-100 text-gray-700'
            };
            
            const difficultyColors = {
                'Beginner': 'bg-green-100 text-green-700',
                'Intermediate': 'bg-yellow-100 text-yellow-700',
                'Advanced': 'bg-red-100 text-red-700'
            };

            return `
                <div class="rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-lg transition-all cursor-pointer" onclick="openResourceModal('${resource.id}')">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex h-10 w-10 items-center justify-center rounded-lg ${typeColors[resource.type]}">
                            ${this.getTypeIcon(resource.type)}
                        </div>
                        <div class="flex items-center gap-1 text-yellow-500">
                            <span>⭐</span>
                            <span class="font-medium text-gray-900">${resource.rating}</span>
                        </div>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">${resource.title}</h3>
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-sm text-gray-600">${resource.subject}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="px-3 py-1 rounded-lg text-xs font-medium ${difficultyColors[resource.difficulty]}">${resource.difficulty}</span>
                        <span class="text-amber-700 hover:text-amber-800 text-sm font-medium flex items-center gap-1">
                            Access <span>→</span>
                        </span>
                    </div>
                </div>
            `;
        }).join('');

        if (filtered.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-12"><p class="text-gray-600">No resources found</p></div>';
        }
    }

    setFilter(type) {
        this.selectedType = type;
        this.renderResources();
    }

    setSearch(query) {
        this.searchQuery = query;
        this.renderResources();
    }
}

const resourceManager = new ResourceManager();

function initResourcesPage() {
    const searchInput = document.getElementById('search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            resourceManager.setSearch(e.target.value);
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            
            const type = this.dataset.type;
            if (type === 'all') {
                resourceManager.setFilter(null);
            } else {
                this.classList.add('active');
                resourceManager.setFilter(type);
            }
        });
    });

    resourceManager.renderResources();
}

function openResourceModal(resourceId) {
    const resource = resourceManager.resources.find(r => r.id === resourceId);
    if (!resource) return;

    document.getElementById('modal-resource-title').textContent = resource.title;
    document.getElementById('modal-resource-type').textContent = resource.type.charAt(0).toUpperCase() + resource.type.slice(1);
    document.getElementById('modal-resource-subject').textContent = resource.subject;
    
    const downloadBtn = document.getElementById('modal-download-btn');
    downloadBtn.href = resource.url || '#';
    downloadBtn.textContent = resource.type === 'video' ? '🎥 Open Video' : resource.type === 'article' ? '📄 Read Article' : '📥 Download';

    document.getElementById('resource-modal').classList.remove('hidden');
}

function closeResourceModal() {
    document.getElementById('resource-modal').classList.add('hidden');
}

// Close resource modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('resource-modal');
    if (modal && event.target === modal) {
        closeResourceModal();
    }
});
// ===== Study Groups Page Functions =====
class StudyGroupManager {
    constructor() {
        this.groups = [
            {
                id: "1",
                name: "Calculus Champions",
                subject: "Mathematics",
                members: 8,
                maxMembers: 12,
                nextSession: "Today, 4:00 PM",
                isJoined: true,
                avatars: ["JD", "AS", "MK"],
            },
            {
                id: "2",
                name: "Physics Explorers",
                subject: "Physics",
                members: 5,
                maxMembers: 10,
                nextSession: "Tomorrow, 2:00 PM",
                isJoined: false,
                avatars: ["RB", "LS"],
            },
            {
                id: "3",
                name: "Chemistry Lab Team",
                subject: "Chemistry",
                members: 6,
                maxMembers: 8,
                nextSession: "Wed, 10:00 AM",
                isJoined: true,
                avatars: ["TC", "AK", "NP"],
            },
            {
                id: "4",
                name: "Biology Study Circle",
                subject: "Biology",
                members: 4,
                maxMembers: 10,
                nextSession: "Thu, 3:00 PM",
                isJoined: false,
                avatars: ["SM", "PK"],
            },
            {
                id: "5",
                name: "Programming Wizards",
                subject: "Computer Science",
                members: 10,
                maxMembers: 15,
                nextSession: "Fri, 5:00 PM",
                isJoined: false,
                avatars: ["DV", "RK", "SJ"],
            },
            {
                id: "6",
                name: "History Buffs",
                subject: "History",
                members: 3,
                maxMembers: 8,
                nextSession: "Sat, 11:00 AM",
                isJoined: false,
                avatars: ["AM"],
            },
        ];
        this.searchQuery = '';
    }

    toggleJoin(id) {
        const group = this.groups.find(g => g.id === id);
        if (group) {
            group.isJoined = !group.isJoined;
            group.members += group.isJoined ? 1 : -1;
            this.renderGroups();
        }
    }

    getFilteredGroups(joined = null) {
        let filtered = this.groups.filter(group =>
            group.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            group.subject.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
        
        if (joined !== null) {
            filtered = filtered.filter(g => g.isJoined === joined);
        }
        
        return filtered;
    }

    renderGroupCard(group) {
        const memberAvatars = group.avatars.map(avatar => 
            `<div class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">${avatar}</div>`
        ).join('');

        return `
            <div class="rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-lg transition-all cursor-pointer" onclick="openGroupModal('${group.id}')">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">${group.name}</h3>
                        <p class="text-sm text-gray-600">${group.subject}</p>
                    </div>
                    <span class="px-3 py-1 rounded-lg text-xs font-medium ${group.isJoined ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}">
                        ${group.isJoined ? '✓ Joined' : 'Available'}
                    </span>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="text-center">
                        <p class="text-lg font-bold text-gray-900">${group.members}/${group.maxMembers}</p>
                        <p class="text-xs text-gray-600">Members</p>
                    </div>
                    <div class="text-center">
                        <p class="text-lg font-bold text-gray-900">📅</p>
                        <p class="text-xs text-gray-600">${group.nextSession}</p>
                    </div>
                </div>

                <div class="flex items-center gap-2 mb-4">
                    ${memberAvatars}
                </div>

                <div class="flex gap-2">
                    <button class="flex-1 px-3 py-2 rounded-lg text-sm font-medium ${group.isJoined ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-700 text-white hover:bg-amber-800'} transition" onclick="event.stopPropagation(); studyGroupManager.toggleJoin('${group.id}')">
                        ${group.isJoined ? '✓ Joined' : '+ Join Group'}
                    </button>
                    <button class="flex-1 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition" onclick="event.stopPropagation()">
                        💬 Chat
                    </button>
                </div>
            </div>
        `;
    }

    renderGroups() {
        const myGroupsContainer = document.getElementById('my-groups-container');
        const discoverGroupsContainer = document.getElementById('discover-groups-container');

        if (myGroupsContainer) {
            const myGroups = this.getFilteredGroups(true);
            if (myGroups.length === 0) {
                myGroupsContainer.parentElement.style.display = 'none';
            } else {
                myGroupsContainer.parentElement.style.display = 'block';
                myGroupsContainer.innerHTML = myGroups.map(group => this.renderGroupCard(group)).join('');
            }
        }

        if (discoverGroupsContainer) {
            const discoverGroups = this.getFilteredGroups(false);
            if (discoverGroups.length === 0) {
                discoverGroupsContainer.parentElement.style.display = 'none';
            } else {
                discoverGroupsContainer.parentElement.style.display = 'block';
                discoverGroupsContainer.innerHTML = discoverGroups.map(group => this.renderGroupCard(group)).join('');
            }
        }
    }

    setSearch(query) {
        this.searchQuery = query;
        this.renderGroups();
    }
}

const studyGroupManager = new StudyGroupManager();

function initStudyGroupsPage() {
    const searchInput = document.getElementById('search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            studyGroupManager.setSearch(e.target.value);
        });
    }

    studyGroupManager.renderGroups();
}

function openGroupModal(groupId) {
    const group = studyGroupManager.groups.find(g => g.id === groupId);
    if (!group) return;

    document.getElementById('modal-group-name').textContent = group.name;
    document.getElementById('modal-group-subject').textContent = group.subject;
    document.getElementById('modal-group-members').textContent = `${group.members}/${group.maxMembers}`;
    document.getElementById('modal-group-session').textContent = group.nextSession;
    
    const avatarContainer = document.getElementById('modal-group-avatars');
    avatarContainer.innerHTML = group.avatars.map(avatar => 
        `<div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">${avatar}</div>`
    ).join('');

    const joinBtn = document.getElementById('modal-join-btn');
    joinBtn.textContent = group.isJoined ? '✓ Joined' : 'Join Group';
    joinBtn.onclick = () => {
        studyGroupManager.toggleJoin(groupId);
        closeGroupModal();
    };

    document.getElementById('group-modal').classList.remove('hidden');
}

function closeGroupModal() {
    document.getElementById('group-modal').classList.add('hidden');
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('group-modal');
    if (modal && event.target === modal) {
        closeGroupModal();
    }
});

// ===== Page Detection and Initialization =====
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('schedule')) {
        document.body.classList.add('schedule-page');
        initSchedulePage();
    } else if (currentPage.includes('resources')) {
        document.body.classList.add('resources-page');
        initResourcesPage();
    } else if (currentPage.includes('study-groups')) {
        document.body.classList.add('study-groups-page');
        initStudyGroupsPage();
    }
});
