document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------
    // UTILERÍAS GLOBALES Y LOCAL STORAGE
    // ----------------------------------------------------------------
    const getCurrentUser = () => localStorage.getItem('currentUser');
    const setCurrentUser = (username) => localStorage.setItem('currentUser', username);
    const clearCurrentUser = () => localStorage.removeItem('currentUser');
    const getTodayDate = () => new Date().toISOString().slice(0, 10); // Formato YYYY-MM-DD

    const getUsers = () => {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    };

    const saveUsers = (users) => {
        localStorage.setItem('users', JSON.stringify(users));
    };

    const getHabits = (username) => {
        const habits = localStorage.getItem(`habits_${username}`);
        return habits ? JSON.parse(habits) : [];
    };

    const saveHabits = (username, habits) => {
        localStorage.setItem(`habits_${username}`, JSON.stringify(habits));
    };
    
    // Función para manejar el cierre de sesión en cualquier página
    const setupLogout = () => {
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                clearCurrentUser();
                window.location.href = 'index.html';
            });
        }
    };


    // ----------------------------------------------------------------
    // LÓGICA DE AUTENTICACIÓN (index.html)
    // ----------------------------------------------------------------
    if (document.getElementById('form-register')) {
        const formRegister = document.getElementById('form-register');
        const formLogin = document.getElementById('form-login');
        const registerFormCard = document.getElementById('register-form');
        const loginFormCard = document.getElementById('login-form');
        const showRegisterBtn = document.getElementById('show-register');
        const showLoginBtn = document.getElementById('show-login');
        const registerMessage = document.getElementById('register-message');
        const loginMessage = document.getElementById('login-message');

        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginFormCard.classList.remove('active');
            registerFormCard.classList.add('active');
            loginMessage.style.display = 'none';
        });

        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            registerFormCard.classList.remove('active');
            loginFormCard.classList.add('active');
            registerMessage.style.display = 'none';
        });

        formRegister.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value.trim();
            const password = document.getElementById('register-password').value.trim();
            let users = getUsers();

            if (users.find(u => u.username === username)) {
                registerMessage.textContent = 'El usuario ya existe.';
                registerMessage.style.display = 'block';
                return;
            }

            users.push({ username, password, userStatus: 'registered' });
            saveUsers(users);

            setCurrentUser(username);
            window.location.href = 'user_data.html';
        });

        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value.trim();
            const users = getUsers();

            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                setCurrentUser(username);
                if (user.userStatus === 'completed') {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'user_data.html';
                }
            } else {
                loginMessage.textContent = 'Usuario o contraseña incorrectos.';
                loginMessage.style.display = 'block';
            }
        });

        const currentUser = getCurrentUser();
        if (currentUser) {
            const users = getUsers();
            const user = users.find(u => u.username === currentUser);
            if (user && user.userStatus === 'completed') {
                 window.location.href = 'dashboard.html';
            } else if (user && user.userStatus === 'registered') {
                window.location.href = 'user_data.html';
            }
        }
    }


    // ----------------------------------------------------------------
    // LÓGICA DE DATOS PERSONALES (user_data.html)
    // ----------------------------------------------------------------
    if (document.getElementById('form-personal-data')) {
        setupLogout(); 
        const currentUser = getCurrentUser();
        const formPersonalData = document.getElementById('form-personal-data');

        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }

        formPersonalData.addEventListener('submit', (e) => {
            e.preventDefault();

            const personalData = {
                name: document.getElementById('user-name').value.trim(),
                lastname: document.getElementById('user-lastname').value.trim(),
                dob: document.getElementById('user-dob').value,
                sex: document.getElementById('user-sex').value,
                weight: parseFloat(document.getElementById('user-weight').value),
                height: parseFloat(document.getElementById('user-height').value),
                activity: document.getElementById('user-activity').value,
            };

            let users = getUsers();
            const userIndex = users.findIndex(u => u.username === currentUser);

            if (userIndex !== -1) {
                users[userIndex].personalData = personalData;
                users[userIndex].userStatus = 'completed'; 
                saveUsers(users);

                window.location.href = 'dashboard.html';
            } else {
                console.error("Usuario no encontrado.");
                alert("Error al guardar los datos.");
                clearCurrentUser();
                window.location.href = 'index.html';
            }
        });
    }


    // ----------------------------------------------------------------
    // LÓGICA DE CREAR HÁBITO (create_habit.html)
    // ----------------------------------------------------------------
    if (document.getElementById('form-add-habit') && window.location.pathname.includes('create_habit.html')) {
        setupLogout(); 
        const currentUser = getCurrentUser();

        // --- Comprobaciones de Seguridad y Estado ---
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }
        const users = getUsers();
        const user = users.find(u => u.username === currentUser);
        if (!user || user.userStatus !== 'completed') {
            window.location.href = 'user_data.html';
            return;
        }
        // --------------------------------------------

        const formAddHabit = document.getElementById('form-add-habit');
        const habitTypeSelect = document.getElementById('habit-type');
        const habitCategorySelect = document.getElementById('habit-category'); 
        const physicalFields = document.getElementById('physical-fields');       
        const goalGroup = document.getElementById('goal-group');


        // LÓGICA DINÁMICA: Mostrar campos según la Categoría
        habitCategorySelect.addEventListener('change', () => {
            const category = habitCategorySelect.value;
            
            document.querySelectorAll('.time-group').forEach(el => el.style.display = 'flex');

            if (category === 'Fisico') {
                physicalFields.style.display = 'block';
            } else {
                physicalFields.style.display = 'none';
            }
            
            document.getElementById('physical-level').required = category === 'Fisico';
            document.getElementById('physical-type').required = category === 'Fisico';
        });
        
        // Lógica para mostrar/ocultar meta/unidad
        habitTypeSelect.addEventListener('change', () => {
            const isCounter = habitTypeSelect.value === 'counter';
            goalGroup.style.display = isCounter ? 'flex' : 'none'; 
            document.getElementById('habit-goal').required = isCounter;
        });

        // Manejar Creación de Hábito
        formAddHabit.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // CAMBIO: Tomamos el Nombre del hábito desde la Descripción
            const description = document.getElementById('habit-description').value.trim();
            const name = description; 
            
            const category = habitCategorySelect.value;
            const timeStart = document.getElementById('time-start').value;
            const timeEnd = document.getElementById('time-end').value;
            const type = habitTypeSelect.value;
            
            const frequency = Array.from(document.querySelectorAll('.frequency-group input[name="frequency"]:checked')).map(cb => cb.value);
            if (frequency.length === 0) {
                 alert('Por favor, selecciona al menos un día de la semana.');
                 return;
            }


            let goal = 1; 
            let unit = '';
            let level = '';
            let exerciseType = '';

            if (type === 'counter') {
                goal = parseInt(document.getElementById('habit-goal').value, 10);
                unit = document.getElementById('habit-unit').value.trim();
            }
            
            if (category === 'Fisico') {
                level = document.getElementById('physical-level').value;
                exerciseType = document.getElementById('physical-type').value;
                if (!level || !exerciseType) {
                    alert('Por favor, selecciona el Nivel y Tipo de ejercicio.');
                    return;
                }
            }

            const newHabit = {
                id: Date.now(), 
                name, // Usamos la descripción como nombre
                category, 
                description, 
                frequency, 
                timeStart, 
                timeEnd, 
                level, 
                exerciseType, 
                type, 
                goal,
                unit,
                log: {}
            };

            let habits = getHabits(currentUser);
            habits.push(newHabit);
            saveHabits(currentUser, habits);

            // Redirigir de vuelta al dashboard después de guardar
            window.location.href = 'dashboard.html';
        });
    }


    // ----------------------------------------------------------------
    // LÓGICA DEL DASHBOARD (dashboard.html)
    // ----------------------------------------------------------------
    if (document.getElementById('dashboard-content')) {
        setupLogout(); 
        
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }

        const users = getUsers();
        const user = users.find(u => u.username === currentUser);

        if (!user || user.userStatus !== 'completed') {
            window.location.href = 'user_data.html';
            return;
        }
        
        const habitsListContainer = document.getElementById('habits-list');
        const noHabitsMessage = document.getElementById('no-habits-message');

        // 4. Renderizar Hábitos
        const renderHabits = (habits) => {
            habitsListContainer.innerHTML = '';

            if (habits.length === 0) {
                noHabitsMessage.style.display = 'block';
                return;
            }
            noHabitsMessage.style.display = 'none';

            const today = getTodayDate();

            habits.forEach(habit => {
                const todayProgress = habit.log[today] || 0;
                let isCompleted = false;
                let progressText = 'Registrar';
                let btnClass = 'complete-btn';
                
                let extendedInfo = `${habit.category} | ${habit.timeStart}-${habit.timeEnd}`;
                if (habit.category === 'Fisico' && habit.level) {
                    extendedInfo += ` | Nivel: ${habit.level}`;
                }

                if (habit.type === 'boolean') {
                    isCompleted = todayProgress >= habit.goal;
                    progressText = isCompleted ? 'Completado <i class="fas fa-check"></i>' : 'Marcar <i class="fas fa-hand-pointer"></i>';
                    if (isCompleted) btnClass += ' disabled';
                } else { 
                    isCompleted = todayProgress >= habit.goal;
                    progressText = `${todayProgress} / ${habit.goal} ${habit.unit}`;
                    btnClass = 'secondary-btn'; 
                }

                const habitCard = document.createElement('div');
                habitCard.className = 'habit-card';
                habitCard.innerHTML = `
                    <div class="habit-info">
                        <h4>${habit.name}</h4>
                        <p>${habit.type === 'boolean' ? 'Meta: Completar' : `Meta: ${habit.goal} ${habit.unit}`}</p>
                        <p style="font-size: 0.85rem; margin-top: 5px;">${extendedInfo}</p>
                    </div>
                    <button class="${btnClass}" data-habit-id="${habit.id}" data-habit-type="${habit.type}" ${isCompleted && habit.type === 'boolean' ? 'disabled' : ''}>
                        ${progressText}
                    </button>
                `;

                habitsListContainer.appendChild(habitCard);
            });

            document.querySelectorAll('.habit-card button').forEach(button => {
                button.addEventListener('click', handleHabitCompletion);
            });
        };

        // 5. Manejar el click en el botón de un Hábito
        const handleHabitCompletion = (e) => {
            const habitId = parseInt(e.currentTarget.dataset.habitId, 10);
            const habitType = e.currentTarget.dataset.habitType;
            let habits = getHabits(currentUser);
            const habitIndex = habits.findIndex(h => h.id === habitId);

            if (habitIndex === -1) return;

            const today = getTodayDate();
            let currentProgress = habits[habitIndex].log[today] || 0;

            if (habitType === 'boolean') {
                if (currentProgress < 1) { 
                    habits[habitIndex].log[today] = 1;
                }
            } else { 
                const logValue = prompt(`¿Cuánto registras hoy de "${habits[habitIndex].name}"? (Unidad: ${habits[habitIndex].unit})`, currentProgress);
                
                if (logValue !== null && !isNaN(parseInt(logValue, 10))) {
                    const value = parseInt(logValue, 10);
                    habits[habitIndex].log[today] = value;
                } else {
                    return; 
                }
            }

            saveHabits(currentUser, habits);
            loadHabitsAndMetrics();
        };


        // 6. Actualizar Gráficas (Métricas)
        const updateMetrics = (habits) => {
            const today = getTodayDate();
            let totalHabits = habits.length;
            let completedToday = 0;
            let totalCompletionPercentage = 0;
            
            if (totalHabits === 0) {
                document.getElementById('general-progress').style.background = 'conic-gradient(var(--border-color) 0%)';
                document.querySelector('#general-progress .progress-text').textContent = '0%';
                document.getElementById('daily-summary').textContent = '0 de 0 hábitos registrados';
                document.getElementById('daily-progress').style.background = 'conic-gradient(var(--border-color) 0%)';
                document.querySelector('#daily-progress .progress-text').textContent = '0/0';
                return;
            }

            habits.forEach(habit => {
                const todayProgress = habit.log[today] || 0;
                const isCompleted = todayProgress >= habit.goal;
                if (isCompleted) {
                    completedToday++;
                }
            });

            const dailyPercent = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;
            
            document.getElementById('daily-summary').textContent = `${completedToday} de ${totalHabits} hábitos registrados`;
            document.querySelector('#daily-progress .progress-text').textContent = `${completedToday}/${totalHabits}`;
            document.getElementById('daily-progress').style.background = `conic-gradient(var(--success-color) ${dailyPercent}%, var(--border-color) ${dailyPercent}%)`;

            totalCompletionPercentage = dailyPercent; 

            document.querySelector('#general-progress .progress-text').textContent = `${Math.round(totalCompletionPercentage)}%`;
            document.getElementById('general-progress').style.background = `conic-gradient(var(--primary-color) ${totalCompletionPercentage}%, var(--border-color) ${totalCompletionPercentage}%)`;
        };


        // 9. Función de Carga Principal
        const loadHabitsAndMetrics = () => {
            const habits = getHabits(currentUser);
            renderHabits(habits);
            updateMetrics(habits);
        };

        // Iniciar la carga del dashboard
        loadHabitsAndMetrics();
    }
});