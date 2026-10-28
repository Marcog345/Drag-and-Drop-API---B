// Tarefas padrão iniciais (iguais ao exemplo fornecido)
const initialTasks = [
  { id: '1', title: 'Redação do Enem', column: 'todo', tag: 'Redação' },
  { id: '2', title: 'Estudar Física (Óptica)', column: 'in-progress', tag: 'Exatas' },
  { id: '3', title: 'Trabalho de História', column: 'done', tag: 'Humanas' }
];

// Carregar tarefas do localStorage ou usar o padrão inicial
let tasks = JSON.parse(localStorage.getItem('enem_kanban_tasks')) || initialTasks;

let draggedCardId = null;

// Elementos da DOM
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskTagSelect = document.getElementById('task-tag');
const containers = document.querySelectorAll('.cards-container');

// Guardar tarefas no localStorage
function saveTasks() {
  localStorage.setItem('enem_kanban_tasks', JSON.stringify(tasks));
}

// Atualizar os contadores de tarefas por coluna
function updateCounts() {
  document.getElementById('count-todo').textContent = tasks.filter(t => t.column === 'todo').length;
  document.getElementById('count-in-progress').textContent = tasks.filter(t => t.column === 'in-progress').length;
  document.getElementById('count-done').textContent = tasks.filter(t => t.column === 'done').length;
}

// Criar o elemento HTML de um cartão
function createCardElement(task) {
  const card = document.createElement('div');
  card.className = 'card';
  card.draggable = true;
  card.dataset.id = task.id;

  card.innerHTML = `
    <div class="card-header">
      <span class="tag" data-tag="${task.tag}">${task.tag}</span>
      <button class="btn-delete" title="Excluir tarefa">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
    <div class="card-title">${task.title}</div>
  `;

  // Evento de Eliminar tarefa
  const deleteBtn = card.querySelector('.btn-delete');
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    tasks = tasks.filter(t => t.id !== task.id);
    saveTasks();
    renderBoard();
  });

  // Eventos Drag and Drop do Cartão
  card.addEventListener('dragstart', (e) => {
    draggedCardId = task.id;
    card.classList.add('dragging');
    e.dataTransfer.setData('text/plain', task.id);
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    draggedCardId = null;
  });

  return card;
}

// Renderizar o quadro
function renderBoard() {
  // Limpar os containers
  containers.forEach(container => container.innerHTML = '');

  // Renderizar cada tarefa na respetiva coluna
  tasks.forEach(task => {
    const container = document.getElementById(task.column);
    if (container) {
      const cardElement = createCardElement(task);
      container.appendChild(cardElement);
    }
  });

  updateCounts();
}

// Configurar as áreas onde os cartões podem ser soltos (Drop Target)
containers.forEach(container => {
  container.addEventListener('dragover', (e) => {
    e.preventDefault(); // Permitir o Drop
    container.classList.add('drag-over');
  });

  container.addEventListener('dragleave', () => {
    container.classList.remove('drag-over');
  });

  container.addEventListener('drop', (e) => {
    e.preventDefault();
    container.classList.remove('drag-over');

    const targetColumn = container.id;

    if (draggedCardId) {
      // Atualizar o estado da tarefa
      const taskIndex = tasks.findIndex(t => t.id === draggedCardId);
      if (taskIndex !== -1) {
        tasks[taskIndex].column = targetColumn;
        saveTasks();
        renderBoard();
      }
    }
  });
});

// Adicionar nova tarefa pelo formulário
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = taskTitleInput.value.trim();
  const tag = taskTagSelect.value;

  if (title) {
    const newTask = {
      id: Date.now().toString(),
      title: title,
      column: 'todo', // Por padrão entra na coluna "A Fazer"
      tag: tag
    };

    tasks.push(newTask);
    saveTasks();
    renderBoard();

    // Limpar o formulário
    taskTitleInput.value = '';
    taskTagSelect.value = 'Geral';
  }
});

// Inicialização
renderBoard();