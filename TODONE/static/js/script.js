document.addEventListener('DOMContentLoaded', function() {
    // Menu Toggle
    const menuButton = document.querySelector('.menu-button');
    const menuDropdown = document.querySelector('.menu-dropdown');
    
    if (menuButton && menuDropdown) {
        menuButton.addEventListener('click', function() {
            menuDropdown.classList.toggle('active');
        });
        
        document.addEventListener('click', function(event) {
            if (!menuButton.contains(event.target) && !menuDropdown.contains(event.target)) {
                menuDropdown.classList.remove('active');
            }
        });
    }
    
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('.material-symbols-rounded') : null;
    const themeText = themeToggle ? themeToggle.querySelector('span:not(.material-symbols-rounded)') : null;
    
    // Initialize theme based on saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (themeIcon && themeText && savedTheme === 'dark') {
            themeIcon.textContent = 'light_mode';
            themeText.textContent = 'Light Mode';
        }
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (themeIcon && themeText) {
                themeIcon.textContent = 'light_mode';
                themeText.textContent = 'Light Mode';
            }
            localStorage.setItem('theme', 'dark');
        }
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            if (themeIcon && themeText) {
                if (newTheme === 'dark') {
                    themeIcon.textContent = 'light_mode';
                    themeText.textContent = 'Light Mode';
                } else {
                    themeIcon.textContent = 'dark_mode';
                    themeText.textContent = 'Dark Mode';
                }
            }
            
            menuDropdown.classList.remove('active');
        });
    }
    
    // Toggle Completed Tasks
    const toggleCompletedBtn = document.getElementById('toggle-completed');
    const completedTasksSection = document.querySelector('.completed-tasks');
    
    if (toggleCompletedBtn && completedTasksSection) {
        toggleCompletedBtn.addEventListener('click', function() {
            const expandIcon = this.querySelector('.material-symbols-rounded');
            completedTasksSection.style.display = completedTasksSection.style.display === 'none' ? 'block' : 'none';
            expandIcon.textContent = completedTasksSection.style.display === 'none' ? 'expand_more' : 'expand_less';
        });
    }
    
    // Add Task Modal
    const addTaskButton = document.getElementById('addTaskButton');
    const addTaskModal = document.getElementById('addTaskModal');
    const cancelTaskButton = document.getElementById('cancelTask');
    
    if (addTaskButton && addTaskModal) {
        addTaskButton.addEventListener('click', function() {
            addTaskModal.classList.add('active');
            const inputField = addTaskModal.querySelector('input[name="content"]');
            if (inputField) {
                setTimeout(() => inputField.focus(), 100);
            }
        });
        
        if (cancelTaskButton) {
            cancelTaskButton.addEventListener('click', function() {
                addTaskModal.classList.remove('active');
                const form = addTaskModal.querySelector('form');
                if (form) form.reset();
            });
        }
        
        addTaskModal.addEventListener('click', function(event) {
            if (event.target === addTaskModal) {
                addTaskModal.classList.remove('active');
                const form = addTaskModal.querySelector('form');
                if (form) form.reset();
            }
        });
    }
});

// Function to toggle task completion status
function toggleTask(taskId) {
    window.location.href = `/toggle_task/${taskId}`;
}

// Function to make task content editable
function makeEditable(element) {
    const span = element.querySelector('span');
    const form = element.querySelector('form');
    const input = form.querySelector('input');
    
    if (span && form && input) {
        span.style.display = 'none';
        form.style.display = 'block';
        input.focus();
        
        // Position cursor at the end of the text
        const textLength = input.value.length;
        input.setSelectionRange(textLength, textLength);
        
        // Submit form on Enter key
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                form.submit();
            }
            
            // Cancel edit on Escape key
            if (e.key === 'Escape') {
                span.style.display = 'block';
                form.style.display = 'none';
            }
        });
        
        // Submit form on blur (when focus is lost)
        input.addEventListener('blur', function() {
            form.submit();
        });
    }
} 