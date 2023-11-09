import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TodoItem } from './todo-response';
import { TodoService } from './todo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatCheckboxModule],
  template: `
    <!-- todo list -->
    <table mat-table [dataSource]="todoItems">
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef>ID</th>
        <td mat-cell *matCellDef="let element">{{ element.id }}</td>
      </ng-container>
      <ng-container matColumnDef="title">
        <th mat-header-cell *matHeaderCellDef>Title</th>
        <td mat-cell *matCellDef="let element">{{ element.title }}</td>
      </ng-container>
      <ng-container matColumnDef="completed">
        <th mat-header-cell *matHeaderCellDef>Completed</th>
        <td mat-cell *matCellDef="let element">
          <mat-checkbox [checked]="element.completed" disabled></mat-checkbox>
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="['id', 'title', 'completed']"></tr>
      <tr
        mat-row
        *matRowDef="let row; columns: ['id', 'title', 'completed']"
      ></tr>
    </table>

    <!-- pagination -->
    <section class="pagination">
      <button
        mat-raised-button
        (click)="goPage(1)"
        [disabled]="pageNumber === 1"
      >
        First Page
      </button>

      <button mat-raised-button (click)="prevPage()" [disabled]="!canGoPrevPage">
        Prev Page
      </button>

      <div class="current-page">{{ pageNumber }} / {{ pageSize }}</div>

      <button mat-raised-button (click)="nextPage()" [disabled]="!canGoNextPage">
        Next Page
      </button>

      <button
        mat-raised-button
        (click)="goPage(pageSize)"
        [disabled]="pageNumber === pageSize"
      >
        Last Page
      </button>
    </section>
  `,
  styles: `
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;

    .current-page {
      margin: 0 10px;
      min-width: 75px;
      text-align: center;
    }

    .mdc-button--raised {
      margin: 0 5px;
    }
  }
  `,
})
export class AppComponent implements OnInit {
  private todoService = inject(TodoService);

  protected canGoNextPage = false;
  protected canGoPrevPage = false;

  protected pageNumber = 1;
  protected pageSize = 10;
  protected todoItems: Array<TodoItem> = [];
  protected total: number = 0;

  ngOnInit(): void {
    this.updateScreen();
  }

  prevPage() {
    if (this.canGoPrevPage) {
      this.pageNumber--;
      this.updateScreen();
    }
  }

  nextPage() {
    if (this.canGoNextPage) {
      this.pageNumber++;
      this.updateScreen();
    }
  }

  goPage(pageNumber: number): void {
    this.pageNumber = pageNumber;
    this.updateScreen();
  }

  updateScreen() {
    this.todoService.getTodo(this.pageNumber).subscribe((response) => {
      this.todoItems = response.data;
      this.total = response.total;
      this.pageSize = response.pageSize;

      this.canGoPrevPage = this.pageNumber > 1;
      this.canGoNextPage = this.pageNumber * this.pageSize < this.total;
    });
  }
}
