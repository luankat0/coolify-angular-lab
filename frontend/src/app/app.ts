
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Task {
  id: number;
  title: string;
  created_at: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private http = inject(HttpClient);

  tasks = signal<Task[]>([]);
  newTitle = signal('');
  busy = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.error.set('');

    this.http.get<Task[]>('/api/tasks').subscribe({
      next: (data) => this.tasks.set(data),
      error: () => this.error.set('Erro ao carregar tarefas.')
    });
  }

  addTask(): void {
    const title = this.newTitle().trim();

    if (!title || this.busy()) return;

    this.busy.set(true);
    this.error.set('');

    this.http.post<Task>('/api/tasks', { title }).subscribe({
      next: (task) => {
        this.tasks.update(items => [task, ...items]);
        this.newTitle.set('');
        this.busy.set(false);
      },
      error: () => {
        this.error.set('Erro ao salvar tarefa.');
        this.busy.set(false);
      }
    });
  }

  removeTask(id: number): void {
    if (this.busy()) return;

    this.busy.set(true);
    this.error.set('');

    this.http.delete<void>(`/api/tasks/${id}`).subscribe({
      next: () => {
        this.tasks.update(items =>
          items.filter(task => task.id !== id)
        );
        this.busy.set(false);
      },
      error: () => {
        this.error.set('Erro ao excluir tarefa.');
        this.busy.set(false);
      }
    });
  }
}
