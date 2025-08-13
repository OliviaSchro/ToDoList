/** LOCAL STORAGE ITEMS
 * lists, selectedListId, sidebarOpen
 */

import { Component, OnInit } from '@angular/core';
//import { RouterOutlet } from '@angular/router';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms'
import { trigger, transition, style, state, animate } from '@angular/animations';

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
  styleUrl: './app.css',
  animations: [
    trigger('itemAnim', [
      // add
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(6px) scale(0.98)' }),
        animate('160ms ease-out', style({ opacity: 1, transform: 'none' })),
      ]),
      // delete
      transition(':leave', [
        // fade + slide + collapse height/padding/margins/border
        animate('200ms ease-in', style({
          opacity: 0,
          transform: 'translateX(-8px)',
          height: 0,
          marginTop: 0,
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0,
          borderWidth: 0
        })),
      ]),
    ]),
    trigger('sidebarAnim', [
      state('closed', style({ transform: 'translateX(-100%)' })),
      state('open',   style({ transform: 'translateX(0)' })),
      transition('closed <=> open', animate('280ms ease'))
    ]),
    trigger('mainAnim', [
      state('closed', style({ transform: 'none' })),
      state('open',   style({ transform: 'translateX(var(--sidebar-w))' })),
      transition('closed <=> open', animate('280ms ease'))
    ])
  ],
})

export class App implements OnInit {
  sidebarOpen = false;
  lists: TodoList[] = [];
  selectedListId: number = 0;

  ngOnInit(): void {
      const savedLists = this.getLists_strg();
      const savedSelectedListId = this.getSelectedListId_strg();
      const savedSidebarOpen = this.getSidebarOpen_strg();

      if(savedLists && savedSelectedListId && savedSidebarOpen) { // there are saved lists! so set global vars here to that
        this.lists = savedLists;
        this.selectedListId = savedSelectedListId;
        this.sidebarOpen = savedSidebarOpen;

      } else { // there are no saved lists so set default
        this.lists = [
          { id: 1, name: 'Get Started',
          todos: [
              { id: 101, text: 'Make a todo list', completed: false},
              { id: 102, text: 'add todo list items', completed: false},
              { id: 103, text: 'Mark them as completed', completed: true},
            ]
          }
        ]; // end of this.lists
        this.selectedListId = this.lists[0].id;
        this.sidebarOpen = false;

        this.update_strg();
      }
  }

  /**--------------------------------------------------------------
   * Setup
  *--------------------------------------------------------------*/

  newListName = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(35)]
  });
  newTodo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(150)]
  });

  /**--------------------------------------------------------------
   * UI ACTIONS & HELPERS
   *--------------------------------------------------------------*/
  get selectedList(): TodoList | undefined {
    return this.lists.find(l => l.id === this.selectedListId);
  }

  getCompletedCount(): number {return this.selectedList?.todos.filter(t => t.completed).length ?? 0;}
  getRemainingCount(): number {return this.selectedList?.todos.filter(t => !t.completed).length ?? 0;}

  /**--------------------------------------------------------------
   * FUNCTIONS
   *--------------------------------------------------------------*/
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.update_strg();
  }
  selectList(id: number) {
    this.selectedListId = id;
    this.update_strg();
  }


  addList() {
    const name = this.newListName.value.trim();
    if (!name) return;
        
    const newList: TodoList = { id: Date.now(), name, todos: [] };
    this.lists = [...this.lists, newList]; // add it to our lists
    this.selectedListId = newList.id;

    this.update_strg(); // UPDATE LOCAL STORAGE

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

    this.update_strg(); // UPDATE LOCAL STORAGE
  }

  // ! HAVENT IMPLEMENTED YET
  renameList(id: number, name: string) {
    const list = this.lists.find(l => l.id === id);
    if (!list) return;
    list.name = name.trim() || list.name;

    this.update_strg(); // UPDATE LOCAL STORAGE
  }

  addTodo() {
    const text = this.newTodo.value.trim();
    const list = this.selectedList;
    if (!text || !list) return;
    list.todos = [
      ...list.todos,
      { id: Date.now(), text, completed: false }
    ];

    this.update_strg(); // UPDATE LOCAL STORAGE

    this.newTodo.reset('');
  }

  toggleTodo(todoId: number) {
    const list = this.selectedList;
    if (!list) return;
    list.todos = list.todos.map(t =>
      t.id === todoId ? {...t, completed: !t.completed } : t
    );

    this.update_strg(); // UPDATE LOCAL STORAGE
  }

  deleteTodo(todoId: number) {
    const list = this.selectedList;
    if (!list) return;
    list.todos = list.todos.filter(t => t.id !== todoId);

    this.update_strg(); // UPDATE LOCAL STORAGE
  }



  // STORAGE --- update when you set the lists and savedListid vars
  update_strg() {
    this.setLists_strg(this.lists);
    this.setSelectedListId_strg(this.selectedListId);
    this.setSidebarOpen(this.sidebarOpen);
  } 
  getSelectedListId_strg(): number | null {
    const id = localStorage.getItem('selectedListId');
    return id ? parseInt(id,10) : null;
  }
  setSelectedListId_strg(id: number): void {
    localStorage.setItem('selectedListId', id.toString());
  }
  getLists_strg(): TodoList[] | null {
    const list = localStorage.getItem('lists');
    return list ? JSON.parse(list) : null;
  }
  setLists_strg(list: TodoList[]): void {
    localStorage.setItem('lists', JSON.stringify(list));
  }
  getSidebarOpen_strg(): boolean | null {
    const sb = localStorage.getItem('sidebarOpen');
    return sb !== null ? JSON.parse(sb) : null;
  }
  setSidebarOpen(sb: boolean): void {
    localStorage.setItem('sidebarOpen', JSON.stringify(sb));
  }
}