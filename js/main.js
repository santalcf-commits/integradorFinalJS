let activities = [];
let activeFilter = 'todas'; 
let searchTerm = '';


/**
 * @returns {number}
 */
const generateId = () => Date.now();

const activityForm = document.getElementById('activityForm');
const activityTableBody = document.getElementById('activityTableBody');
const rowTemplate = document.getElementById('rowTemplate');
const emptyState = document.getElementById('emptyState');
const filterButtons = document.querySelectorAll('.btn-filter');

const statTotal = document.getElementById('statTotal');
const statCompleted = document.getElementById('statCompleted');
const statPending = document.getElementById('statPending');
const statHours = document.getElementById('statHours');


const init = () => {
    if (activityForm) {
        activityForm.addEventListener('submit', handleFormSubmit);
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilterClick);
    });

    updateFilterVisuals(activeFilter);

    renderActivities();
    console.log("Planificador inicializado.");
};
document.addEventListener('DOMContentLoaded', init);
/**
 * @param {string} title
 * @param {string} estimatedTime
 * @returns {boolean}
 */
const validateForm = (title, estimatedTime) => {
    if (title.trim() === '') {
        alert('❌ Error: El título de la actividad no puede estar vacío.');
        return false;
    }

    const timeAsNumber = parseFloat(estimatedTime);

    if (estimatedTime !== '' && (isNaN(timeAsNumber) || timeAsNumber < 0)) {
        alert('❌ Error: El tiempo estimado debe ser un número positivo (0 o mayor).');
        return false;
    }

    return true;
};
/**
 * @param {Event} event
 */
const handleFormSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(activityForm);
    const title = formData.get('title');
    const estimatedTime = formData.get('estimatedTime');
    
    if (!validateForm(title, estimatedTime)) {
        return; 
    }

    const newActivity = {
        id: generateId(),
        title: title.trim(),
        subject: formData.get('subject'),
        type: formData.get('type'),
        difficulty: formData.get('difficulty'),
        priority: formData.get('priority'),
        dueDate: formData.get('deadline'),
        estimatedTime: parseFloat(estimatedTime) || 0,
        notes: formData.get('notes'),
        isImportant: formData.get('isImportant') === 'on',
        isCompleted: false
    };

    activities.push(newActivity);
    
    activityForm.reset();
    renderActivities();
};
/**
 * @param {number} id
 * @returns {object | undefined}
 */
const findActivity = (id) => activities.find(act => act.id === id);

/**
 * @param {Event} event
 */
const handleToggleCompleted = (event) => {
    const row = event.target.closest('tr');
    const activityId = Number(row.dataset.activityId);
    const isChecked = event.target.checked;
    
    const activity = findActivity(activityId);

    if (activity) {
        activity.isCompleted = isChecked;
        row.classList.toggle('activity-completed', isChecked);
    }
    

    updateStats();
};

/**
 * @param {Event} event
 */
const handleDeleteActivity = (event) => {
    const row = event.target.closest('tr');
    const activityId = Number(row.dataset.activityId);

    activities = activities.filter(act => act.id !== activityId);

    renderActivities();
};
/**
 * @param {Object} activity
 * @returns {Node}
 */
const renderRow = (activity) => {
    const newRow = rowTemplate.content.cloneNode(true).querySelector('tr');

    newRow.dataset.activityId = activity.id;
    newRow.classList.toggle('activity-completed', activity.isCompleted);
    
    newRow.querySelector('.row-title').textContent = activity.title;
    newRow.querySelector('.row-subject').textContent = activity.subject;
    newRow.querySelector('.row-type').textContent = activity.type;
    
    const priorityBadge = newRow.querySelector('.badge--priority');
    priorityBadge.textContent = activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1);
    priorityBadge.classList.add(`badge--${activity.priority}`); 

    newRow.querySelector('.row-deadline').textContent = activity.dueDate || '-';
    newRow.querySelector('.row-time').textContent = activity.estimatedTime > 0 ? `${activity.estimatedTime}h` : '-';

    const completedCheckbox = newRow.querySelector('.row-complete');
    completedCheckbox.checked = activity.isCompleted;

    completedCheckbox.addEventListener('change', handleToggleCompleted);
    newRow.querySelector('.btn-delete').addEventListener('click', handleDeleteActivity);
    
    return newRow;
};

const renderActivities = () => {
    const activitiesToRender = activities; 

    activityTableBody.innerHTML = '';

    if (activitiesToRender.length === 0) {

        emptyState.style.display = 'table-row'; 
    } else {
        emptyState.style.display = 'none';
        activitiesToRender.forEach(activity => {
            const row = renderRow(activity);
            activityTableBody.appendChild(row);
        });
    }
    updateStats();
};

const updateStats = () => {
    const total = activities.length;

    const completed = activities.filter(act => act.isCompleted).length;
    const pending = total - completed;

    const totalHours = activities.reduce((sum, act) => sum + act.estimatedTime, 0);
    
    statTotal.textContent = total;
    statCompleted.textContent = completed;
    statPending.textContent = pending;
    statHours.textContent = `${totalHours.toFixed(1)} h`; 
};