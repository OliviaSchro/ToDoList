import { Component, signal } from '@angular/core';
//import { RouterOutlet } from '@angular/router';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms'

interface Todo { // INDIVIDUAL TODO ITEM
  text: string;
  completed: boolean;
  id: number;
}

interface TodoList {
  id: number;
  name: string;
  todos: Todo[];
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  /**--------------------------------------------------------------
   * Setup
  *--------------------------------------------------------------*/
  sidebarOpen = false;

  newListName = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(50)]
  });
  newTodo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(200)]
  });

  lists: TodoList[] = [
    { id: 1, name: 'Get Started',
    todos: [
        { id: 101, text: 'Make a todo list', completed: false},
        { id: 102, text: 'add todo list items', completed: false},
        { id: 103, text: 'Mark them as completed', completed: true},
      ]
    }
  ];

  selectedListId: number = this.lists[0].id;

  /**--------------------------------------------------------------
   * UI ACTIONS & HELPERS
   *--------------------------------------------------------------*/
  toggleSidebar() {this.sidebarOpen = !this.sidebarOpen;}
  selectList(id: number) {this.selectedListId = id;}

  get selectedList(): TodoList | undefined {
    return this.lists.find(l => l.id === this.selectedListId);
  }

  getCompletedCount(): number {return this.selectedList?.todos.filter(t => t.completed).length ?? 0;}
  getRemainingCount(): number {return this.selectedList?.todos.filter(t => !t.completed).length ?? 0;}

  /**--------------------------------------------------------------
   * FUNCTIONS
   *--------------------------------------------------------------*/

  addList() {
    const name = this.newListName.value.trim();
    if (!name) return;
        
    const newList: TodoList = { id: Date.now(), name, todos: [] };
    this.lists = [...this.lists, newList]; // add it to our lists
    this.selectedListId = newList.id;
    this.newListName.reset('');
  }

  deleteList(id: number) {
    // CANT DELETE LAST LIST!
    if(this.lists.length === 1) return;

    const idx = this.lists.findIndex(l => l.id === id);
    if(idx === -1) return; // invalid

    const wasSelected = this.selectedListId === id;
    this.lists = this.lists.filter(l => l.id !== id);

    if (wasSelected) {
      const newIdx = Math.max(0, idx-1); //making sure valid
      this.selectedListId = this.lists[newIdx].id;
    }
  }

  // ! HAVENT IMPLEMENTED YET
  renameList(id: number, name: string) {
    const list = this.lists.find(l => l.id === id);
    if (!list) return;
    list.name = name.trim() || list.name;
  }

  addTodo() {
    const text = this.newTodo.value.trim();
    const list = this.selectedList;
    if (!text || !list) return;
    list.todos = [
      ...list.todos,
      { id: Date.now(), text, completed: false }
    ];
    this.newTodo.reset('');
  }

  toggleTodo(todoId: number) {
    const list = this.selectedList;
    if (!list) return;
    list.todos = list.todos.map(t =>
      t.id === todoId ? {...t, completed: !t.completed } : t
    );
  }

  deleteTodo(todoId: number) {
    const list = this.selectedList;
    if (!list) return;
    list.todos = list.todos.filter(t => t.id !== todoId);
  }
}